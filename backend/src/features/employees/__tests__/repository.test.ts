import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    employee: {
      update: vi.fn(),
      findMany: vi.fn(),
      findUnique: vi.fn(),
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

vi.mock("bcrypt", () => ({
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
import { Gender } from "@prisma/client";

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
  password: "password123",
  birthDate: "1990-01-01",
  name: "山田太郎",
  furigana: "ヤマダタロウ",
  gender: Gender.MALE,
};

beforeEach(() => {
  vi.clearAllMocks();
});

const expectedResult = {
  employeeId: "emp-1",
  name: "Updated Name",
  phone: "09012345678",
  userId: "user-1",
  furigana: "ヤマダタロウ",
  email: "test@example.com",
  birthDate: new Date("1995-01-01"),
  gender: Gender.MALE,
  joinDate: null,
  trainingEndDate: null,
  studiedFrameworkIds: ["fw-1", "fw-2"],
  availableFrameworkIds: ["fw-3"] as string[],
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

describe("createEmployeeWithUser", () => {
  it("トランザクション内でUser+Employeeを作成する", async () => {
    const expected = { userId: "user-1", employeeId: "emp-1" };
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
  const employeeId = "emp-1";
  const updateData = { name: "Updated Name", phone: "09012345678" };

  it("社員情報を更新する", async () => {
    mockTransaction.mockImplementation(async (callback) => {
      const result = await callback({
        employee: { update: mockEmployeeUpdate },
        employeeStudiedFramework: {
          deleteMany: mockStudiedDeleteMany,
          createMany: mockStudiedCreateMany,
        },
        employeeAvailableFramework: {
          deleteMany: mockAvailableDeleteMany,
          createMany: mockAvailableCreateMany,
        },
      } as any);
      return result;
    });
    mockEmployeeUpdate.mockResolvedValue(expectedResult);

    const result = await updateEmployee(employeeId, updateData);

    expect(mockEmployeeUpdate).toHaveBeenCalledWith({
      where: { employeeId: employeeId },
      data: {
        name: "Updated Name",
        phone: "09012345678",
      },
    });
    expect(result).toEqual(expectedResult);
  });

  it("フレームワーク情報を更新する", async () => {
    const frameworkUpdateData = {
      studiedFrameworkIds: ["fw-1", "fw-2"],
      availableFrameworkIds: ["fw-3"],
    };

    const resultWithFrameworks = {
      ...expectedResult,
      studiedFrameworkIds: ["fw-1", "fw-2"],
      availableFrameworkIds: ["fw-3"],
    };

    mockTransaction.mockImplementation(async (callback) => {
      const result = await callback({
        employee: { update: mockEmployeeUpdate },
        employeeStudiedFramework: {
          deleteMany: mockStudiedDeleteMany,
          createMany: mockStudiedCreateMany,
        },
        employeeAvailableFramework: {
          deleteMany: mockAvailableDeleteMany,
          createMany: mockAvailableCreateMany,
        },
      } as any);
      return result;
    });
    mockEmployeeUpdate.mockResolvedValue(resultWithFrameworks);

    await updateEmployee(employeeId, frameworkUpdateData);

    expect(mockStudiedDeleteMany).toHaveBeenCalledWith({
      where: { employeeId },
    });
    expect(mockStudiedCreateMany).toHaveBeenCalledWith({
      data: [
        { employeeId, frameworkId: "fw-1" },
        { employeeId, frameworkId: "fw-2" },
      ],
    });
    expect(mockAvailableDeleteMany).toHaveBeenCalledWith({
      where: { employeeId },
    });
    expect(mockAvailableCreateMany).toHaveBeenCalledWith({
      data: [{ employeeId, frameworkId: "fw-3" }],
    });
  });
});

describe("getEmployeeList", () => {
  const expectedList = [
    {
      ...expectedResult,
      employeeId: "emp-1",
      name: "John Doe",
    },
    {
      ...expectedResult,
      employeeId: "emp-2",
      name: "Jane Smith",
    },
  ] as const;

  it("社員一覧を取得する", async () => {
    mockEmployeeFindMany.mockResolvedValue([...expectedList]);

    const result = await getEmployeeList();

    expect(mockEmployeeFindMany).toHaveBeenCalledWith({
      select: {
        employeeId: true,
        name: true,
      },
      where: {
        isDelete: false,
      },
    });
    expect(result).toEqual(expectedList);
  });

  it("社員IDでフィルタリングする", async () => {
    const filters = { employeeId: "emp-1" };
    mockEmployeeFindMany.mockResolvedValue([expectedList[0]]);

    const result = await getEmployeeList(filters);

    expect(mockEmployeeFindMany).toHaveBeenCalledWith({
      select: {
        employeeId: true,
        name: true,
      },
      where: {
        isDelete: false,
        employeeId: "emp-1",
      },
    });
    expect(result).toEqual([expectedList[0]]);
  });

  it("名前でフィルタリングする", async () => {
    const filters = { name: "John" };
    mockEmployeeFindMany.mockResolvedValue([expectedList[0]]);

    const result = await getEmployeeList(filters);

    expect(mockEmployeeFindMany).toHaveBeenCalledWith({
      select: {
        employeeId: true,
        name: true,
      },
      where: {
        isDelete: false,
        name: {
          contains: "John",
          mode: "insensitive",
        },
      },
    });
    expect(result).toEqual([expectedList[0]]);
  });

  it("複数のフィルタを適用する", async () => {
    const filters = { employeeId: "emp-1", name: "John" };
    mockEmployeeFindMany.mockResolvedValue([expectedList[0]]);

    const result = await getEmployeeList(filters);

    expect(mockEmployeeFindMany).toHaveBeenCalledWith({
      select: {
        employeeId: true,
        name: true,
      },
      where: {
        isDelete: false,
        employeeId: "emp-1",
        name: {
          contains: "John",
          mode: "insensitive",
        },
      },
    });
    expect(result).toEqual([expectedList[0]]);
  });
});

describe("getEmployeeDetails", () => {
  const employeeId = "emp-1";
  const expectedDetails = {
    ...expectedResult,
    employeeId: employeeId,
    name: "John Doe",
    studiedFrameworkIds: ["fw-1"], // ID配列に変更
    availableFrameworkIds: ["fw-2"], // ID配列に変更
  };

  it("社員の詳細情報を取得する", async () => {
    mockEmployeeFindUnique.mockResolvedValue(expectedDetails);

    const result = await getEmployeeDetails(employeeId);

    expect(mockEmployeeFindUnique).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { employeeId: employeeId },
      }),
    );
    expect(result).toEqual(expectedDetails);
  });

  it("存在しない社員の場合nullを返す", async () => {
    mockEmployeeFindUnique.mockResolvedValue(null);

    const result = await getEmployeeDetails("non-existent-id");

    expect(result).toBeNull();
  });
});
