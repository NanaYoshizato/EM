import { describe, it, expect, vi, beforeEach } from "vitest";
import { Gender } from "@prisma/client";

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("../service", () => ({
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  getEmployeeListService: vi.fn(),
  getEmployeeDetailsService: vi.fn(),
}));

import {
  createEmployee,
  updateEmployee,
  getEmployeeListService,
  getEmployeeDetailsService,
} from "../service";
import { employeeRepository } from "../repository";
import {
  createEmployeeController,
  updateEmployeeController,
  getEmployeeListController,
  getEmployeeDetailsController,
  mapEmployeeDetailsResponse,
} from "../controller";

type CreateCtx = Parameters<typeof createEmployeeController>[0];
type UpdateCtx = Parameters<typeof updateEmployeeController>[0];
type ListCtx = Parameters<typeof getEmployeeListController>[0];
type DetailsCtx = Parameters<typeof getEmployeeDetailsController>[0];

const mockCreateEmployee = vi.mocked(createEmployee);
const mockUpdateEmployee = vi.mocked(updateEmployee);
const mockGetEmployeeListService = vi.mocked(getEmployeeListService);
const mockGetEmployeeDetailsService = vi.mocked(getEmployeeDetailsService);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEmployeeController", () => {
  it("should return 201 with no body", async () => {
    const body = { email: "test@example.com", name: "Test" };
    const expectedResponse = { status: 201 };
    mockCreateEmployee.mockResolvedValue({ code: "SUCCESS", employeeId: 1 });
    const c = {
      req: {
        valid: vi.fn().mockReturnValue(body),
      },
      body: vi.fn().mockReturnValue(expectedResponse),
      json: vi.fn(),
    } as unknown as CreateCtx;

    const result = await createEmployeeController(c, vi.fn());

    expect(c.req.valid).toHaveBeenCalledWith("json");
    expect(mockCreateEmployee).toHaveBeenCalledWith(employeeRepository, body);
    expect(c.body).toHaveBeenCalledWith(null, 201);
    expect(result).toBe(expectedResponse);
  });

  it("should return 400 when email is duplicate", async () => {
    const body = { email: "test@example.com", name: "Test" };
    mockCreateEmployee.mockResolvedValue({
      code: "DUPLICATE_EMAIL",
      message: "メールアドレスが既に使用されています",
    });
    const c = {
      req: {
        valid: vi.fn().mockReturnValue(body),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 400 }),
    } as unknown as CreateCtx;

    const result = await createEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "メールアドレスが既に使用されています" },
      400,
    );
    expect(result).toEqual({ status: 400 });
  });

  it("should return 400 when myNumber is duplicate", async () => {
    const body = { email: "test@example.com", name: "Test" };
    mockCreateEmployee.mockResolvedValue({
      code: "DUPLICATE_MY_NUMBER",
      message: "マイナンバーが既に使用されています",
    });
    const c = {
      req: { valid: vi.fn().mockReturnValue(body) },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 400 }),
    } as unknown as CreateCtx;

    await createEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "マイナンバーが既に使用されています" },
      400,
    );
  });

  it("should return 400 when skillId does not exist", async () => {
    const body = { email: "test@example.com", name: "Test" };
    mockCreateEmployee.mockResolvedValue({
      code: "INVALID_SKILL_ID",
      message: "指定されたスキルが存在しません",
    });
    const c = {
      req: { valid: vi.fn().mockReturnValue(body) },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 400 }),
    } as unknown as CreateCtx;

    await createEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "指定されたスキルが存在しません" },
      400,
    );
  });

  it("スキルが重複している場合は400を返す", async () => {
    const body = { email: "test@example.com", name: "Test" };
    mockCreateEmployee.mockResolvedValue({
      code: "DUPLICATE_SKILL",
      message: "スキルが重複して指定されています",
    });
    const c = {
      req: { valid: vi.fn().mockReturnValue(body) },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 400 }),
    } as unknown as CreateCtx;

    await createEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "スキルが重複して指定されています" },
      400,
    );
  });
});

