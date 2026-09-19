import { createRoute, z } from "@hono/zod-openapi";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  EmployeeListSchema,
  EmployeeListQuerySchema,
  EmployeeDetailsSchema,
} from "./employee.schema";

const ErrorSchema = z.object({ error: z.string() });

export const createEmployeeRoute = createRoute({
  method: "post",
  path: "/employees",
  tags: ["Employees"],
  request: {
    body: {
      content: { "application/json": { schema: createEmployeeSchema } },
    },
  },
  responses: {
    201: {
      description: "社員登録成功",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "バリデーションエラーまたはメールアドレス重複",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "サーバーエラー",
    },
  },
});

export const updateEmployeeRoute = createRoute({
  method: "patch",
  path: "/employees/:id",
  tags: ["Employees"],
  request: {
    params: z.object({ id: z.coerce.number() }),
    body: {
      content: { "application/json": { schema: updateEmployeeSchema } },
    },
  },
  responses: {
    200: {
      description: "社員情報更新成功",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "バリデーションエラー",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "社員が見つかりません",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "サーバーエラー",
    },
  },
});

export const getEmployeeListRoute = createRoute({
  method: "get",
  path: "/employees",
  tags: ["Employees"],
  request: {
    query: EmployeeListQuerySchema,
  },
  responses: {
    200: {
      content: {
        "application/json": { schema: EmployeeListSchema },
      },
      description: "社員一覧取得成功",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "サーバーエラー",
    },
  },
});

export const getEmployeeDetailsRoute = createRoute({
  method: "get",
  path: "/employees/:id",
  tags: ["Employees"],
  request: {
    params: z.object({ id: z.coerce.number() }),
  },
  responses: {
    200: {
      content: {
        "application/json": { schema: EmployeeDetailsSchema },
      },
      description: "社員詳細情報取得成功",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "社員が見つかりません",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "サーバーエラー",
    },
  },
});
