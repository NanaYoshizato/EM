import { describe, it, expect, vi, beforeEach } from "vitest";
import type { EmployeeDetail } from "../domain/types";

vi.mock("@/lib/prisma", () => ({
  prisma: {},
}));

vi.mock("../service", () => ({
  createEmployee: vi.fn(),
  updateEmployee: vi.fn(),
  getEmployeeList: vi.fn(),
  getEmployeeDetail: vi.fn(),
}));

import {
  createEmployee,
  updateEmployee,
  getEmployeeList,
  getEmployeeDetail,
} from "../service";
import { employeeRepository, employeeQueryRepository } from "../repository";
import {
  createEmployeeController,
  updateEmployeeController,
  getEmployeeListController,
  getEmployeeDetailController,
} from "../controller";

type CreateCtx = Parameters<typeof createEmployeeController>[0];
type UpdateCtx = Parameters<typeof updateEmployeeController>[0];
type ListCtx = Parameters<typeof getEmployeeListController>[0];
type DetailCtx = Parameters<typeof getEmployeeDetailController>[0];

const mockCreateEmployee = vi.mocked(createEmployee);
const mockUpdateEmployee = vi.mocked(updateEmployee);
const mockGetEmployeeList = vi.mocked(getEmployeeList);
const mockGetEmployeeDetail = vi.mocked(getEmployeeDetail);

/** ミドルウェア（requireAuth）がリクエストに持たせるログインユーザー */
const loginUser = { id: 1, roleName: "admin", employeeId: 1 };
const loginActor = { userId: 1, role: "admin", employeeId: 1 };

/** c.req.valid の偽物（"param" ならURLの値、"json" ならbodyを返す） */
const validOf = (param: object, json?: object) =>
  vi.fn((target: string) => (target === "param" ? param : json));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEmployeeController", () => {
  it("登録した社員の詳細を201で返し、Locationに詳細APIの場所を入れる", async () => {
    const body = { email: "test@example.com", name: "Test" };
    const detail = { employeeCode: "EMP006", name: "Test" } as EmployeeDetail;
    const expectedResponse = { status: 201 };
    mockCreateEmployee.mockResolvedValue({ code: "SUCCESS", employeeId: 6, detail });
    const c = {
      req: {
        valid: vi.fn().mockReturnValue(body),
        path: "/api/employees",
      },
      header: vi.fn(),
      json: vi.fn().mockReturnValue(expectedResponse),
      get: vi.fn().mockReturnValue(loginUser),
    } as unknown as CreateCtx;

    const result = await createEmployeeController(c, vi.fn());

    expect(c.req.valid).toHaveBeenCalledWith("json");
    expect(c.get).toHaveBeenCalledWith("user");
    expect(mockCreateEmployee).toHaveBeenCalledWith(
      employeeRepository,
      employeeQueryRepository,
      loginActor,
      body,
    );
    expect(c.header).toHaveBeenCalledWith("Location", "/api/employees/6");
    expect(c.json).toHaveBeenCalledWith(detail, 201);
    expect(result).toBe(expectedResponse);
  });

  it("登録後に読み直せなかった場合も201で返す（本文はnull）", async () => {
    mockCreateEmployee.mockResolvedValue({ code: "SUCCESS", employeeId: 6, detail: null });
    const c = {
      req: { valid: vi.fn().mockReturnValue({ name: "Test" }), path: "/api/employees" },
      header: vi.fn(),
      json: vi.fn(),
      get: vi.fn().mockReturnValue(loginUser),
    } as unknown as CreateCtx;

    await createEmployeeController(c, vi.fn());

    expect(c.header).toHaveBeenCalledWith("Location", "/api/employees/6");
    expect(c.json).toHaveBeenCalledWith(null, 201);
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
      get: vi.fn().mockReturnValue(loginUser),
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
      get: vi.fn().mockReturnValue(loginUser),
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
      get: vi.fn().mockReturnValue(loginUser),
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
      get: vi.fn().mockReturnValue(loginUser),
    } as unknown as CreateCtx;

    await createEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "スキルが重複して指定されています" },
      400,
    );
  });

  it("権限が無い場合は403を返す", async () => {
    mockCreateEmployee.mockResolvedValue({ code: "FORBIDDEN" });
    const c = {
      req: { valid: vi.fn().mockReturnValue({ name: "Test" }) },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 403 }),
      get: vi.fn().mockReturnValue(loginUser),
    } as unknown as CreateCtx;

    const result = await createEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "この操作を行う権限がありません" },
      403,
    );
    expect(result).toEqual({ status: 403 });
  });
});

