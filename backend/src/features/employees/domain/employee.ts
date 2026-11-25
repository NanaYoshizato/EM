/**
 * 社員(Employee)の集約
 * 社員に関する業務ルールをここに集約する
 */

import type {
	Contract,
	EmployeeChanges,
	EmployeeErrorCode,
	EmployeeProfile,
	EmployeeSkill,
	EmployeeState,
	FamilyField,
	NewEmployeeInput,
	PreviousCompanyDates,
	ProjectHistoryInput,
} from "./types";

/**
 * 社員の登録・更新で起きる業務エラーの共通の親
 * code：serviceが返す結果コード、message：利用者に返す文言
 */
export abstract class EmployeeError extends Error {
	abstract readonly code: EmployeeErrorCode;

	constructor(message: string) {
		super(message);
		this.name = new.target.name;
	}
}

/** 開始日・終了日の前後が逆転している（ドメインが投げる） */
export class InvalidDateRangeError extends EmployeeError {
	readonly code = "INVALID_DATE_RANGE";
}

/** スキルIDが重複している（ドメインが投げる） */
export class DuplicateSkillError extends EmployeeError {
	readonly code = "DUPLICATE_SKILL";

	constructor() {
		super("スキルが重複して指定されています");
	}
}

/** 存在しないスキルIDが指定された（リポジトリが投げる） */
export class InvalidSkillIdError extends EmployeeError {
	readonly code = "INVALID_SKILL_ID";

	constructor() {
		super("指定されたスキルが存在しません");
	}
}

// 重複した項目ごとの結果コードと文言
const DUPLICATE_FIELD_ERRORS = {
	email: {
		code: "DUPLICATE_EMAIL",
		message: "メールアドレスが既に使用されています",
	},
	myNumber: {
		code: "DUPLICATE_MY_NUMBER",
		message: "マイナンバーが既に使用されています",
	},
	employeeCode: {
		code: "DUPLICATE_EMPLOYEE_CODE",
		message: "社員コードが重複しました。もう一度お試しください",
	},
} as const;

type DuplicateField = keyof typeof DUPLICATE_FIELD_ERRORS;

/** DBの「重複禁止」の制約に違反した（リポジトリが投げる） */
export class DuplicateFieldError extends EmployeeError {
	readonly code: (typeof DUPLICATE_FIELD_ERRORS)[DuplicateField]["code"];

	constructor(readonly field: DuplicateField) {
		super(DUPLICATE_FIELD_ERRORS[field].message);
		this.code = DUPLICATE_FIELD_ERRORS[field].code;
	}
}

/** 読み込んでから保存するまでの間に、他の更新・削除が入った（リポジトリが投げる） */
export class ConcurrentUpdateError extends EmployeeError {
	readonly code = "CONFLICT";

	constructor() {
		super("他の更新と競合しました。もう一度お試しください");
	}
}

/** 社員コードの接頭辞（採番ルールとDBの検索条件の両方がこの値を使う） */
export const EMPLOYEE_CODE_PREFIX = "EMP";

/**
 * skillIdの重複を禁止する。
 */
const assertNoDuplicateSkillIds = (skillIds: ReadonlyArray<number>): void => {
	if (new Set(skillIds).size !== skillIds.length) {
		throw new DuplicateSkillError();
	}
};

/** 開始日・終了日の前後関係をチェックする（endDate < startDateを禁止。同じ日は許容する） */
const assertValidDateRange = (
	startDate: string,
	endDate: string,
	label: string,
): void => {
	if (new Date(endDate) < new Date(startDate)) {
		throw new InvalidDateRangeError(
			`${label}の終了日は開始日以降である必要があります`,
		);
	}
};

/**
 * 値がundefinedの項目を取り除く（PATCHで送られてこなかった項目で、保存済みの値を上書きしないため）
 * 戻り値の型は「各項目を省略可能にし、undefinedを除いた型」
 */
const withoutUndefined = <T extends object>(
	obj: T,
): { [K in keyof T]?: Exclude<T[K], undefined> } =>
	Object.fromEntries(
		Object.entries(obj).filter(([, value]) => value !== undefined),
	) as { [K in keyof T]?: Exclude<T[K], undefined> };

/**
 * 案件履歴（値オブジェクト）
 */
