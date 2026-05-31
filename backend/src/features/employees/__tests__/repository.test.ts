import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    employee: {
      update: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
      findFirst: vi.fn(),
    },
    employeeStudiedFramework: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
    employeeAvailableFramework: {
      deleteMany: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

vi.mock("bcryptjs", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

import {
  createEmployeeWithUser,
  updateEmployee,
  getEmployeeList,
  getEmployeeDetails,
} from "../repository";
import { prisma } from "@/lib/prisma";
import { Gender, EmployeeStatus } from "@prisma/client";

const mockTransaction = vi.mocked(prisma.$transaction);
const mockEmployeeUpdate = vi.mocked(prisma.employee.update);
const mockEmployeeFindMany = vi.mocked(prisma.employee.findMany);
const mockEmployeeFindUnique = vi.mocked(prisma.employee.findUnique);
const mockStudiedDeleteMany = vi.mocked(
  prisma.employeeStudiedFramework.deleteMany,
);
const mockStudiedCreateMany = vi.mocked(
  prisma.employeeStudiedFramework.createMany,
);
const mockAvailableDeleteMany = vi.mocked(
  prisma.employeeAvailableFramework.deleteMany,
);
const mockAvailableCreateMany = vi.mocked(
  prisma.employeeAvailableFramework.createMany,
);

const baseInput = {
  email: "test@example.com",
  birthDate: "1990-01-01",
  name: "山田太郎",
  furigana: "ヤマダタロウ",
  gender: Gender.MALE,
};

beforeEach(() => {
  vi.clearAllMocks();
});

type TxMock = {
  employee: { update: typeof mockEmployeeUpdate };
  employeeStudiedFramework: {
    deleteMany: typeof mockStudiedDeleteMany;
    createMany: typeof mockStudiedCreateMany;
  };
  employeeAvailableFramework: {
    deleteMany: typeof mockAvailableDeleteMany;
    createMany: typeof mockAvailableCreateMany;
  };
};

describe("createEmployeeWithUser", () => {
  it("トランザクション内でUser+Employeeを作成する", async () => {
    const expected = { userId: 1, employeeId: 1 };
    mockTransaction.mockResolvedValue(expected);

    const result = await createEmployeeWithUser(baseInput);

    expect(mockTransaction).toHaveBeenCalledOnce();
    expect(result).toEqual(expected);
  });

  it("トランザクションが失敗した場合エラーを投げる", async () => {
    mockTransaction.mockRejectedValue(new Error("DB error"));

    await expect(createEmployeeWithUser(baseInput)).rejects.toThrow("DB error");
  });
});

describe("updateEmployee", () => {
  const employeeId = 1;
  const updateData = { name: "Updated Name", phone: "09012345678" };

  it("社員情報を更新する", async () => {
    (mockTransaction as unknown as { mockImplementation: (fn: (cb: (tx: TxMock) => Promise<unknown>) => Promise<unknown>) => void }).mockImplementation(async (callback) => {
      return callback({
        employee: { update: mockEmployeeUpdate },
        employeeStudiedFramework: {
          deleteMany: mockStudiedDeleteMany,
          createMany: mockStudiedCreateMany,
        },
        employeeAvailableFramework: {
          deleteMany: mockAvailableDeleteMany,
          createMany: mockAvailableCreateMany,
        },
      });
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

  it("フレームワーク情報を更新する", async () => {
    const frameworkUpdateData = {
      studiedFrameworkIds: [1, 2],
      availableFrameworkIds: [3],
    };

    (mockTransaction as unknown as { mockImplementation: (fn: (cb: (tx: TxMock) => Promise<unknown>) => Promise<unknown>) => void }).mockImplementation(async (callback) => {
      return callback({
        employee: { update: mockEmployeeUpdate },
        employeeStudiedFramework: {
          deleteMany: mockStudiedDeleteMany,
          createMany: mockStudiedCreateMany,
        },
        employeeAvailableFramework: {
          deleteMany: mockAvailableDeleteMany,
          createMany: mockAvailableCreateMany,
        },
      });
    });
    mockEmployeeUpdate.mockResolvedValue({ id: 1 } as never);

    await updateEmployee(employeeId, frameworkUpdateData);

    expect(mockStudiedDeleteMany).toHaveBeenCalledWith({
      where: { employeeId },
    });
    expect(mockStudiedCreateMany).toHaveBeenCalledWith({
      data: [
        { employeeId, frameworkId: 1 },
        { employeeId, frameworkId: 2 },
      ],
    });
    expect(mockAvailableDeleteMany).toHaveBeenCalledWith({
      where: { employeeId },
    });
    expect(mockAvailableCreateMany).toHaveBeenCalledWith({
      data: [{ employeeId, frameworkId: 3 }],
    });
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
        frameworks: Array<{ framework: { frameworkName: string } }>;
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
            frameworks: [{ framework: { frameworkName: "React" } }],
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
        frameworks: ["React"],
        contractPrice: 680000,
        status: EmployeeStatus.WORKING,
      },
      {
        employeeId: 2,
        employeeCode: "EMP002",
        name: "Jane Smith",
        frameworks: [],
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
    trainingEndDate: null,
    studiedFrameworks: [],
    availableFrameworks: [],
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
