import type { RouteHandler } from "@hono/zod-openapi";
import type { Prisma } from "@prisma/client";
import {
  createEmployee,
  updateEmployeeService,
  getEmployeeListService,
  getEmployeeDetailsService,
} from "./service";
import { DuplicateEmailError } from "./repository";
import type {
  createEmployeeRoute,
  updateEmployeeRoute,
  getEmployeeListRoute,
  getEmployeeDetailsRoute,
} from "./types/routes";

export const createEmployeeController: RouteHandler<
  typeof createEmployeeRoute
> = async (c) => {
  const body = c.req.valid("json");

  try {
    await createEmployee(body);
    return c.body(null, 201);
  } catch (error: unknown) {
    if (error instanceof DuplicateEmailError) {
      return c.json({ error: "メールアドレスが既に使用されています" }, 400);
    }
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return c.json({ error: "メールアドレスが既に使用されています" }, 400);
    }
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};

export const updateEmployeeController: RouteHandler<
  typeof updateEmployeeRoute
> = async (c) => {
  const { id } = c.req.param();
  const employeeId = Number(id);
  const body = c.req.valid("json");

  try {
    await updateEmployeeService(employeeId, body);
    return c.body(null, 200);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes("NotFound")) {
      return c.json({ error: "社員が見つかりません" }, 404);
    }
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};

export const getEmployeeListController: RouteHandler<
  typeof getEmployeeListRoute
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
    studiedFrameworks: { include: { framework: true } };
    availableFrameworks: { include: { framework: true } };
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
  studiedFrameworkIds:
    employee.studiedFrameworks?.map((item) => item.frameworkId) ?? [],
  availableFrameworkIds:
    employee.availableFrameworks?.map((item) => item.frameworkId) ?? [],
  studiedFrameworkNames:
    employee.studiedFrameworks?.map((item) => item.framework.frameworkName) ??
    [],
  availableFrameworkNames:
    employee.availableFrameworks?.map((item) => item.framework.frameworkName) ??
    [],
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
  typeof getEmployeeDetailsRoute
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