export class ProjectHistory {
	readonly active: boolean;
	readonly projectName: string;
	readonly factory: string;
	readonly skillIds: ReadonlyArray<number>;
	readonly startDate: string;
	readonly endDate: string | undefined;
	readonly contracts: ReadonlyArray<Contract>;

	private constructor(input: ProjectHistoryInput) {
		this.active = input.active;
		this.projectName = input.projectName;
		this.factory = input.factory;
		this.skillIds = input.skills;
		this.startDate = input.startDate;
		this.endDate = input.endDate;
		this.contracts = input.contracts;
	}

	// 1.案件で使ったスキルの重複を禁止する
	// 2.終了日があるとき、終了日が開始日より前ならInvalidDateRangeErrorを投げる。同じ日は許容する（<で判定）
	static create(input: ProjectHistoryInput): ProjectHistory {
		assertNoDuplicateSkillIds(input.skills);

		if (input.endDate !== undefined) {
			assertValidDateRange(input.startDate, input.endDate, "案件履歴");
		}
		return new ProjectHistory(input);
	}

	/** DBから読み込んだ値で組み立てる（保存時にチェック済みなのでチェックしない。後からルールが増えても既存データを読み込めるように） */
	static reconstruct(input: ProjectHistoryInput): ProjectHistory {
		return new ProjectHistory(input);
	}
}

// エラーメッセージに使う前職の呼び名
const PREVIOUS_COMPANY_LABELS = ["前職1社目", "前職2社目", "前職3社目"] as const;

// 有無をtrue/falseに変換するルール
const toBoolean = (value: "有" | "無" | undefined): boolean | undefined =>
	value === undefined ? undefined : value === "有";

// true/falseを有無に戻すルール（toBooleanの逆。読み取りで入力と同じ形にして返す）
export const toFamilyAnswer = (value: boolean | null): "有" | "無" | null =>
	value === null ? null : value ? "有" : "無";

/**
 * 外から受け取った基本情報を集約の形に変換する（POST/PATCH共通）
 * 家族の有無の3項目だけ取り出してbooleanに変換し、残り（rest）はそのまま使う
 */
const toProfile = <T extends { [K in FamilyField]?: "有" | "無" | undefined }>({
	hasSpouse,
	hasChildren,
	hasDependents,
	...rest
}: T) => ({
	...rest,
	hasSpouse: toBoolean(hasSpouse),
	hasChildren: toBoolean(hasChildren),
	hasDependents: toBoolean(hasDependents),
});

/**
 * 社員（Employee）集約
 * 値を変えられるのはcreate/updateだけで、どちらも業務ルールをチェックしてから値を変える
 */
export class Employee {
	/** 未登録（create直後）はnull */
	readonly id: number | null;
	/** 読み込んだ時点の更新日時（保存時に「他の人が先に更新していないか」を確かめるのに使う。未登録はnull） */
	readonly version: Date | null;
	readonly employeeCode: string;
	// 外から直接書き換えられないようprivateにし、下のgetterで読み取り専用として公開する
	private _profile: EmployeeProfile;
	private _skills: ReadonlyArray<EmployeeSkill>;
	private _projectHistories: ReadonlyArray<ProjectHistory>;
	// DBから読み込んだ直後は「差し替えていない」から始まる
	private _skillsReplaced = false; //今回スキルを変更したか
	private _projectHistoriesReplaced = false; // 今回案件履歴を変更したか

	// 外からnewできない。必ずcreate（新規）かreconstruct（DBから読み込み）を通る
	private constructor(state: EmployeeState) {
		this.id = state.id;
		this.version = state.version;
		this.employeeCode = state.employeeCode;
		this._profile = state.profile;
		this._skills = state.skills;
		this._projectHistories = state.projectHistories;
	}

	get profile(): Readonly<EmployeeProfile> {
		return this._profile;
	}

	get skills(): ReadonlyArray<EmployeeSkill> {
		return this._skills;
	}

	get projectHistories(): ReadonlyArray<ProjectHistory> {
		return this._projectHistories;
	}

	/** updateでスキル一覧を差し替えたか（保存時に子テーブルを作り直すかの判断に使う） */
	get skillsReplaced(): boolean {
		return this._skillsReplaced;
	}

	/** updateで案件履歴を差し替えたか（保存時に子テーブルを作り直すかの判断に使う） */
	get projectHistoriesReplaced(): boolean {
		return this._projectHistoriesReplaced;
	}

