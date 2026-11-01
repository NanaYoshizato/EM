import type { RouteHandler } from "@hono/zod-openapi";
import type { Prisma } from "@prisma/client";
import {
  createEmployee,
  updateEmployee,
  getEmployeeListService,
  getEmployeeDetailsService,
} from "./service";
import { employeeRepository } from "./repository";
import type {
  createEmployeeRoute,
  updateEmployeeRoute,
  getEmployeeListRoute,
  getEmployeeDetailsRoute,
} from "./types/routes";
import type { AuthEnv } from "@/middlewares/requireAuth";

export const createEmployeeController: RouteHandler<
  typeof createEmployeeRoute, AuthEnv
> = async (c) => {
  const body = c.req.valid("json");

  try {
    const result = await createEmployee(employeeRepository, body);
    if (result.code === "SUCCESS") {
      return c.body(null, 201);
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
  const { id } = c.req.param();
  const employeeId = Number(id);
  const body = c.req.valid("json");

  try {
    const result = await updateEmployee(employeeRepository, employeeId, body);
    if (result.code === "SUCCESS") {
      return c.body(null, 200);
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
  const filters: { employeeCode?: string; name?: string } = {};
  if (query.employeeCode) filters.employeeCode = query.employeeCode;
  if (query.name) filters.name = query.name;

  try {
    const result = await getEmployeeListService(filters);
    return c.json(result, 200);
  } catch (error: unknown) {
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};

type EmployeeWithRelations = Prisma.EmployeeGetPayload<{
  include: {
    assignments: {
      where: { isDelete: false };
      orderBy: { startDate: "desc" };
      take: 1;
      select: { status: true };
    };
  };
}>;

const toIso = (value: Date | string | null | undefined) => {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : value;
};

export const mapEmployeeDetailsResponse = (
  employee: EmployeeWithRelations,
) => ({
  employeeId: employee.id,
  employeeCode: employee.employeeCode,
  userId: employee.userId,
  name: employee.name,
  furigana: employee.furigana,
  email: employee.email,
  birthDate: toIso(employee.birthDate),
  gender: employee.gender,
  phone: employee.phone ?? null,
  joinDate: toIso(employee.joinDate),
  trainingEndDate: toIso(employee.trainingEndDate),
  status: employee.assignments?.[0]?.status ?? null,
  previousCompany1Name: employee.previousCompany1Name ?? null,
  previousCompany1StartDate: toIso(employee.previousCompany1StartDate),
  previousCompany1EndDate: toIso(employee.previousCompany1EndDate),
  previousCompany2Name: employee.previousCompany2Name ?? null,
  previousCompany2StartDate: toIso(employee.previousCompany2StartDate),
  previousCompany2EndDate: toIso(employee.previousCompany2EndDate),
  previousCompany3Name: employee.previousCompany3Name ?? null,
  previousCompany3StartDate: toIso(employee.previousCompany3StartDate),
  previousCompany3EndDate: toIso(employee.previousCompany3EndDate),
  weeklyWorkHours: employee.weeklyWorkHours ?? null,
  monthlyEstimatedSalary: employee.monthlyEstimatedSalary ?? null,
  postalCode: employee.postalCode ?? null,
  prefecture: employee.prefecture ?? null,
  city: employee.city ?? null,
  streetAddress: employee.streetAddress ?? null,
  emergencyContactName: employee.emergencyContactName ?? null,
  emergencyContactRelationship: employee.emergencyContactRelationship ?? null,
  emergencyContactPhone: employee.emergencyContactPhone ?? null,
  hasSpouse: employee.hasSpouse ?? null,
  hasChildren: employee.hasChildren ?? null,
  hasDependents: employee.hasDependents ?? null,
  myNumber: employee.myNumber ?? null,
  employmentInsuranceNumber: employee.employmentInsuranceNumber ?? null,
  basicPensionNumber: employee.basicPensionNumber ?? null,
  salaryAccount: employee.salaryAccount ?? null,
  isDelete: employee.isDelete,
  createrId: employee.createrId ?? null,
  createdAt: toIso(employee.createdAt) ?? "",
  updaterId: employee.updaterId ?? null,
  updatedAt: toIso(employee.updatedAt) ?? "",
});

export const getEmployeeDetailsController: RouteHandler<
  typeof getEmployeeDetailsRoute, AuthEnv
> = async (c) => {
  const { id } = c.req.param();
  const employeeId = Number(id);

  try {
    const result = await getEmployeeDetailsService(employeeId);
    if (!result) {
      return c.json({ error: "社員が見つかりません" }, 404);
    }
    const response = mapEmployeeDetailsResponse(result);
    return c.json(response, 200);
  } catch (error: unknown) {
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};
