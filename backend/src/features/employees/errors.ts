/**
 * repository.ts（インフラ）とservice.ts（アプリケーション層）が共有する
 * エラー語彙。どちらのファイルにも属させないことで、
 * 「serviceがrepositoryの具体的な実装ファイルに依存する」状態を避ける。
 * Prismaなどインフラ固有の型はここに一切importしない。
 */

/** DBの一意制約違反（P2002）を、違反したカラム名付きで表現するエラー */
export class DuplicateFieldError extends Error {
  constructor(public readonly field: string) {
    super(`Duplicate value for field: ${field}`);
    this.name = "DuplicateFieldError";
  }
}

/** 存在しない社員を更新・参照しようとしたエラー */
export class EmployeeNotFoundError extends Error {
  constructor() {
    super("Employee not found");
    this.name = "EmployeeNotFoundError";
  }
}

/** 存在しないskillIdが指定されたエラー */
export class InvalidSkillIdError extends Error {
  constructor() {
    super("Invalid skillId");
    this.name = "InvalidSkillIdError";
  }
}
