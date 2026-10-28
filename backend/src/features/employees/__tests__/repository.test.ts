import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    employee: {
      update: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import {
  findLastEmployeeCode,
  insertEmployee,
  updateEmployee,
  findPreviousCompanyDates,
  getEmployeeList,
  getEmployeeDetails,
} from "../repository";
import { prisma } from "@/lib/prisma";
import {
  Gender,
  EmployeeStatus,
  Specialty,
  WorkStatus,
  Prisma,
} from "@prisma/client";
import { Employee, InvalidDateRangeError } from "../domain/employee";
import {
  DuplicateFieldError,
  EmployeeNotFoundError,
  InvalidSkillIdError,
} from "../errors";

const mockTransaction = vi.mocked(prisma.$transaction);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);
const mockEmployeeUpdate = vi.mocked(prisma.employee.update);
const mockEmployeeFindMany = vi.mocked(prisma.employee.findMany);
const mockEmployeeFindUnique = vi.mocked(prisma.employee.findUnique);
const mockEmployeeFindFirst = vi.mocked(prisma.employee.findFirst);

const baseInput = {
  email: "test@example.com",
  birthDate: "1990-01-01",
  name: "山田太郎",
  furigana: "ヤマダタロウ",
  gender: Gender.MALE,
  specialty: Specialty.UNDECIDED,
  workStatus: WorkStatus.WAITING,
  skills: [],
  projects: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

type TxMock = {
  employee: {
    update: typeof mockEmployeeUpdate;
    findFirst: ReturnType<typeof vi.fn>;
    create: ReturnType<typeof vi.fn>;
  };
  skill: { findMany: ReturnType<typeof vi.fn> };
};

const runTransactionWith = (tx: Partial<TxMock>) => {
  (
    mockTransaction as unknown as {
      mockImplementation: (
        fn: (cb: (tx: TxMock) => Promise<unknown>) => Promise<unknown>,
      ) => void;
    }
  ).mockImplementation(async (callback) => callback(tx as TxMock));
};

describe("findLastEmployeeCode", () => {
  it("既存社員コードの最大値を返す", async () => {
    mockQueryRaw.mockResolvedValue([{ employee_code: "EMP101" }]);

    const result = await findLastEmployeeCode();

    expect(result).toBe("EMP101");
  });

  it("社員が1人もいない場合、nullを返す", async () => {
    mockQueryRaw.mockResolvedValue([]);

    const result = await findLastEmployeeCode();

    expect(result).toBeNull();
  });
});

describe("insertEmployee", () => {
  it("Employee集約が持つ社員コード・変換済みの値をそのまま永続化する", async () => {
    const create = vi.fn().mockResolvedValue({ id: 6 });
    runTransactionWith({
      employee: { findFirst: vi.fn(), create, update: mockEmployeeUpdate },
      skill: { findMany: vi.fn() },
    });
    const employee = Employee.create(baseInput, "EMP005");

    const result = await insertEmployee(employee, baseInput);

    expect(create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ employeeCode: "EMP006" }),
      }),
    );
    expect(result).toEqual({ employeeId: 6 });
  });

  it("一意制約違反（P2002）をDuplicateFieldErrorに変換する", async () => {
    mockTransaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.19.3",
        meta: { target: ["email"] },
      }),
    );
    const employee = Employee.create(baseInput, null);

    const error = await insertEmployee(employee, baseInput).catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DuplicateFieldError);
    expect((error as InstanceType<typeof DuplicateFieldError>).field).toBe(
      "email",
    );
  });

  it("存在しないskillIdの場合、InvalidSkillIdErrorを投げる", async () => {
    runTransactionWith({
      employee: { findFirst: vi.fn(), create: vi.fn(), update: mockEmployeeUpdate },
      skill: { findMany: vi.fn().mockResolvedValue([{ id: 1 }]) },
    });
    const data = {
      ...baseInput,
      skills: [
        { skillId: 1, years: 1 },
        { skillId: 999, years: 1 },
      ],
    };
    const employee = Employee.create(data, null);

    await expect(insertEmployee(employee, data)).rejects.toBeInstanceOf(
      InvalidSkillIdError,
    );
  });
});

