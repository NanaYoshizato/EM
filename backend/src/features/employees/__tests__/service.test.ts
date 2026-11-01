import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  createEmployee,
  updateEmployee,
  getEmployeeListService,
  getEmployeeDetailsService,
} from "../service";

vi.mock("../repository", () => ({
  getEmployeeList: vi.fn(),
  getEmployeeDetails: vi.fn(),
}));

import { getEmployeeList, getEmployeeDetails } from "../repository";

import { Gender, EmployeeStatus, Specialty, WorkStatus } from "@prisma/client";
import {
  ConcurrentUpdateError,
  DuplicateFieldError,
  Employee,
  InvalidSkillIdError,
} from "../domain/employee";
import type { EmployeeRepository } from "../domain/types";

const mockGetEmployeeList = vi.mocked(getEmployeeList);
const mockGetEmployeeDetails = vi.mocked(getEmployeeDetails);

/** テスト用のリポジトリ（ポートを満たす偽物） */
const repository = {
  findLastEmployeeCode: vi.fn<EmployeeRepository["findLastEmployeeCode"]>(),
  findById: vi.fn<EmployeeRepository["findById"]>(),
  insert: vi.fn<EmployeeRepository["insert"]>(),
  update: vi.fn<EmployeeRepository["update"]>(),
};

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

const storedEmployee = () =>
  Employee.reconstruct({
    id: 1,
    version: new Date("2026-10-01T00:00:00Z"),
    employeeCode: "EMP001",
    profile: {
      name: "山田太郎",
      specialty: "UNDECIDED",
      workStatus: "WAITING",
    },
    skills: [],
    projectHistories: [],
  });

beforeEach(() => {
  vi.clearAllMocks();
  repository.findLastEmployeeCode.mockResolvedValue(null);
  repository.insert.mockResolvedValue(1);
});

