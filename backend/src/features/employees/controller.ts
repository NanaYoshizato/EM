import type { RouteHandler } from "@hono/zod-openapi";
import { createEmployee } from "./service";
import type { createEmployeeRoute } from "./types/routes";

export const createEmployeeController: RouteHandler<
  typeof createEmployeeRoute
> = async (c) => {
  const body = c.req.valid("json");

  try {
    const result = await createEmployee(body);
    return c.json({ message: "社員登録成功", data: result }, 201);
  } catch (error: unknown) {
    if (
      error instanceof Error &&
      error.message.includes("Unique constraint")
    ) {
      return c.json({ message: "メールアドレスが既に使用されています" }, 409);
    }
    console.error(error);
    return c.json({ message: "サーバーエラー" }, 500);
  }
};