describe("updateEmployee", () => {
  const employeeId = 1;
  const updateData = { name: "Updated Name", phone: "09012345678" };

  it("社員情報を更新する", async () => {
    runTransactionWith({
      employee: {
        findFirst: vi.fn().mockResolvedValue({ id: employeeId }),
        update: mockEmployeeUpdate,
        create: vi.fn(),
      },
      skill: { findMany: vi.fn() },
    });
    mockEmployeeUpdate.mockResolvedValue({ id: 1 } as never);

    await updateEmployee(employeeId, updateData);

    expect(mockEmployeeUpdate).toHaveBeenCalledWith({
      where: { id: employeeId },
      data: {
        name: "Updated Name",
        phone: "09012345678",
      },
    });
  });

  it("存在しない社員の場合、EmployeeNotFoundErrorを投げる", async () => {
    runTransactionWith({
      employee: {
        findFirst: vi.fn().mockResolvedValue(null),
        update: mockEmployeeUpdate,
        create: vi.fn(),
      },
      skill: { findMany: vi.fn() },
    });

    await expect(
      updateEmployee(employeeId, updateData),
    ).rejects.toBeInstanceOf(EmployeeNotFoundError);
    expect(mockEmployeeUpdate).not.toHaveBeenCalled();
  });

  it("一意制約違反（P2002）をDuplicateFieldErrorに変換する", async () => {
    mockTransaction.mockRejectedValue(
      new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
        code: "P2002",
        clientVersion: "6.19.3",
        meta: { target: ["my_number"] },
      }),
    );

    const error = await updateEmployee(employeeId, updateData).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(DuplicateFieldError);
    expect((error as InstanceType<typeof DuplicateFieldError>).field).toBe(
      "my_number",
    );
  });

  it("案件履歴の日付が不正な場合、InvalidDateRangeErrorを投げ更新しない", async () => {
    runTransactionWith({
      employee: {
        findFirst: vi.fn().mockResolvedValue({ id: employeeId }),
        update: mockEmployeeUpdate,
        create: vi.fn(),
      },
      skill: { findMany: vi.fn() },
    });

    await expect(
      updateEmployee(employeeId, {
        projects: [
          {
            active: false,
            projectName: "案件A",
            factory: "現場A",
            skills: [],
            startDate: "2026-02-01",
            endDate: "2026-01-01",
            contracts: [],
          },
        ],
      }),
    ).rejects.toBeInstanceOf(InvalidDateRangeError);
    expect(mockEmployeeUpdate).not.toHaveBeenCalled();
  });

  it("skillsが重複している場合、例外を投げ更新しない", async () => {
    await expect(
      updateEmployee(employeeId, {
        skills: [
          { skillId: 1, years: 1 },
          { skillId: 1, years: 2 },
        ],
      }),
    ).rejects.toThrow("スキルが重複して指定されています");
    expect(mockEmployeeUpdate).not.toHaveBeenCalled();
  });
});

describe("findPreviousCompanyDates", () => {
  it("保存済みの前職日付をYYYY-MM-DD文字列に変換して返す", async () => {
    mockEmployeeFindFirst.mockResolvedValue({
      previousCompany1StartDate: new Date("2020-01-01"),
      previousCompany1EndDate: new Date("2020-12-31"),
      previousCompany2StartDate: null,
      previousCompany2EndDate: null,
      previousCompany3StartDate: null,
      previousCompany3EndDate: null,
    } as never);

    const result = await findPreviousCompanyDates(1);

    expect(mockEmployeeFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1, isDelete: false } }),
    );
    expect(result).toEqual({
      previousCompany1StartDate: "2020-01-01",
      previousCompany1EndDate: "2020-12-31",
      previousCompany2StartDate: null,
      previousCompany2EndDate: null,
      previousCompany3StartDate: null,
      previousCompany3EndDate: null,
    });
  });

  it("存在しない・論理削除済みの場合、nullを返す", async () => {
    mockEmployeeFindFirst.mockResolvedValue(null);

    const result = await findPreviousCompanyDates(9999);

    expect(result).toBeNull();
  });
});

