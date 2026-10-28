import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createEmployee,
  updateEmployeeService,
  getEmployeeListService,
  getEmployeeDetailsService,
} from "../service";

vi.mock("../repository", () => ({
  findLastEmployeeCode: vi.fn(),
  insertEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  findPreviousCompanyDates: vi.fn(),
  getEmployeeList: vi.fn(),
  getEmployeeDetails: vi.fn(),
}));

import {
  findLastEmployeeCode,
  insertEmployee,
  updateEmployee,
  findPreviousCompanyDates,
  getEmployeeList,
  getEmployeeDetails,
} from "../repository";

import { Gender, EmployeeStatus, Specialty, WorkStatus } from "@prisma/client";
import { Employee, InvalidDateRangeError } from "../domain/employee";
import {
  DuplicateFieldError,
  EmployeeNotFoundError,
  InvalidSkillIdError,
} from "../errors";

const mockFindLastEmployeeCode = vi.mocked(findLastEmployeeCode);
const mockInsertEmployee = vi.mocked(insertEmployee);
const mockUpdateEmployee = vi.mocked(updateEmployee);
const mockFindPreviousCompanyDates = vi.mocked(findPreviousCompanyDates);
const mockGetEmployeeList = vi.mocked(getEmployeeList);
const mockGetEmployeeDetails = vi.mocked(getEmployeeDetails);

const baseInput = {
  email: "test@example.com",
  name: "山田太郎",
  furigana: "ヤマダタロウ",
  birthDate: "1990-01-01",
  gender: Gender.MALE,
  specialty: Specialty.UNDECIDED,
  workStatus: WorkStatus.WAITING,
  skills: [],
  projects: [],
};

beforeEach(() => {
  vi.clearAllMocks();
  mockFindLastEmployeeCode.mockResolvedValue(null);
});

describe("createEmployee", () => {
  it("正常に社員を作成する（最新コード取得→Employee生成→永続化の順に呼ぶ）", async () => {
    mockFindLastEmployeeCode.mockResolvedValue("EMP005");
    mockInsertEmployee.mockResolvedValue({ employeeId: 1 });

    const result = await createEmployee(baseInput);

    expect(mockFindLastEmployeeCode).toHaveBeenCalledOnce();
    expect(mockInsertEmployee).toHaveBeenCalledWith(
      expect.any(Employee),
      baseInput,
    );
    expect(mockInsertEmployee.mock.calls[0]![0].employeeCode).toBe("EMP006");
    expect(result).toEqual({ code: "SUCCESS", employeeId: 1 });
  });

  it("メールアドレス重複時に結果値として返す", async () => {
    mockInsertEmployee.mockRejectedValue(new DuplicateFieldError("email"));

    const result = await createEmployee(baseInput);

    expect(result).toEqual({ code: "DUPLICATE_EMAIL" });
  });

  it("マイナンバー重複時に結果値として返す", async () => {
    mockInsertEmployee.mockRejectedValue(
      new DuplicateFieldError("my_number"),
    );

    const result = await createEmployee(baseInput);

    expect(result).toEqual({ code: "DUPLICATE_MY_NUMBER" });
  });

  it("存在しないskillIdの場合、結果値として返す", async () => {
    mockInsertEmployee.mockRejectedValue(new InvalidSkillIdError());

    const result = await createEmployee(baseInput);

    expect(result).toEqual({ code: "INVALID_SKILL_ID" });
  });

  it("案件履歴の日付が不正な場合、永続化を呼ばずに結果値を返す（Employee.createが事前に検出）", async () => {
    const invalidInput = {
      ...baseInput,
      projects: [
        {
          active: true,
          projectName: "案件A",
          factory: "現場A",
          skills: [],
          startDate: "2026-01-10",
          endDate: "2026-01-01",
          contracts: [],
        },
      ],
    };

    const result = await createEmployee(invalidInput as never);

    expect(result).toEqual({
      code: "INVALID_DATE_RANGE",
      message: "案件履歴の終了日は開始日以降である必要があります",
    });
    expect(mockInsertEmployee).not.toHaveBeenCalled();
  });

  it("社員コードの衝突時はリトライし、再取得した最新コードで採番し直して成功する", async () => {
    mockFindLastEmployeeCode
      .mockResolvedValueOnce("EMP005")
      .mockResolvedValueOnce("EMP006");
    mockInsertEmployee
      .mockRejectedValueOnce(new DuplicateFieldError("employee_code"))
      .mockResolvedValueOnce({ employeeId: 7 });

    const result = await createEmployee(baseInput);

    expect(mockFindLastEmployeeCode).toHaveBeenCalledTimes(2);
    expect(mockInsertEmployee).toHaveBeenCalledTimes(2);
    expect(mockInsertEmployee.mock.calls[0]![0].employeeCode).toBe("EMP006");
    expect(mockInsertEmployee.mock.calls[1]![0].employeeCode).toBe("EMP007");
    expect(result).toEqual({ code: "SUCCESS", employeeId: 7 });
  });

  it("社員コードの衝突が上限回数を超えたら諦めて結果値を返す", async () => {
    mockInsertEmployee.mockRejectedValue(
      new DuplicateFieldError("employee_code"),
    );

    const result = await createEmployee(baseInput);

    expect(mockInsertEmployee).toHaveBeenCalledTimes(4);
    expect(result).toEqual({ code: "DUPLICATE_EMPLOYEE_CODE" });
  });

  it("employee_code以外の重複はリトライせず即座に結果値を返す", async () => {
    mockInsertEmployee.mockRejectedValue(new DuplicateFieldError("email"));

    const result = await createEmployee(baseInput);

    expect(mockInsertEmployee).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ code: "DUPLICATE_EMAIL" });
  });
});

