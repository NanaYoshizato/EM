import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    employee: {
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
  },
}));

import {
  employeeRepository,
  getEmployeeList,
  getEmployeeDetails,
  findEmployeeSummaryByUserId,
} from "../repository";
import { prisma } from "@/lib/prisma";
import { Gender, EmployeeStatus, Specialty, WorkStatus, Prisma } from "@prisma/client";
import {
  ConcurrentUpdateError,
  DuplicateFieldError,
  Employee,
  InvalidSkillIdError,
} from "../domain/employee";

const mockTransaction = vi.mocked(prisma.$transaction);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);
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

/** トランザクション内で使うtxの偽物を作り、$transactionのコールバックに渡す */
const runTransaction = () => {
  const tx = {
    employee: {
      create: vi.fn().mockResolvedValue({ id: 6 }),
      update: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    skill: { findMany: vi.fn().mockResolvedValue([]) },
    employeeSkill: { deleteMany: vi.fn() },
    employeeProjectHistory: { deleteMany: vi.fn() },
    employeeProjectHistorySkill: { deleteMany: vi.fn() },
    employeeProjectContract: { deleteMany: vi.fn() },
  };
  (
    mockTransaction as unknown as {
      mockImplementation: (
        fn: (cb: (t: typeof tx) => Promise<unknown>) => Promise<unknown>,
      ) => void;
    }
  ).mockImplementation(async (callback) => callback(tx));
  return tx;
};

const p2002 = (column: string) =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.19.3",
    meta: { target: [column] },
  });

const storedEmployee = () =>
  Employee.reconstruct({
    id: 1,
    version: new Date("2026-10-01T00:00:00Z"),
    employeeCode: "EMP001",
    profile: { name: "山田太郎", specialty: "UNDECIDED", workStatus: "WAITING" },
    skills: [{ skillId: 1, years: 1 }],
    projectHistories: [],
  });

describe("findLastEmployeeCode", () => {
  it("既存社員コードの最大値を返す", async () => {
    mockQueryRaw.mockResolvedValue([{ employee_code: "EMP101" }]);

    const result = await employeeRepository.findLastEmployeeCode();

    expect(result).toBe("EMP101");
  });

  it("社員が1人もいない場合、nullを返す", async () => {
    mockQueryRaw.mockResolvedValue([]);

    const result = await employeeRepository.findLastEmployeeCode();

    expect(result).toBeNull();
  });
});

describe("findById", () => {
  it("DBの値から社員を組み立てる（nullはundefined、日付は文字列に変換）", async () => {
    mockEmployeeFindFirst.mockResolvedValue({
      id: 1,
      employeeCode: "EMP001",
      name: "山田太郎",
      specialty: "UNDECIDED",
      workStatus: "WAITING",
      furigana: null,
      birthDate: new Date("1990-01-01"),
      joinDate: new Date("2026-04-01"),
      previousCompany1StartDate: null,
      hasSpouse: true,
      updatedAt: new Date("2026-10-01T00:00:00Z"),
      employeeSkills: [{ skillId: 1, years: 2.5 }],
      projectHistories: [
        {
          active: false,
          projectName: "案件A",
          factory: "現場A",
          startDate: new Date("2026-01-01"),
          endDate: null,
          skills: [{ skillId: 1 }],
          contracts: [{ startDate: new Date("2026-01-01"), unitPrice: null }],
        },
      ],
    } as never);

    const employee = await employeeRepository.findById(1);

    expect(mockEmployeeFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1, isDelete: false } }),
    );
    expect(employee?.id).toBe(1);
    expect(employee?.version).toEqual(new Date("2026-10-01T00:00:00Z"));
    expect(employee?.profile.furigana).toBeUndefined();
    expect(employee?.profile.birthDate).toBe("1990-01-01");
    expect(employee?.profile.joinDate).toBe("2026-04-01");
    expect(employee?.profile.hasSpouse).toBe(true);
    expect(employee?.skills).toEqual([{ skillId: 1, years: 2.5 }]);
    expect(employee?.projectHistories[0]).toMatchObject({
      startDate: "2026-01-01",
      endDate: undefined,
      skillIds: [1],
      contracts: [{ startDate: "2026-01-01", unitPrice: undefined }],
    });
  });

  it("存在しない・論理削除済みの場合、nullを返す", async () => {
    mockEmployeeFindFirst.mockResolvedValue(null);

    expect(await employeeRepository.findById(999)).toBeNull();
  });
});

describe("insert", () => {
  it("集約の社員コード・基本情報・子テーブルを保存し、採番されたidを返す", async () => {
    const tx = runTransaction();
    const employee = Employee.create(
      { ...baseInput, hasSpouse: "有", joinDate: "2026-04" },
      "EMP005",
    );

    const id = await employeeRepository.insert(employee);

    expect(id).toBe(6);
    const data = tx.employee.create.mock.calls[0]![0].data;
    expect(data.employeeCode).toBe("EMP006");
    expect(data.name).toBe("山田太郎");
    expect(data.hasSpouse).toBe(true);
    expect(data.joinDate).toEqual(new Date("2026-04"));
    expect(data.phone).toBeNull();
    expect(data.employeeSkills).toEqual({ create: [] });
  });

  it("重複禁止の制約違反（P2002）を、ドメインの項目名付きのDuplicateFieldErrorに変換する", async () => {
    mockTransaction.mockRejectedValue(p2002("my_number"));

    const error = await employeeRepository
      .insert(Employee.create(baseInput, null))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DuplicateFieldError);
    expect((error as DuplicateFieldError).field).toBe("myNumber");
  });

  it("想定外のカラムの重複禁止の制約違反は、そのまま投げる", async () => {
    const original = p2002("user_id");
    mockTransaction.mockRejectedValue(original);

    await expect(
      employeeRepository.insert(Employee.create(baseInput, null)),
    ).rejects.toBe(original);
  });

  it("存在しないskillIdの場合、InvalidSkillIdErrorを投げる", async () => {
    const tx = runTransaction();
    tx.skill.findMany.mockResolvedValue([{ id: 1 }]);
    const employee = Employee.create(
      {
        ...baseInput,
        skills: [
          { skillId: 1, years: 1 },
          { skillId: 999, years: 1 },
        ],
      },
      null,
    );

    await expect(employeeRepository.insert(employee)).rejects.toBeInstanceOf(
      InvalidSkillIdError,
    );
    expect(tx.employee.create).not.toHaveBeenCalled();
  });
});