describe("getEmployeeList", () => {
  const buildEmployee = (
    overrides: Partial<{
      id: number;
      employeeCode: string;
      name: string;
      assignments: Array<{
        status: EmployeeStatus;
        contractPrice: number | null;
        startDate: Date | null;
      }>;
    }>,
  ) => ({
    id: 1,
    employeeCode: "EMP001",
    name: "John Doe",
    assignments: [],
    ...overrides,
  });

  it("社員一覧を取得する (アサインありの場合: 言語/単価/状態を返す)", async () => {
    mockEmployeeFindMany.mockResolvedValue([
      buildEmployee({
        id: 1,
        employeeCode: "EMP001",
        name: "John Doe",
        assignments: [
          {
            status: EmployeeStatus.WORKING,
            contractPrice: 680000,
            startDate: new Date("2026-01-01"),
          },
        ],
      }),
      buildEmployee({
        id: 2,
        employeeCode: "EMP002",
        name: "Jane Smith",
        assignments: [],
      }),
    ] as never);

    const result = await getEmployeeList();

    expect(mockEmployeeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { isDelete: false },
      }),
    );
    expect(result).toEqual([
      {
        employeeId: 1,
        employeeCode: "EMP001",
        name: "John Doe",
        contractPrice: 680000,
        status: EmployeeStatus.WORKING,
      },
      {
        employeeId: 2,
        employeeCode: "EMP002",
        name: "Jane Smith",
        contractPrice: null,
        status: null,
      },
    ]);
  });

  it("社員コードでフィルタリングする (部分一致)", async () => {
    mockEmployeeFindMany.mockResolvedValue([] as never);

    await getEmployeeList({ employeeCode: "EMP001" });

    expect(mockEmployeeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isDelete: false,
          employeeCode: { contains: "EMP001" },
        },
      }),
    );
  });

  it("名前でフィルタリングする (部分一致)", async () => {
    mockEmployeeFindMany.mockResolvedValue([] as never);

    await getEmployeeList({ name: "John" });

    expect(mockEmployeeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isDelete: false,
          name: { contains: "John" },
        },
      }),
    );
  });

  it("複数のフィルタを適用する", async () => {
    mockEmployeeFindMany.mockResolvedValue([] as never);

    await getEmployeeList({ employeeCode: "EMP001", name: "John" });

    expect(mockEmployeeFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          isDelete: false,
          employeeCode: { contains: "EMP001" },
          name: { contains: "John" },
        },
      }),
    );
  });
});

describe("getEmployeeDetails", () => {
  const employeeId = 1;
  const expectedDetails = {
    id: employeeId,
    employeeCode: "EMP001",
    userId: 1,
    name: "John Doe",
    furigana: "ヤマダタロウ",
    email: "test@example.com",
    birthDate: new Date("1990-01-01"),
    gender: Gender.MALE,
    phone: null,
    joinDate: null,
    specialty: "UNDECIDED",
    workStatus: "WAITING",
    gitHub: null,
    trainingEndDate: null,
    previousCompany1Name: null,
    previousCompany1StartDate: null,
    previousCompany1EndDate: null,
    previousCompany2Name: null,
    previousCompany2StartDate: null,
    previousCompany2EndDate: null,
    previousCompany3Name: null,
    previousCompany3StartDate: null,
    previousCompany3EndDate: null,
    weeklyWorkHours: null,
    monthlyEstimatedSalary: null,
    postalCode: null,
    prefecture: null,
    city: null,
    streetAddress: null,
    nearestStation: null,
    emergencyContactName: null,
    emergencyContactRelationship: null,
    emergencyContactPhone: null,
    hasSpouse: null,
    hasChildren: null,
    hasDependents: null,
    myNumber: null,
    employmentInsuranceNumber: null,
    basicPensionNumber: null,
    salaryAccount: null,
    isDelete: false,
    createrId: null,
    createdAt: new Date("2026-01-01"),
    updaterId: null,
    updatedAt: new Date("2026-01-01"),
  };

  it("社員の詳細情報を取得する", async () => {
    mockEmployeeFindUnique.mockResolvedValue(expectedDetails as never);

    const result = await getEmployeeDetails(employeeId);

    expect(mockEmployeeFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: employeeId },
      }),
    );
    expect(result).toEqual(expectedDetails);
  });

  it("存在しない社員の場合nullを返す", async () => {
    mockEmployeeFindUnique.mockResolvedValue(null);

    const result = await getEmployeeDetails(9999);

    expect(result).toBeNull();
  });
});
