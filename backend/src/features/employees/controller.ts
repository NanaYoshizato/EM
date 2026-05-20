import type { RouteHandler } from "@hono/zod-openapi";
import {
  createEmployee,
  updateEmployeeService,
  getEmployeeListService,
  getEmployeeDetailsService,
} from "./service";
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
    if (error instanceof Error && error.message.includes("Unique constraint")) {
      return c.json({ error: "メールアドレスが既に使用されています" }, 409);
    }
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};

export const updateEmployeeController: RouteHandler<
  typeof updateEmployeeRoute
> = async (c) => {
  const { id } = c.req.param();
  const body = c.req.valid("json");

  try {
    await updateEmployeeService(id, body);
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
  const query = c.req.query();
  const filters: { employeeId?: string; name?: string } = {};

  if (query.employeeId !== undefined) {
    filters.employeeId = query.employeeId;
  }
  if (query.name !== undefined) {
    filters.name = query.name;
  }

  try {
    const result = await getEmployeeListService(filters);
    return c.json(result, 200);
  } catch (error: unknown) {
    console.error(error);
    return c.json({ error: "サーバーエラーが発生しました" }, 500);
  }
};

const mapEmployeeDetailsResponse = (employee: any) => ({
  employee_id: employee.employee_id,
  userId: employee.userId,
  name: employee.name,
  furigana: employee.furigana,
  email: employee.email,
  birthDate:
    employee.birthDate instanceof Date
      ? employee.birthDate.toISOString()
      : employee.birthDate,
  gender: employee.gender,
  phone: employee.phone ?? null,
  joinDate:
    employee.joinDate instanceof Date
      ? employee.joinDate.toISOString()
      : employee.joinDate,
  trainingEndDate:
    employee.trainingEndDate instanceof Date
      ? employee.trainingEndDate.toISOString()
      : employee.trainingEndDate,
  studiedFrameworkIds:
    employee.studiedFrameworkIds ??
    employee.studiedFrameworks?.map((item: any) => item.frameworkId) ?? [],
  availableFrameworkIds:
    employee.availableFrameworkIds ??
    employee.availableFrameworks?.map((item: any) => item.frameworkId) ?? [],
  previousCompany1Name: employee.previousCompany1Name ?? null,
  previousCompany1StartDate:
    employee.previousCompany1StartDate instanceof Date
      ? employee.previousCompany1StartDate.toISOString()
      : employee.previousCompany1StartDate,
  previousCompany1EndDate:
    employee.previousCompany1EndDate instanceof Date
      ? employee.previousCompany1EndDate.toISOString()
      : employee.previousCompany1EndDate,
  previousCompany2Name: employee.previousCompany2Name ?? null,
  previousCompany2StartDate:
    employee.previousCompany2StartDate instanceof Date
      ? employee.previousCompany2StartDate.toISOString()
      : employee.previousCompany2StartDate,
  previousCompany2EndDate:
    employee.previousCompany2EndDate instanceof Date
      ? employee.previousCompany2EndDate.toISOString()
      : employee.previousCompany2EndDate,
  previousCompany3Name: employee.previousCompany3Name ?? null,
  previousCompany3StartDate:
    employee.previousCompany3StartDate instanceof Date
      ? employee.previousCompany3StartDate.toISOString()
      : employee.previousCompany3StartDate,
  previousCompany3EndDate:
    employee.previousCompany3EndDate instanceof Date
      ? employee.previousCompany3EndDate.toISOString()
      : employee.previousCompany3EndDate,
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
  creater_id: employee.creater_id ?? null,
  createAt:
    employee.createAt instanceof Date
      ? employee.createAt.toISOString()
      : employee.createAt,
  updater_id: employee.updater_id ?? null,
  updateAt:
    employee.updateAt instanceof Date
      ? employee.updateAt.toISOString()
      : employee.updateAt,
});

export const getEmployeeDetailsController: RouteHandler<
  typeof getEmployeeDetailsRoute
> = async (c) => {
  const { id } = c.req.param();

  try {
    const result = await getEmployeeDetailsService(id);
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