describe("updateEmployeeController", () => {
  it("更新した社員の詳細を200で返す", async () => {
    const updateBody = { name: "Updated Name" };
    const detail = { employeeCode: "EMP001", name: "Updated Name" } as EmployeeDetail;
    const expectedResponse = { status: 200 };
    mockUpdateEmployee.mockResolvedValue({ code: "SUCCESS", detail });
    const c = {
      req: {
        valid: validOf({ id: 1 }, updateBody),
      },
      json: vi.fn().mockReturnValue(expectedResponse),
      get: vi.fn().mockReturnValue(loginUser),
    } as unknown as UpdateCtx;

    const result = await updateEmployeeController(c, vi.fn());

    expect(c.req.valid).toHaveBeenCalledWith("param");
    expect(c.req.valid).toHaveBeenCalledWith("json");
    expect(mockUpdateEmployee).toHaveBeenCalledWith(
      employeeRepository,
      employeeQueryRepository,
      loginActor,
      1,
      updateBody,
    );
    expect(c.json).toHaveBeenCalledWith(detail, 200);
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
        valid: validOf({ id: 1 }, updateBody),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 400 }),
      get: vi.fn().mockReturnValue(loginUser),
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
        valid: validOf({ id: 1 }, updateBody),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 404 }),
      get: vi.fn().mockReturnValue(loginUser),
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
        valid: validOf({ id: 1 }, { name: "Updated Name" }),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 409 }),
      get: vi.fn().mockReturnValue(loginUser),
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
        valid: validOf({ id: 1 }, updateBody),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 400 }),
      get: vi.fn().mockReturnValue(loginUser),
    } as unknown as UpdateCtx;

    await updateEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "マイナンバーが既に使用されています" },
      400,
    );
  });

  it("権限が無い場合は403を返す", async () => {
    mockUpdateEmployee.mockResolvedValue({ code: "FORBIDDEN" });
    const c = {
      req: {
        valid: validOf({ id: 1 }, { myNumber: "123456789012" }),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 403 }),
      get: vi.fn().mockReturnValue(loginUser),
    } as unknown as UpdateCtx;

    const result = await updateEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "この操作を行う権限がありません" },
      403,
    );
    expect(result).toEqual({ status: 403 });
  });
});

describe("getEmployeeListController", () => {
  const query = { sort: "desc", page: 1, limit: 12 } as const;

  const listCtx = () =>
    ({
      req: { valid: vi.fn().mockReturnValue(query) },
      json: vi.fn((data: unknown, status: number) => ({ data, status })),
      get: vi.fn().mockReturnValue(loginUser),
    }) as unknown as ListCtx;

  it("検証済みのクエリとログインユーザーでサービスを呼び、ページ付きの一覧を200で返す", async () => {
    const page = { items: [], total: 0, currentPage: 1, totalPage: 1 };
    mockGetEmployeeList.mockResolvedValue({ code: "SUCCESS", page });
    const c = listCtx();

    const result = await getEmployeeListController(c, vi.fn());

    expect(c.req.valid).toHaveBeenCalledWith("query");
    expect(mockGetEmployeeList).toHaveBeenCalledWith(employeeQueryRepository, loginActor, query);
    expect(result).toEqual({ data: page, status: 200 });
  });

  it("権限が無い場合は403を返す", async () => {
    mockGetEmployeeList.mockResolvedValue({ code: "FORBIDDEN" });
    const c = listCtx();

    await getEmployeeListController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith({ error: "この操作を行う権限がありません" }, 403);
  });

  it("想定外のエラーは500を返す", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetEmployeeList.mockRejectedValue(new Error("DB接続エラー"));
    const c = listCtx();

    await getEmployeeListController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith({ error: "サーバーエラーが発生しました" }, 500);
    consoleError.mockRestore();
  });
});

describe("getEmployeeDetailController", () => {
  /** controllerはサービスの結果をそのまま返すだけなので、中身は一部の項目で足りる */
  const detail = { employeeCode: "EMP001", name: "山田太郎" } as EmployeeDetail;

  const detailCtx = () =>
    ({
      req: { valid: validOf({ id: 1 }) },
      json: vi.fn((data: unknown, status: number) => ({ data, status })),
      get: vi.fn().mockReturnValue(loginUser),
    }) as unknown as DetailCtx;

  it("検証済みのidとログインユーザーでサービスを呼び、詳細を200で返す", async () => {
    mockGetEmployeeDetail.mockResolvedValue({ code: "SUCCESS", detail });
    const c = detailCtx();

    const result = await getEmployeeDetailController(c, vi.fn());

    expect(c.req.valid).toHaveBeenCalledWith("param");
    expect(c.get).toHaveBeenCalledWith("user");
    expect(mockGetEmployeeDetail).toHaveBeenCalledWith(
      employeeQueryRepository,
      loginActor,
      1,
    );
    expect(c.json).toHaveBeenCalledWith(detail, 200);
    expect(result).toEqual({ data: detail, status: 200 });
  });

  it("権限が無い場合は403を返す", async () => {
    mockGetEmployeeDetail.mockResolvedValue({ code: "FORBIDDEN" });
    const c = detailCtx();

    await getEmployeeDetailController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "この操作を行う権限がありません" },
      403,
    );
  });

  it("社員が見つからない（他人の詳細を含む）場合は404を返す", async () => {
    mockGetEmployeeDetail.mockResolvedValue({ code: "NOT_FOUND" });
    const c = detailCtx();

    await getEmployeeDetailController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith({ error: "社員が見つかりません" }, 404);
  });

  it("想定外のエラーは500を返す", async () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
    mockGetEmployeeDetail.mockRejectedValue(new Error("DB接続エラー"));
    const c = detailCtx();

    await getEmployeeDetailController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "サーバーエラーが発生しました" },
      500,
    );
    consoleError.mockRestore();
  });
});
