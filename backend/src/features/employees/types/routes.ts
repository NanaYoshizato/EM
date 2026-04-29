import { createRoute, z } from "@hono/zod-openapi";
import { createEmployeeSchema } from "./createEmployee.schema";

const CreateEmployeeResponseSchema = z.object({
  message: z.string(),
  data: z.object({
    userId: z.string(),
    employeeId: z.string(),
  }),
});

const ErrorSchema = z.object({ message: z.string() });

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
      content: {
        "application/json": { schema: CreateEmployeeResponseSchema },
      },
      description: "社員登録成功",
    },
    400: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "バリデーションエラー",
    },
    409: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "メールアドレス重複",
    },
    500: {
      content: { "application/json": { schema: ErrorSchema } },
      description: "サーバーエラー",
    },
  },
});
