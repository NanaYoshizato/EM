import { createRoute, z } from "@hono/zod-openapi";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  EmployeeListSchema,
  EmployeeListQuerySchema,
  EmployeeDetailSchema,
} from "./employee.schema";

const ErrorSchema = z.object({ error: z.string() });

export const createEmployeeRoute = createRoute({
  method: "post",
  path: "/employees",
  tags: ["Employees"],
  security: [{ Bearer: [] }],
  request: {
    body: {
      content: { "application/json": { schema: createEmployeeSchema } },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: EmployeeDetailSchema.nullable() } },
      headers: z.object({ Location: z.string() }),
      description: "社員登録成功（登録した社員の詳細）",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "バリデーションエラーまたはメールアドレス重複",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "未ログイン、または通行証が無効",
    },
    403: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "この操作を行う権限がない",
    },
    413: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "送信データが大きすぎる",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "サーバーエラー",
    },
  },
});

export const updateEmployeeRoute = createRoute({
  method: "patch",
  path: "/employees/{id}",
  tags: ["Employees"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.coerce.number().int().positive() }),
    body: {
      content: { "application/json": { schema: updateEmployeeSchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: EmployeeDetailSchema.nullable() } },
      description: "社員情報更新成功（更新した社員の詳細）",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "バリデーションエラー",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "未ログイン、または通行証が無効",
    },
    403: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "この操作を行う権限がない",
    },
    404: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "社員が見つかりません",
    },
    409: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "他の更新と競合した（自動でやり直しても解消しなかった）",
    },
    413: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "送信データが大きすぎる",
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
  security: [{ Bearer: [] }],
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
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "バリデーションエラー",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "未ログイン、または通行証が無効",
    },
    403: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "この操作を行う権限がない",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "サーバーエラー",
    },
  },
});

export const getEmployeeDetailRoute = createRoute({
  method: "get",
  path: "/employees/{id}",
  tags: ["Employees"],
  security: [{ Bearer: [] }],
  request: {
    params: z.object({ id: z.coerce.number().int().positive() }),
  },
  responses: {
    200: {
      content: {
        "application/json": { schema: EmployeeDetailSchema },
      },
      description: "社員詳細情報取得成功",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "バリデーションエラー",
    },
    401: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "未ログイン、または通行証が無効",
    },
    403: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "この操作を行う権限がない",
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
