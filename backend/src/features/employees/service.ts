import { Employee, InvalidDateRangeError } from "./domain/employee";
import {
  findLastEmployeeCode,
  insertEmployee,
  updateEmployee,
  findPreviousCompanyDates,
  getEmployeeList,
  getEmployeeDetails,
  findEmployeeSummaryByUserId,
} from "./repository";
import {
  DuplicateFieldError,
  EmployeeNotFoundError,
  InvalidSkillIdError,
} from "./errors";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "./types/employee.schema";

/** 社員コードの同時採番衝突（P2002）時に、この回数まで採番からやり直す */
const MAX_EMPLOYEE_CODE_RETRIES = 3;

type CreateEmployeeResult =
  | { code: "SUCCESS"; employeeId: number }
  | { code: "DUPLICATE_EMAIL" }
  | { code: "DUPLICATE_MY_NUMBER" }
  | { code: "DUPLICATE_EMPLOYEE_CODE" }
  | { code: "INVALID_SKILL_ID" }
  | { code: "INVALID_DATE_RANGE"; message: string };

/**
 * 社員登録のユースケース手順（最新の社員コード取得→Employee集約の生成→
 * 永続化）をここで組み立てる。repository.tsはDBアクセスのみを担当する。
 */
export const createEmployee = async (
  data: CreateEmployeeInput,
): Promise<CreateEmployeeResult> => {
  for (let attempt = 0; ; attempt++) {
    try {
      const lastCode = await findLastEmployeeCode();
      const employee = Employee.create(data, lastCode);
      const { employeeId } = await insertEmployee(employee, data);
      return { code: "SUCCESS", employeeId };
    } catch (error: unknown) {
      if (error instanceof InvalidDateRangeError) {
        return { code: "INVALID_DATE_RANGE", message: error.message };
      }
      if (error instanceof InvalidSkillIdError) {
        return { code: "INVALID_SKILL_ID" };
      }
      if (error instanceof DuplicateFieldError) {
        if (
          error.field.includes("employee_code") &&
          attempt < MAX_EMPLOYEE_CODE_RETRIES
        ) {
          continue;
        }
        if (error.field.includes("email")) return { code: "DUPLICATE_EMAIL" };
        if (error.field.includes("my_number"))
          return { code: "DUPLICATE_MY_NUMBER" };
        if (error.field.includes("employee_code"))
          return { code: "DUPLICATE_EMPLOYEE_CODE" };
      }
      throw error;
    }
  }
};

type UpdateEmployeeResult =
  | { code: "SUCCESS" }
  | { code: "NOT_FOUND" }
  | { code: "DUPLICATE_MY_NUMBER" }
  | { code: "INVALID_SKILL_ID" }
  | { code: "INVALID_DATE_RANGE"; message: string };

const hasPreviousCompanyDateField = (data: UpdateEmployeeInput): boolean =>
  data.previousCompany1StartDate !== undefined ||
  data.previousCompany1EndDate !== undefined ||
  data.previousCompany2StartDate !== undefined ||
  data.previousCompany2EndDate !== undefined ||
  data.previousCompany3StartDate !== undefined ||
  data.previousCompany3EndDate !== undefined;

export const updateEmployeeService = async (
  employeeId: number,
  data: UpdateEmployeeInput,
): Promise<UpdateEmployeeResult> => {
  // PATCHは一部のフィールドしか送らないため、保存済みの値とマージしてから
  // 検証する（送られてきた分だけを見ると、逆転した組み合わせを見逃す）
  if (hasPreviousCompanyDateField(data)) {
    const stored = await findPreviousCompanyDates(employeeId);
    if (!stored) {
      return { code: "NOT_FOUND" };
    }

    try {
      Employee.assertValidPreviousCompanyDates({
        previousCompany1StartDate:
          data.previousCompany1StartDate ??
          stored.previousCompany1StartDate ??
          undefined,
        previousCompany1EndDate:
          data.previousCompany1EndDate ??
          stored.previousCompany1EndDate ??
          undefined,
        previousCompany2StartDate:
          data.previousCompany2StartDate ??
          stored.previousCompany2StartDate ??
          undefined,
        previousCompany2EndDate:
          data.previousCompany2EndDate ??
          stored.previousCompany2EndDate ??
          undefined,
        previousCompany3StartDate:
          data.previousCompany3StartDate ??
          stored.previousCompany3StartDate ??
          undefined,
        previousCompany3EndDate:
          data.previousCompany3EndDate ??
          stored.previousCompany3EndDate ??
          undefined,
      });
    } catch (error: unknown) {
      if (error instanceof InvalidDateRangeError) {
        return { code: "INVALID_DATE_RANGE", message: error.message };
      }
      throw error;
    }
  }

  try {
    await updateEmployee(employeeId, data);
    return { code: "SUCCESS" };
  } catch (error: unknown) {
    if (error instanceof InvalidDateRangeError) {
      return { code: "INVALID_DATE_RANGE", message: error.message };
    }
    if (error instanceof EmployeeNotFoundError) {
      return { code: "NOT_FOUND" };
    }
    if (error instanceof InvalidSkillIdError) {
      return { code: "INVALID_SKILL_ID" };
    }
    if (error instanceof DuplicateFieldError) {
      if (error.field.includes("my_number"))
        return { code: "DUPLICATE_MY_NUMBER" };
    }
    throw error;
  }
};

export const getEmployeeListService = async (filters?: {
  employeeCode?: string;
  name?: string;
}) => {
  return getEmployeeList(filters);
};

export const getEmployeeDetailsService = async (employeeId: number) => {
  return getEmployeeDetails(employeeId);
};

/**
 * ユーザーidから社員情報を取得するサービス
 * @param userId
 * @returns 社員テーブルのid, 社員番号, 氏名
 */
export const getEmployeeSummaryByUserId = (userId: number) => {
  return findEmployeeSummaryByUserId(userId);
};
