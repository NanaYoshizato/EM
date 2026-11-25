import { scopeOf, type Actor } from "@/constants/permissions";
import {
  ConcurrentUpdateError,
  DuplicateFieldError,
  Employee,
  EmployeeError,
} from "./domain/employee";
import type {
  EmployeeDetail,
  EmployeeListItem,
  EmployeeQueryRepository,
  EmployeeRepository,
  FieldGroup,
  NewEmployeeInput,
} from "./domain/types";
import { findEmployeeSummaryByUserId } from "./repository";
import type {
  CreateEmployeeInput,
  EmployeeListQuery,
  UpdateEmployeeInput,
} from "./types/employee.schema";
import { FIELD_GROUPS, GROUP_LEVELS } from "./domain/fieldGroups";

/** 同時実行の衝突（社員コードの採番・同じ社員の同時更新）時に、この回数までやり直す */
const MAX_RETRIES = 3;

/** 業務エラーの結果（文言はドメインのエラーが持つ） */
type ErrorResult = { code: EmployeeError["code"]; message: string };

// 新規登録
type CreateEmployeeResult =
  | { code: "SUCCESS"; employeeId: number; detail: EmployeeDetail | null }
  | { code: "FORBIDDEN" }
  | ErrorResult;

// 更新
type UpdateEmployeeResult =
  | { code: "SUCCESS"; detail: EmployeeDetail | null }
  | { code: "NOT_FOUND" }
  | { code: "FORBIDDEN" }
  | ErrorResult;

// 一覧
type GetEmployeeListResult =
  | {
      code: "SUCCESS";
      page: { items: EmployeeListItem[]; total: number; currentPage: number; totalPage: number };
    }
  | { code: "FORBIDDEN" };

// 詳細
type GetEmployeeDetailResult =
  | { code: "SUCCESS"; detail: EmployeeDetail }
  | { code: "NOT_FOUND" }
  | { code: "FORBIDDEN" };

const toErrorResult = ({ code, message }: EmployeeError): ErrorResult => ({
  code,
  message,
});

/** 送られてきた項目すべてを書けるか（1つでも書けなければfalse） */
const canWrite = (actor: Actor, data: object): boolean =>
  Object.keys(data).every((field) => {
    const group = FIELD_GROUPS[field as keyof NewEmployeeInput];
    return group !== undefined && canAccess(actor, group, "write");
  });

/** 1つのまとまりを読める・書けるか（ownは本人のときだけ許可） */
const canAccess = (actor: Actor, group: FieldGroup, action: "read"|"write", isSelf = false) => {
  const scope = scopeOf(actor.role, `employee.${group}.${action}`);
  return scope === "all" || (scope === "own" && isSelf); 
};  

/**
 * 社員登録の処理の流れ（今の最大の社員コードを読む→社員を作る→DBに保存）をここで組み立てる。
 */
export const createEmployee = async (
  repository: EmployeeRepository,
  queryRepository: EmployeeQueryRepository,
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
      // 4. 保存した社員を読み直す
      const detail = await readSaved(queryRepository, actor, employeeId);
      return { code: "SUCCESS", employeeId, detail };
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
  queryRepository: EmployeeQueryRepository,
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
      // 4. 保存した社員を読み直す
      const detail = await readSaved(queryRepository, actor, employeeId);
      return { code: "SUCCESS", detail };
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

/**
 * 社員詳細の処理の流れ（権限の確認→読めるまとまりだけDBから読む）をここで組み立てる。
 */
export const getEmployeeDetail = async (
  queryRepository: EmployeeQueryRepository,
  actor: Actor,
  employeeId: number,
): Promise<GetEmployeeDetailResult> => {
  const isSelf = actor.employeeId === employeeId;
  const groups = new Set(
    (Object.keys(GROUP_LEVELS) as FieldGroup[]).filter((group) =>
      canAccess(actor, group, "read", isSelf),
    ),
  );
  // 公開の項目も読めない（営業）なら、DBを読む前に弾く
  if (!groups.has("public")) {
    return { code: "FORBIDDEN" };
  }

  const detail = await queryRepository.findDetail(employeeId, groups);
  if (!detail) {
    return { code: "NOT_FOUND" };
  }
  return { code: "SUCCESS", detail };
};

/** 保存した社員を詳細と同じ形で読み直す（読めなければnull） */
const readSaved = async (
  queryRepository: EmployeeQueryRepository,
  actor: Actor,
  employeeId: number,
): Promise<EmployeeDetail | null> => {
  try {
    const result = await getEmployeeDetail(queryRepository, actor, employeeId);
    return result.code === "SUCCESS" ? result.detail : null;
  } catch (error: unknown) {
    console.error(error);
    return null;
  }
};

/** 日本時間の今月（"YYYY-MM"） */
const currentMonthInJst = (now: Date): string =>
  new Date(now.getTime() + 9 * 60 * 60 * 1000).toISOString().slice(0, 7);

/** 社員一覧（権限の確認→検索条件に変換→DBから読む→ページ情報を付ける） */
export const getEmployeeList = async (
  queryRepository: EmployeeQueryRepository,
  actor: Actor,
  query: EmployeeListQuery,
  now: Date = new Date(),
): Promise<GetEmployeeListResult> => {
  // 一覧は公開の項目だけを返す。公開も読めない（営業）なら弾く
  if (!canAccess(actor, "public", "read")) {
    return { code: "FORBIDDEN" };
  }
  // 稼働状況は公開していないので、全員分の基本情報を読める人だけが絞り込める
  if (query.workStatusFilter && !canAccess(actor, "basic", "read")) {
    return { code: "FORBIDDEN" };
  }

  const { page, limit } = query;
  const { items, total } = await queryRepository.findList({
    employeeCode: query.employeeCode,
    name: query.name,
    specialty: query.specialtyFilter,
    workStatus: query.workStatusFilter,
    skillIds: query.skillsFilter?.split(",").map(Number),
    joinedMonth: query.monthly === "true" ? currentMonthInJst(now) : undefined,
    sort: query.sort,
    page,
    limit,
  });
  // 該当が0件でも総ページ数は1
  const totalPage = Math.max(Math.ceil(total / limit), 1);
  return { code: "SUCCESS", page: { items, total, currentPage: page, totalPage } };
};


/**
 * ユーザーidから社員情報を取得するサービス
 * @param userId
 * @returns 社員番号, 氏名
 */
export const getEmployeeSummaryByUserId = (userId: number) => {
  return findEmployeeSummaryByUserId(userId);
};