describe("createEmployee", () => {
  it("最大コードの読み込み→社員を作る→DBに保存の順に呼び、決めた社員コードで保存する", async () => {
    repository.findLastEmployeeCode.mockResolvedValue("EMP005");
    repository.insert.mockResolvedValue(6);

    const result = await createEmployee(repository, baseInput);

    expect(result).toEqual({ code: "SUCCESS", employeeId: 6 });
    const saved = repository.insert.mock.calls[0]![0];
    expect(saved.employeeCode).toBe("EMP006");
    expect(saved.profile.name).toBe("山田太郎");
  });

  it("メールアドレス重複時に結果値として返す", async () => {
    repository.insert.mockRejectedValue(new DuplicateFieldError("email"));

    const result = await createEmployee(repository, baseInput);

    expect(result).toEqual({
      code: "DUPLICATE_EMAIL",
      message: "メールアドレスが既に使用されています",
    });
  });

  it("マイナンバー重複時に結果値として返す", async () => {
    repository.insert.mockRejectedValue(new DuplicateFieldError("myNumber"));

    const result = await createEmployee(repository, baseInput);

    expect(result).toEqual({
      code: "DUPLICATE_MY_NUMBER",
      message: "マイナンバーが既に使用されています",
    });
    expect(repository.insert).toHaveBeenCalledTimes(1);
  });

  it("存在しないskillIdの場合、結果値として返す", async () => {
    repository.insert.mockRejectedValue(new InvalidSkillIdError());

    const result = await createEmployee(repository, baseInput);

    expect(result).toEqual({
      code: "INVALID_SKILL_ID",
      message: "指定されたスキルが存在しません",
    });
  });

  it("スキルが重複している場合、DBに保存せずに結果値を返す", async () => {
    const result = await createEmployee(repository, {
      ...baseInput,
      skills: [
        { skillId: 1, years: 1 },
        { skillId: 1, years: 2 },
      ],
    });

    expect(result).toEqual({
      code: "DUPLICATE_SKILL",
      message: "スキルが重複して指定されています",
    });
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it("案件履歴の日付が不正な場合、DBに保存せずに結果値を返す", async () => {
    const result = await createEmployee(repository, {
      ...baseInput,
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
    });

    expect(result).toEqual({
      code: "INVALID_DATE_RANGE",
      message: "案件履歴の終了日は開始日以降である必要があります",
    });
    expect(repository.insert).not.toHaveBeenCalled();
  });

  it("社員コードの衝突時はリトライし、再取得した最新コードで採番し直して成功する", async () => {
    repository.findLastEmployeeCode
      .mockResolvedValueOnce("EMP001")
      .mockResolvedValueOnce("EMP002");
    repository.insert
      .mockRejectedValueOnce(new DuplicateFieldError("employeeCode"))
      .mockResolvedValueOnce(3);

    const result = await createEmployee(repository, baseInput);

    expect(result).toEqual({ code: "SUCCESS", employeeId: 3 });
    expect(repository.insert.mock.calls[1]![0].employeeCode).toBe("EMP003");
  });

  it("社員コードの衝突が上限回数を超えたら諦めて結果値を返す", async () => {
    repository.insert.mockRejectedValue(new DuplicateFieldError("employeeCode"));

    const result = await createEmployee(repository, baseInput);

    expect(result).toEqual({
      code: "DUPLICATE_EMPLOYEE_CODE",
      message: "社員コードが重複しました。もう一度お試しください",
    });
    expect(repository.insert).toHaveBeenCalledTimes(4);
  });

  it("想定外のエラーはそのまま投げる（controllerで500になる）", async () => {
    repository.findLastEmployeeCode.mockRejectedValue(new Error("DB接続エラー"));

    await expect(createEmployee(repository, baseInput)).rejects.toThrow(
      "DB接続エラー",
    );
  });
});

describe("updateEmployee", () => {
  beforeEach(() => {
    repository.findById.mockResolvedValue(storedEmployee());
  });

  it("DBから読み込む→変更→DBに保存する", async () => {
    const result = await updateEmployee(repository, 1, { name: "山田花子" });

    expect(result).toEqual({ code: "SUCCESS" });
    expect(repository.findById).toHaveBeenCalledWith(1);
    const saved = repository.update.mock.calls[0]![0];
    expect(saved.profile.name).toBe("山田花子");
  });

  it("読み込み後に他の更新が入っていたら、読み込み直してやり直す", async () => {
    repository.update
      .mockRejectedValueOnce(new ConcurrentUpdateError())
      .mockResolvedValueOnce(undefined);

    const result = await updateEmployee(repository, 1, { name: "山田花子" });

    expect(result).toEqual({ code: "SUCCESS" });
    expect(repository.findById).toHaveBeenCalledTimes(2);
  });

  it("やり直しても衝突が続く場合、上限回数で諦めてCONFLICTを返す", async () => {
    repository.update.mockRejectedValue(new ConcurrentUpdateError());

    const result = await updateEmployee(repository, 1, { name: "山田花子" });

    expect(result).toEqual({
      code: "CONFLICT",
      message: "他の更新と競合しました。もう一度お試しください",
    });
    expect(repository.update).toHaveBeenCalledTimes(4);
  });

  it("やり直す間に社員が削除されていた場合、NOT_FOUNDを返す", async () => {
    repository.findById
      .mockResolvedValueOnce(storedEmployee())
      .mockResolvedValueOnce(null);
    repository.update.mockRejectedValueOnce(new ConcurrentUpdateError());

    const result = await updateEmployee(repository, 1, { name: "山田花子" });

    expect(result).toEqual({ code: "NOT_FOUND" });
  });

  it("存在しない社員の場合、NOT_FOUNDを返し更新しない", async () => {
    repository.findById.mockResolvedValue(null);

    const result = await updateEmployee(repository, 999, { name: "山田花子" });

    expect(result).toEqual({ code: "NOT_FOUND" });
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("前職の日付が保存済みの値と合わせて不正な場合、更新せずに結果値を返す", async () => {
    repository.findById.mockResolvedValue(
      Employee.reconstruct({
        id: 1,
        version: new Date("2026-10-01T00:00:00Z"),
        employeeCode: "EMP001",
        profile: {
          name: "山田太郎",
          specialty: "UNDECIDED",
          workStatus: "WAITING",
          previousCompany1StartDate: "2020-02-01",
        },
        skills: [],
        projectHistories: [],
      }),
    );

    const result = await updateEmployee(repository, 1, {
      previousCompany1EndDate: "2020-01-01",
    });

    expect(result).toEqual({
      code: "INVALID_DATE_RANGE",
      message: "前職1社目の終了日は開始日以降である必要があります",
    });
    expect(repository.update).not.toHaveBeenCalled();
  });

  it("マイナンバー重複時に結果値として返す", async () => {
    repository.update.mockRejectedValue(new DuplicateFieldError("myNumber"));

    const result = await updateEmployee(repository, 1, {
      myNumber: "123456789012",
    });

    expect(result).toEqual({
      code: "DUPLICATE_MY_NUMBER",
      message: "マイナンバーが既に使用されています",
    });
  });

  it("存在しないskillIdの場合、結果値として返す", async () => {
    repository.update.mockRejectedValue(new InvalidSkillIdError());

    const result = await updateEmployee(repository, 1, {
      skills: [{ skillId: 999, years: 1 }],
    });

    expect(result).toEqual({
      code: "INVALID_SKILL_ID",
      message: "指定されたスキルが存在しません",
    });
  });

  it("スキルが重複している場合、DBに保存せずに結果値を返す", async () => {
    const result = await updateEmployee(repository, 1, {
      skills: [
        { skillId: 2, years: 1 },
        { skillId: 2, years: 2 },
      ],
    });

    expect(result).toEqual({
      code: "DUPLICATE_SKILL",
      message: "スキルが重複して指定されています",
    });
    expect(repository.update).not.toHaveBeenCalled();
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