describe("update", () => {
  it("読み込んだ時点のupdatedAtを条件に基本情報を更新し、差し替えていない子テーブルには触れない", async () => {
    const tx = runTransaction();
    const employee = storedEmployee();
    employee.update({ name: "山田花子" });

    await employeeRepository.update(employee);

    const args = tx.employee.updateMany.mock.calls[0]![0];
    expect(args.where).toEqual({
      id: 1,
      isDelete: false,
      updatedAt: new Date("2026-10-01T00:00:00Z"),
    });
    expect(args.data.name).toBe("山田花子");
    expect(tx.employee.update).not.toHaveBeenCalled();
    expect(tx.employeeSkill.deleteMany).not.toHaveBeenCalled();
    expect(tx.employeeProjectHistory.deleteMany).not.toHaveBeenCalled();
  });

  it("読み込み後に他の更新・削除が入っていた場合（更新件数0）、ConcurrentUpdateErrorを投げ何もしない", async () => {
    const tx = runTransaction();
    tx.employee.updateMany.mockResolvedValue({ count: 0 });
    const employee = storedEmployee();
    employee.update({ skills: [{ skillId: 2, years: 1 }] });

    await expect(employeeRepository.update(employee)).rejects.toBeInstanceOf(
      ConcurrentUpdateError,
    );
    expect(tx.employeeSkill.deleteMany).not.toHaveBeenCalled();
    expect(tx.employee.update).not.toHaveBeenCalled();
  });

  it("スキル・案件履歴を差し替えた場合、物理削除してから作り直す", async () => {
    const tx = runTransaction();
    tx.skill.findMany.mockResolvedValue([{ id: 2 }]);
    const employee = storedEmployee();
    employee.update({
      skills: [{ skillId: 2, years: 3 }],
      projects: [
        {
          active: false,
          projectName: "案件B",
          factory: "現場B",
          skills: [2],
          startDate: "2026-01-01",
          contracts: [],
        },
      ],
    });

    await employeeRepository.update(employee);

    expect(tx.employeeSkill.deleteMany).toHaveBeenCalledWith({
      where: { employeeId: 1 },
    });
    expect(tx.employeeProjectHistorySkill.deleteMany).toHaveBeenCalledWith({
      where: { projectHistory: { employeeId: 1 } },
    });
    expect(tx.employeeProjectContract.deleteMany).toHaveBeenCalledWith({
      where: { projectHistory: { employeeId: 1 } },
    });
    expect(tx.employeeProjectHistory.deleteMany).toHaveBeenCalledWith({
      where: { employeeId: 1 },
    });
    const data = tx.employee.update.mock.calls[0]![0].data;
    expect(data.employeeSkills).toEqual({
      create: [{ skillId: 2, years: 3 }],
    });
    expect(data.projectHistories.create[0].projectName).toBe("案件B");
  });

  it("存在しないskillIdの場合、InvalidSkillIdErrorを投げ更新しない", async () => {
    const tx = runTransaction();
    const employee = storedEmployee();
    employee.update({ skills: [{ skillId: 999, years: 1 }] });

    await expect(employeeRepository.update(employee)).rejects.toBeInstanceOf(
      InvalidSkillIdError,
    );
    expect(tx.employeeSkill.deleteMany).not.toHaveBeenCalled();
  });

  it("重複禁止の制約違反（P2002）をDuplicateFieldErrorに変換する", async () => {
    mockTransaction.mockRejectedValue(p2002("my_number"));
    const employee = storedEmployee();

    const error = await employeeRepository.update(employee).catch((e: unknown) => e);

    expect((error as DuplicateFieldError).field).toBe("myNumber");
  });

  it("未登録（idがnull）の社員は更新できない", async () => {
    await expect(
      employeeRepository.update(Employee.create(baseInput, null)),
    ).rejects.toThrow("未登録の社員は更新できません");
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

describe("findEmployeeSummaryByUserId", () => {
  it("論理削除済みを除いて、社員番号と氏名だけを取得する", async () => {
    mockEmployeeFindFirst.mockResolvedValue({
      employeeCode: "EMP005",
      name: "山田太郎",
    } as never);

    const result = await findEmployeeSummaryByUserId(1);

    expect(mockEmployeeFindFirst).toHaveBeenCalledWith({
      where: { userId: 1, isDelete: false },
      select: { employeeCode: true, name: true },
    });
    expect(result).toEqual({ employeeCode: "EMP005", name: "山田太郎" });
  });
});