	/**
	 * 新しい社員を作る（社員コードを決め、業務ルールをチェックする）。
	 * @param lastCode 採番時点での既存社員コードの最大値（存在しなければnull）
	 */
	static create(input: NewEmployeeInput, lastCode: string | null): Employee {
		// スキル・案件履歴と、それ以外（基本情報）に分ける
		const { skills, projects, ...rest } = input;

		// 業務ルールをチェックする（違反していればエラーになり、社員は作られない）
		const profile: EmployeeProfile = toProfile(rest);
		Employee.assertValidPreviousCompanyDates(profile);
		assertNoDuplicateSkillIds(skills.map((skill) => skill.skillId));

		// 未登録なのでidとversionはnull。案件履歴はProjectHistory.createの中でチェックされる
		return new Employee({
			id: null,
			version: null,
			employeeCode: Employee.nextEmployeeCode(lastCode),
			profile,
			skills,
			projectHistories: projects.map((project) => ProjectHistory.create(project)),
		});
	}

	/** DBから読み込んだ値で組み立てる（保存済みのデータはチェックしない） */
	static reconstruct(state: {
		id: number;
		version: Date;
		employeeCode: string;
		profile: EmployeeProfile;
		skills: ReadonlyArray<EmployeeSkill>;
		projectHistories: ReadonlyArray<ProjectHistoryInput>;
	}): Employee {
		// 案件履歴だけは、チェックしないreconstructでProjectHistoryに変換する
		return new Employee({
			...state,
			projectHistories: state.projectHistories.map((history) =>
				ProjectHistory.reconstruct(history),
			),
		});
	}

	/**
	 * 送られてきた項目だけを変更する。前職の日付は保存済みの値と合わせた結果でチェックする。
	 * チェックがすべて通ってから値を変える（途中で失敗しても中途半端に書き換わらないように）。
	 */
	update(changes: EmployeeChanges): void {
		const { skills, projects, ...rest } = changes;

		// 1. 変更後の基本情報を組み立てる（保存済みの値に、送られてきた項目だけを上書きする）
		const profile: EmployeeProfile = {
			...this._profile,
			...withoutUndefined(toProfile(rest)),
		};
		// 2. チェックする（ここでエラーになれば、値は何も変わらない）
		Employee.assertValidPreviousCompanyDates(profile);
		if (skills !== undefined) {
			assertNoDuplicateSkillIds(skills.map((skill) => skill.skillId));
		}
		const projectHistories = projects?.map((project) =>
			ProjectHistory.create(project),
		);

		// 3. チェックが通ったので値を変える。スキル・案件履歴は送られてきたときだけ差し替える
		this._profile = profile;
		if (skills !== undefined) {
			this._skills = skills;
			this._skillsReplaced = true;
		}
		if (projectHistories !== undefined) {
			this._projectHistories = projectHistories;
			this._projectHistoriesReplaced = true;
		}
	}

	/** 社員コードの採番ルール（既存の最大コードの次の番号を接頭辞+3桁以上の数字で生成） */
	static nextEmployeeCode(lastCode: string | null): string {
		if (lastCode === null) return `${EMPLOYEE_CODE_PREFIX}001`;

		// 接頭辞の後ろの数字部分を取り出す（例："EMP005" → "005"）
		const match = new RegExp(`^${EMPLOYEE_CODE_PREFIX}(\\d+)$`).exec(lastCode);
		if (!match) {
			throw new Error(`不正な社員コード形式です: ${lastCode}`);
		}

		const nextNumber = Number(match[1]) + 1;
		return `${EMPLOYEE_CODE_PREFIX}${String(nextNumber).padStart(3, "0")}`;
	}

	/** 前職1〜3社目それぞれの開始日・終了日の前後関係をチェックする（部分入力可） */
	static assertValidPreviousCompanyDates(data: PreviousCompanyDates): void {
		// [開始日, 終了日]の組を3社分並べ、両方入力されている組だけチェックする
		const pairs = [
			[data.previousCompany1StartDate, data.previousCompany1EndDate],
			[data.previousCompany2StartDate, data.previousCompany2EndDate],
			[data.previousCompany3StartDate, data.previousCompany3EndDate],
		] as const;

		pairs.forEach(([start, end], index) => {
			if (start !== undefined && end !== undefined) {
				assertValidDateRange(start, end, PREVIOUS_COMPANY_LABELS[index]!);
			}
		});
	}
}
