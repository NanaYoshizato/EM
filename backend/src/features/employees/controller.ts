import type { RouteHandler } from "@hono/zod-openapi";
import {
  createEmployee,
  updateEmployee,
  getEmployeeDetail,
  getEmployeeList,
} from "./service";
import { employeeRepository, employeeQueryRepository, } from "./repository";
import type {
  createEmployeeRoute,
  updateEmployeeRoute,
  getEmployeeListRoute,
  getEmployeeDetailRoute,
} from "./types/routes";
import type { AuthEnv } from "@/middlewares/requireAuth";
import type { Actor } from "@/constants/permissions";
import type { User } from "@/features/auth/domain/user";

/** ログインユーザーを、権限の判定に使う形に変換する */
const toActor = (user: User): Actor => ({
  userId: user.id,
  role: user.roleName,
  employeeId: user.employeeId,
});

export const createEmployeeController: RouteHandler<
  typeof createEmployeeRoute, AuthEnv
> = async (c) => {
  const body = c.req.valid("json");
  const user = c.get("user");

  try {
    const result = await createEmployee(
      employeeRepository,
      employeeQueryRepository,
      toActor(user),
      body);
    if (result.code === "SUCCESS") {
      // 登録した社員の詳細APIのURL
      c.header("Location", `${c.req.path}/${result.employeeId}`);
      return c.json(result.detail, 201);
    }
    if (result.code === "FORBIDDEN") {
      return c.json({ error: "この操作を行う権限がありません" }, 403);
    }
    // 登録の業務エラーはすべて400（文言はドメインのエラーが持つ）
    return c.json({ error: result.message }, 400);
  } catch (error: unknown) {
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};

export const updateEmployeeController: RouteHandler<
  typeof updateEmployeeRoute, AuthEnv
> = async (c) => {
  const { id: employeeId } = c.req.valid("param");
  const body = c.req.valid("json");
  const user = c.get("user");

  try {
    const result = await updateEmployee(
      employeeRepository,
      employeeQueryRepository,
      toActor(user),
      employeeId,
      body,
    );
    if (result.code === "SUCCESS") {
      // 保存した社員を返す（読み直せなければnull）
      return c.json(result.detail, 200);
    }
    if (result.code === "FORBIDDEN") {
      return c.json({ error: "この操作を行う権限がありません" }, 403);
    }
    if (result.code === "NOT_FOUND") {
      return c.json({ error: "社員が見つかりません" }, 404);
    }
    // 同時更新の衝突が、やり直しても解消しなかった
    if (result.code === "CONFLICT") {
      return c.json({ error: result.message }, 409);
    }
    return c.json({ error: result.message }, 400);
  } catch (error: unknown) {
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};

export const getEmployeeListController: RouteHandler<
  typeof getEmployeeListRoute, AuthEnv
> = async (c) => {
  const query = c.req.valid("query");
  const user = c.get("user");

  try {
    const result = await getEmployeeList(employeeQueryRepository, toActor(user), query);
    if (result.code === "SUCCESS") {
      return c.json(result.page, 200);
    }
    return c.json({ error: "この操作を行う権限がありません" }, 403);
  } catch (error: unknown) {
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};

export const getEmployeeDetailController: RouteHandler<
  typeof getEmployeeDetailRoute, AuthEnv
> = async (c) => {
  const { id: employeeId } = c.req.valid("param");
  const user = c.get("user");

  try {
    const result = await getEmployeeDetail(
      employeeQueryRepository,
      toActor(user),
      employeeId,);

    if (result.code === "SUCCESS") {
      return c.json(result.detail, 200);
    }
    if (result.code === "FORBIDDEN") {
      return c.json({ error: "この操作を行う権限がありません" }, 403);
    }
    return c.json({ error: "社員が見つかりません" }, 404);

  } catch (error: unknown) {
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};
