import { createRoute, z } from "@hono/zod-openapi";
import {
  createEmployeeSchema,
  updateEmployeeSchema,
  EmployeeListSchema,
} from "./employee.schema";
import { Gender } from "@prisma/client";

const ErrorSchema = z.object({ error: z.string() });

const EmployeeDetailsSchema = z.object({
  employeeId: z.string(),
  userId: z.string(),
  name: z.string(),
  furigana: z.string(),
  email: z.string().email(),
  birthDate: z.string(),
  gender: z.enum(Gender),
  phone: z.string().nullable(),
  joinDate: z.string().nullable(),
  trainingEndDate: z.string().nullable(),
  studiedFrameworkIds: z.array(z.string()),
  availableFrameworkIds: z.array(z.string()),
  previousCompany1Name: z.string().nullable(),
  previousCompany1StartDate: z.string().nullable(),
  previousCompany1EndDate: z.string().nullable(),
  previousCompany2Name: z.string().nullable(),
  previousCompany2StartDate: z.string().nullable(),
  previousCompany2EndDate: z.string().nullable(),
  previousCompany3Name: z.string().nullable(),
  previousCompany3StartDate: z.string().nullable(),
  previousCompany3EndDate: z.string().nullable(),
  weeklyWorkHours: z.number().nullable(),
  monthlyEstimatedSalary: z.number().nullable(),
  postalCode: z.string().nullable(),
  prefecture: z.string().nullable(),
  city: z.string().nullable(),
  streetAddress: z.string().nullable(),
  emergencyContactName: z.string().nullable(),
  emergencyContactRelationship: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  hasSpouse: z.string().nullable(),
  hasChildren: z.string().nullable(),
  hasDependents: z.string().nullable(),
  myNumber: z.string().nullable(),
  employmentInsuranceNumber: z.string().nullable(),
  basicPensionNumber: z.string().nullable(),
  salaryAccount: z.string().nullable(),
  isDelete: z.boolean(),
  createrId: z.string().nullable(),
  createdAt: z.string(),
  updaterId: z.string().nullable(),
  updatedAt: z.string(),
});

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

export const updateEmployeeRoute = createRoute({
  method: "patch",
  path: "/employees/:id",
  tags: ["Employees"],
  request: {
    params: z.object({ id: z.string() }),
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
    body: {
      content: { "application/json": { schema: EmployeeListSchema } },
    },
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
    params: z.object({ id: z.string() }),
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