describe("updateEmployeeService", () => {
  const employeeId = 1;
  const updateData = { name: "Updated Name", phone: "09012345678" };

  it("正常に社員情報を更新する（前職日付が無ければマージ検証をスキップする）", async () => {
    mockUpdateEmployee.mockResolvedValue({ id: employeeId } as never);

    const result = await updateEmployeeService(employeeId, updateData);

    expect(mockFindPreviousCompanyDates).not.toHaveBeenCalled();
    expect(mockUpdateEmployee).toHaveBeenCalledWith(employeeId, updateData);
    expect(result).toEqual({ code: "SUCCESS" });
  });

  it("更新データが空の場合でも正常に動作する", async () => {
    const emptyUpdateData = {};
    mockUpdateEmployee.mockResolvedValue({ id: employeeId } as never);

    const result = await updateEmployeeService(employeeId, emptyUpdateData);

    expect(mockUpdateEmployee).toHaveBeenCalledWith(
      employeeId,
      emptyUpdateData,
    );
    expect(result).toEqual({ code: "SUCCESS" });
  });

  it("案件履歴の日付が不正な場合（updateEmployee内部で検出）、結果値に変換する", async () => {
    mockUpdateEmployee.mockRejectedValue(
      new InvalidDateRangeError("案件履歴の終了日は開始日以降である必要があります"),
    );

    const result = await updateEmployeeService(employeeId, updateData);

    expect(result).toEqual({
      code: "INVALID_DATE_RANGE",
      message: "案件履歴の終了日は開始日以降である必要があります",
    });
  });

  it("存在しない社員の場合、結果値として返す", async () => {
    mockUpdateEmployee.mockRejectedValue(new EmployeeNotFoundError());

    const result = await updateEmployeeService(employeeId, updateData);

    expect(result).toEqual({ code: "NOT_FOUND" });
  });

  it("マイナンバー重複時に結果値として返す", async () => {
    mockUpdateEmployee.mockRejectedValue(new DuplicateFieldError("my_number"));

    const result = await updateEmployeeService(employeeId, updateData);

    expect(result).toEqual({ code: "DUPLICATE_MY_NUMBER" });
  });

  it("存在しないskillIdの場合、結果値として返す", async () => {
    mockUpdateEmployee.mockRejectedValue(new InvalidSkillIdError());

    const result = await updateEmployeeService(employeeId, updateData);

    expect(result).toEqual({ code: "INVALID_SKILL_ID" });
  });

  describe("前職日付のマージ検証", () => {
    it("片方だけ送られてきた場合、保存済みの値とマージして検証する", async () => {
      mockFindPreviousCompanyDates.mockResolvedValue({
        previousCompany1StartDate: "2020-02-01",
        previousCompany1EndDate: null,
        previousCompany2StartDate: null,
        previousCompany2EndDate: null,
        previousCompany3StartDate: null,
        previousCompany3EndDate: null,
      });

      const result = await updateEmployeeService(employeeId, {
        previousCompany1EndDate: "2020-01-01",
      });

      expect(mockFindPreviousCompanyDates).toHaveBeenCalledWith(employeeId);
      expect(result).toEqual({
        code: "INVALID_DATE_RANGE",
        message: "前職1社目の終了日は開始日以降である必要があります",
      });
      expect(mockUpdateEmployee).not.toHaveBeenCalled();
    });

    it("マージ結果が正しければ更新処理に進む", async () => {
      mockFindPreviousCompanyDates.mockResolvedValue({
        previousCompany1StartDate: "2020-01-01",
        previousCompany1EndDate: null,
        previousCompany2StartDate: null,
        previousCompany2EndDate: null,
        previousCompany3StartDate: null,
        previousCompany3EndDate: null,
      });
      mockUpdateEmployee.mockResolvedValue({ id: employeeId } as never);

      const result = await updateEmployeeService(employeeId, {
        previousCompany1EndDate: "2020-12-31",
      });

      expect(mockUpdateEmployee).toHaveBeenCalled();
      expect(result).toEqual({ code: "SUCCESS" });
    });

    it("対象社員が存在しない場合、NOT_FOUNDを返し更新処理を呼ばない", async () => {
      mockFindPreviousCompanyDates.mockResolvedValue(null);

      const result = await updateEmployeeService(employeeId, {
        previousCompany1EndDate: "2020-01-01",
      });

      expect(result).toEqual({ code: "NOT_FOUND" });
      expect(mockUpdateEmployee).not.toHaveBeenCalled();
    });

    it("開始日だけ送られてきた場合、保存済みの終了日とマージして検証する", async () => {
      mockFindPreviousCompanyDates.mockResolvedValue({
        previousCompany1StartDate: null,
        previousCompany1EndDate: "2020-01-01",
        previousCompany2StartDate: null,
        previousCompany2EndDate: null,
        previousCompany3StartDate: null,
        previousCompany3EndDate: null,
      });

      const result = await updateEmployeeService(employeeId, {
        previousCompany1StartDate: "2020-02-01",
      });

      expect(result).toEqual({
        code: "INVALID_DATE_RANGE",
        message: "前職1社目の終了日は開始日以降である必要があります",
      });
      expect(mockUpdateEmployee).not.toHaveBeenCalled();
    });

    it("保存済みの値が既に不正でも、両方とも新しい値で上書きされれば検証を通る", async () => {
      mockFindPreviousCompanyDates.mockResolvedValue({
        previousCompany1StartDate: "2020-02-01",
        previousCompany1EndDate: "2020-01-01",
        previousCompany2StartDate: null,
        previousCompany2EndDate: null,
        previousCompany3StartDate: null,
        previousCompany3EndDate: null,
      });
      mockUpdateEmployee.mockResolvedValue({ id: employeeId } as never);

      const result = await updateEmployeeService(employeeId, {
        previousCompany1StartDate: "2021-01-01",
        previousCompany1EndDate: "2021-12-31",
      });

      expect(mockUpdateEmployee).toHaveBeenCalled();
      expect(result).toEqual({ code: "SUCCESS" });
    });
  });
});

