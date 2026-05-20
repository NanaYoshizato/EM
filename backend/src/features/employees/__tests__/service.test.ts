import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createEmployee,
  updateEmployeeService,
  getEmployeeListService,
  getEmployeeDetailsService,
} from "../service";

vi.mock("../repository", () => ({
  createEmployeeWithUser: vi.fn(),
  updateEmployee: vi.fn(),
  getEmployeeList: vi.fn(),
  getEmployeeDetails: vi.fn(),
}));

import {
  createEmployeeWithUser,
  updateEmployee,
  getEmployeeList,
  getEmployeeDetails,
} from "../repository";

import { Gender } from "@prisma/client";

const mockCreateEmployeeWithUser = vi.mocked(createEmployeeWithUser);
const mockUpdateEmployee = vi.mocked(updateEmployee);
const mockGetEmployeeList = vi.mocked(getEmployeeList);
const mockGetEmployeeDetails = vi.mocked(getEmployeeDetails);

const baseInput = {
  email: "test@example.com",
  password: "password123",
  name: "山田太郎",
  furigana: "ヤマダタロウ",
  birthDate: "1990-01-01",
  gender: Gender.MALE,
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEmployee", () => {
  it("正常に社員とユーザーを作成する", async () => {
    const expected = { userId: "user-1", employeeId: "emp-1" };
    mockCreateEmployeeWithUser.mockResolvedValue(expected);

    const result = await createEmployee(baseInput);

    expect(mockCreateEmployeeWithUser).toHaveBeenCalledWith(baseInput);
    expect(result).toEqual(expected);
  });

  it("メールアドレス重複時にエラーを投げる", async () => {
    mockCreateEmployeeWithUser.mockRejectedValue(
      new Error("Unique constraint failed on the fields: (`email`)"),
    );

    await expect(createEmployee(baseInput)).rejects.toThrow(
      "Unique constraint",
    );
  });

  it("フレームワーク情報を含めて登録できる", async () => {
    const input = {
      ...baseInput,
      studiedFrameworkIds: ["fw-1", "fw-2"],
      availableFrameworkIds: ["fw-3"],
    };

    const expected = { userId: "user-2", employeeId: "emp-2" };
    mockCreateEmployeeWithUser.mockResolvedValue(expected);

    const result = await createEmployee(input);

    expect(mockCreateEmployeeWithUser).toHaveBeenCalledWith(input);
    expect(result).toEqual(expected);
  });

  it("オプションフィールドなしで登録できる", async () => {
    const expected = { userId: "user-3", employeeId: "emp-3" };
    mockCreateEmployeeWithUser.mockResolvedValue(expected);

    const result = await createEmployee(baseInput);

    expect(result).toEqual(expected);
  });
});

describe("updateEmployeeService", () => {
  const employeeId = "emp-1";

  const updateData = {
    name: "Updated Name",
    phone: "09012345678",
  };

  const expectedResult = {
    employee_id: employeeId,
    userId: "user-1",
    name: "Updated Name",
    furigana: "ヤマダタロウ",
    email: "test@example.com",
    birthDate: new Date("1995-01-01"),
    gender: Gender.MALE,
    phone: "09012345678",
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
    creater_id: null,
    createAt: new Date("2026-01-01"),
    updater_id: null,
    updateAt: new Date("2026-01-01"),
  };

  it("正常に社員情報を更新する", async () => {
    mockUpdateEmployee.mockResolvedValue(expectedResult);

    const result = await updateEmployeeService(employeeId, updateData);

    expect(mockUpdateEmployee).toHaveBeenCalledWith(employeeId, updateData);
    expect(result).toEqual(expectedResult);
  });

  it("更新データが空の場合でも正常に動作する", async () => {
    const emptyUpdateData = {};
    mockUpdateEmployee.mockResolvedValue(expectedResult);

    const result = await updateEmployeeService(employeeId, emptyUpdateData);

    expect(mockUpdateEmployee).toHaveBeenCalledWith(
      employeeId,
      emptyUpdateData,
    );
    expect(result).toEqual(expectedResult);
  });
});

describe("getEmployeeListService", () => {
  const expectedList = [
    { employee_id: "emp-1", name: "John Doe" },
    { employee_id: "emp-2", name: "Jane Smith" },
  ];

  it("社員一覧を取得する", async () => {
    mockGetEmployeeList.mockResolvedValue(expectedList);

    const result = await getEmployeeListService();

    expect(mockGetEmployeeList).toHaveBeenCalledWith(undefined);
    expect(result).toEqual(expectedList);
  });

  it("フィルタなしで全件取得する", async () => {
    mockGetEmployeeList.mockResolvedValue(expectedList);

    const result = await getEmployeeListService({});

    expect(mockGetEmployeeList).toHaveBeenCalledWith({});
    expect(result).toEqual(expectedList);
  });

  it("社員IDでフィルタリングして取得する", async () => {
    const filters = { employeeId: "emp-1" };

    mockGetEmployeeList.mockResolvedValue([
      { employee_id: "emp-1", name: "John Doe" },
    ]);

    const result = await getEmployeeListService(filters);

    expect(mockGetEmployeeList).toHaveBeenCalledWith(filters);
    expect(result).toEqual([{ employee_id: "emp-1", name: "John Doe" }]);
  });

  it("名前でフィルタリングして取得する", async () => {
    const filters = { name: "John" };

    mockGetEmployeeList.mockResolvedValue([
      { employee_id: "emp-1", name: "John Doe" },
    ]);

    const result = await getEmployeeListService(filters);

    expect(mockGetEmployeeList).toHaveBeenCalledWith(filters);
    expect(result).toEqual([{ employee_id: "emp-1", name: "John Doe" }]);
  });

  it("空の社員一覧を返す", async () => {
    mockGetEmployeeList.mockResolvedValue([]);

    const result = await getEmployeeListService();

    expect(result).toEqual([]);
  });
});

describe("getEmployeeDetailsService", () => {
  const employeeId = "emp-1";

  const expectedDetails = {
    employee_id: employeeId,
    userId: "user-1",
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
    creater_id: null,
    createAt: new Date("2026-01-01"),
    updater_id: null,
    updateAt: new Date("2026-01-01"),
  };

  it("社員の詳細情報を取得する", async () => {
    mockGetEmployeeDetails.mockResolvedValue(expectedDetails);

    const result = await getEmployeeDetailsService(employeeId);

    expect(mockGetEmployeeDetails).toHaveBeenCalledWith(employeeId);
    expect(result).toEqual(expectedDetails);
  });

  it("存在しない社員IDの場合nullを返す", async () => {
    mockGetEmployeeDetails.mockResolvedValue(null);

    const result = await getEmployeeDetailsService("non-existent-id");

    expect(result).toBeNull();
  });
});