describe("updateEmployeeController", () => {
  it("should return 200 with no body", async () => {
    const updateBody = { name: "Updated Name" };
    const expectedResponse = { status: 200 };
    mockUpdateEmployee.mockResolvedValue({ code: "SUCCESS" });
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: 1 }),
        valid: vi.fn().mockReturnValue(updateBody),
      },
      body: vi.fn().mockReturnValue(expectedResponse),
      json: vi.fn(),
    } as unknown as UpdateCtx;

    const result = await updateEmployeeController(c, vi.fn());

    expect(c.req.param).toHaveBeenCalled();
    expect(c.req.valid).toHaveBeenCalledWith("json");
    expect(mockUpdateEmployee).toHaveBeenCalledWith(
      employeeRepository,
      1,
      updateBody,
    );
    expect(c.body).toHaveBeenCalledWith(null, 200);
    expect(result).toBe(expectedResponse);
  });

  it("案件履歴の日付が不正な場合は400を返す", async () => {
    const updateBody = { name: "Updated Name" };
    mockUpdateEmployee.mockResolvedValue({
      code: "INVALID_DATE_RANGE",
      message: "案件履歴の終了日は開始日以降である必要があります",
    });
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: 1 }),
        valid: vi.fn().mockReturnValue(updateBody),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 400 }),
    } as unknown as UpdateCtx;

    const result = await updateEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "案件履歴の終了日は開始日以降である必要があります" },
      400,
    );
    expect(result).toEqual({ status: 400 });
  });

  it("should return 404 when employee is not found", async () => {
    const updateBody = { name: "Updated Name" };
    mockUpdateEmployee.mockResolvedValue({ code: "NOT_FOUND" });
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: 1 }),
        valid: vi.fn().mockReturnValue(updateBody),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 404 }),
    } as unknown as UpdateCtx;

    const result = await updateEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith({ error: "社員が見つかりません" }, 404);
    expect(result).toEqual({ status: 404 });
  });

  it("同時更新の衝突が解消しなかった場合は409を返す", async () => {
    mockUpdateEmployee.mockResolvedValue({
      code: "CONFLICT",
      message: "他の更新と競合しました。もう一度お試しください",
    });
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: 1 }),
        valid: vi.fn().mockReturnValue({ name: "Updated Name" }),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 409 }),
    } as unknown as UpdateCtx;

    const result = await updateEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "他の更新と競合しました。もう一度お試しください" },
      409,
    );
    expect(result).toEqual({ status: 409 });
  });

  it("should return 400 when myNumber is duplicate", async () => {
    const updateBody = { myNumber: "123456789012" };
    mockUpdateEmployee.mockResolvedValue({
      code: "DUPLICATE_MY_NUMBER",
      message: "マイナンバーが既に使用されています",
    });
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: 1 }),
        valid: vi.fn().mockReturnValue(updateBody),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 400 }),
    } as unknown as UpdateCtx;

    await updateEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "マイナンバーが既に使用されています" },
      400,
    );
  });
});

describe("getEmployeeListController", () => {
  it("社員一覧を返す", async () => {
    const list = [
      {
        employeeId: 1,
        employeeCode: "EMP001",
        name: "John",
        contractPrice: 680000,
        status: "WORKING" as const,
      },
    ];
    mockGetEmployeeListService.mockResolvedValue(list);
    const c = {
      req: {
        valid: vi.fn().mockReturnValue({}),
      },
      json: vi.fn().mockReturnValue({ status: 200 }),
    } as unknown as ListCtx;

    const result = await getEmployeeListController(c, vi.fn());

    expect(mockGetEmployeeListService).toHaveBeenCalledWith({});
    expect(c.json).toHaveBeenCalledWith(list, 200);
    expect(result).toEqual({ status: 200 });
  });

  it("検索条件を渡す", async () => {
    mockGetEmployeeListService.mockResolvedValue([]);
    const c = {
      req: {
        valid: vi
          .fn()
          .mockReturnValue({ employeeCode: "EMP001", name: "John" }),
      },
      json: vi.fn().mockReturnValue({ status: 200 }),
    } as unknown as ListCtx;

    await getEmployeeListController(c, vi.fn());

    expect(mockGetEmployeeListService).toHaveBeenCalledWith({
      employeeCode: "EMP001",
      name: "John",
    });
  });
});

describe("getEmployeeDetailsController", () => {
  it("should return employee details with 200", async () => {
    const serviceResult = {
      id: 1,
      employeeCode: "EMP001",
      userId: 1,
      name: "山田太郎",
      furigana: "ヤマダタロウ",
      email: "test@example.com",
      birthDate: new Date("1990-01-01"),
      gender: Gender.MALE,
      phone: null,
      joinDate: null,
      specialty: "UNDECIDED" as const,
      workStatus: "WAITING" as const,
      gitHub: null,
      trainingEndDate: null,
      assignments: [{ status: "WORKING" as const }],
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
      createdAt: new Date("2026-01-01T00:00:00.000Z"),
      updaterId: null,
      updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const expectedDetails = mapEmployeeDetailsResponse(serviceResult);

    mockGetEmployeeDetailsService.mockResolvedValue(serviceResult as never);
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: 1 }),
      },
      json: vi.fn().mockReturnValue({ status: 200 }),
    } as unknown as DetailsCtx;

    const result = await getEmployeeDetailsController(c, vi.fn());

    expect(c.req.param).toHaveBeenCalled();
    expect(mockGetEmployeeDetailsService).toHaveBeenCalledWith(1);
    expect(c.json).toHaveBeenCalledWith(expectedDetails, 200);
    expect(result).toEqual({ status: 200 });
  });

  it("should return 404 when employee is not found", async () => {
    mockGetEmployeeDetailsService.mockResolvedValue(null);
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: 1 }),
      },
      json: vi.fn().mockReturnValue({ status: 404 }),
    } as unknown as DetailsCtx;

    const result = await getEmployeeDetailsController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith({ error: "社員が見つかりません" }, 404);
    expect(result).toEqual({ status: 404 });
  });
});
