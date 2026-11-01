import { scopeOf, type Actor } from "@/constants/permissions";
import {
  ConcurrentUpdateError,
  DuplicateFieldError,
  Employee,
  EmployeeError,
} from "./domain/employee";
import type { EmployeeRepository, NewEmployeeInput } from "./domain/types";
import {
  getEmployeeList,
  getEmployeeDetails,
  findEmployeeSummaryByUserId,
} from "./repository";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "./types/employee.schema";
import { FIELD_GROUPS } from "./domain/fieldGroups";

/** 同時実行の衝突（社員コードの採番・同じ社員の同時更新）時に、この回数までやり直す */
const MAX_RETRIES = 3;

/** 業務エラーの結果（文言はドメインのエラーが持つ） */
type ErrorResult = { code: EmployeeError["code"]; message: string };

// 新規登録
type CreateEmployeeResult =
  | { code: "SUCCESS"; employeeId: number }
  | { code: "FORBIDDEN" }
  | ErrorResult;

// 更新
type UpdateEmployeeResult =
  | { code: "SUCCESS" }
  | { code: "NOT_FOUND" }
  | { code: "FORBIDDEN" }
  | ErrorResult;

const toErrorResult = ({ code, message }: EmployeeError): ErrorResult => ({
  code,
  message,
});

/**
 * 書き込み権限があるかチェック
 */
const canWrite = (actor: Actor, data: object): boolean =>
  Object.keys(data).every((field) => {
    const group = FIELD_GROUPS[field as keyof NewEmployeeInput];

    if (group === undefined) return false;
    return scopeOf(actor.role, `employee.${group}.write`) === "all";
  });

/**
 * 社員登録の処理の流れ（今の最大の社員コードを読む→社員を作る→DBに保存）をここで組み立てる。
 */
export const createEmployee = async (
  repository: EmployeeRepository,
  actor: Actor,
  data: CreateEmployeeInput,
): Promise<CreateEmployeeResult> => {
  if (scopeOf(actor.role, "employee.create") !== "all" || !canWrite(actor, data)) {
    return { code: "FORBIDDEN" };
  }
  for (let attempt = 0; ; attempt++) {
    try {
      // 1. 今いちばん大きい社員コードを取得する
      const lastCode = await repository.findLastEmployeeCode();
      // 2. 社員を作る（次の社員コードを決め、業務ルールをチェックする）
      const employee = Employee.create(data, lastCode);
      // 3. 保存する
      const employeeId = await repository.insert(employee);
      return { code: "SUCCESS", employeeId };
    } catch (error: unknown) {
      // 同時登録で社員コードが衝突した場合は、採番からやり直す
      if (
        error instanceof DuplicateFieldError &&
        error.field === "employeeCode" &&
        attempt < MAX_RETRIES
      ) {
        continue;
      }
      if (error instanceof EmployeeError) {
        return toErrorResult(error);
      }
      // 想定外のエラー（DB接続エラーなど）はcontrollerで500になる
      throw error;
    }
  }
};

/**
 * 社員更新の処理の流れ（DBから社員を読み込む→変更する→DBに保存）をここで組み立てる。
 * 読み込み後に他の更新が入っていたら、最新の内容を読み込み直してやり直す。
 */
export const updateEmployee = async (
  repository: EmployeeRepository,
  actor: Actor,
  employeeId: number,
  data: UpdateEmployeeInput,
): Promise<UpdateEmployeeResult> => {
  if (!canWrite(actor, data)) {
    return { code: "FORBIDDEN" };
  }

  for (let attempt = 0; ; attempt++) {
    try {
      // 1. DBから社員を読み込む
      const employee = await repository.findById(employeeId);
      if (!employee) {
        return { code: "NOT_FOUND" };
      }
      // 2. 送られてきた項目を変更する（業務ルールのチェックも行う）
      employee.update(data);
      // 3. 保存する
      await repository.update(employee);
      return { code: "SUCCESS" };
    } catch (error: unknown) {
      // 読み込み後に他の更新が入った場合は、最新の内容を読み込み直してやり直す
      if (error instanceof ConcurrentUpdateError && attempt < MAX_RETRIES) {
        continue;
      }
      if (error instanceof EmployeeError) {
        return toErrorResult(error);
      }
      throw error;
    }
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
 * @returns 社員番号, 氏名
 */
export const getEmployeeSummaryByUserId = (userId: number) => {
  return findEmployeeSummaryByUserId(userId);
};