describe("getEmployeeListService", () => {
  const expectedList = [
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

  it("社員コードでフィルタリングして取得する", async () => {
    const filters = { employeeCode: "EMP001" };
    mockGetEmployeeList.mockResolvedValue([expectedList[0]!]);

    const result = await getEmployeeListService(filters);

    expect(mockGetEmployeeList).toHaveBeenCalledWith(filters);
    expect(result).toEqual([expectedList[0]]);
  });

  it("名前でフィルタリングして取得する", async () => {
    const filters = { name: "John" };
    mockGetEmployeeList.mockResolvedValue([expectedList[0]!]);

    const result = await getEmployeeListService(filters);

    expect(mockGetEmployeeList).toHaveBeenCalledWith(filters);
    expect(result).toEqual([expectedList[0]]);
  });

  it("空の社員一覧を返す", async () => {
    mockGetEmployeeList.mockResolvedValue([]);

    const result = await getEmployeeListService();

    expect(result).toEqual([]);
  });
});

describe("getEmployeeDetailsService", () => {
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
    mockGetEmployeeDetails.mockResolvedValue(expectedDetails as never);

    const result = await getEmployeeDetailsService(employeeId);

    expect(mockGetEmployeeDetails).toHaveBeenCalledWith(employeeId);
    expect(result).toEqual(expectedDetails);
  });

  it("存在しない社員IDの場合nullを返す", async () => {
    mockGetEmployeeDetails.mockResolvedValue(null);

    const result = await getEmployeeDetailsService(1000);

    expect(result).toBeNull();
  });
});
