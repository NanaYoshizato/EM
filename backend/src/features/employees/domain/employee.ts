/**
 * 社員(Employee)の集約
 * 社員に関する業務ルールをここに集約する
 */

export class InvalidDateRangeError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "InvalidDateRangeError";
	}
}

/** JSTは夏時間が無い固定UTC+9のため、ロケール依存無しで厳密に計算できる */
const todayInJST = (): string =>
	new Date(Date.now() + 9 * 3_600_000).toISOString().slice(0, 10);

/**
 * skillIdの重複を禁止する（配列全体に対するルールのため集約ルート/値
 * オブジェクトの生成処理から呼ばれる想定）。Zod側の`.refine()`で通常の
 * HTTPリクエストからは到達不能なので、専用のエラークラスは作らず素の
 * Errorを投げる（バリデーションを迂回した場合の防御なので500でよい）。
 */
const assertNoDuplicateSkillIds = (skillIds: ReadonlyArray<number>): void => {
	if (new Set(skillIds).size !== skillIds.length) {
		throw new Error("スキルが重複して指定されています");
	}
};

type ProjectHistoryInput = {
	active: boolean;
	projectName: string;
	factory: string;
	skills: number[];
	startDate: string;
	endDate?: string | undefined;
	contracts: ReadonlyArray<{
		startDate: string;
		unitPrice?: number | undefined;
	}>;
};

/**
 * 案件履歴。
 */
export class ProjectHistory {
	readonly active: boolean;
	readonly projectName: string;
	readonly factory: string;
	readonly skillIds: number[];
	readonly startDate: string;
	readonly endDate: string | undefined;
	readonly contracts: ReadonlyArray<{
		startDate: string;
		unitPrice?: number | undefined;
	}>;

	private constructor(input: ProjectHistoryInput) {
		this.active = input.active;
		this.projectName = input.projectName;
		this.factory = input.factory;
		this.skillIds = input.skills;
		this.startDate = input.startDate;
		this.endDate = input.endDate;
		this.contracts = input.contracts;
	}

	static create(input: ProjectHistoryInput): ProjectHistory {
		assertNoDuplicateSkillIds(input.skills);

		if (input.endDate !== undefined) {
			if (new Date(input.endDate) < new Date(input.startDate)) {
				throw new InvalidDateRangeError(
					"案件履歴の終了日は開始日以降である必要があります",
				);
			}
			if (input.active && input.endDate < todayInJST()) {
				throw new InvalidDateRangeError(
					"稼働中の案件に、過去の参画終了日は設定できません",
				);
			}
		}
		return new ProjectHistory(input);
	}
}

const PREVIOUS_COMPANY_LABELS = ["前職1社目", "前職2社目", "前職3社目"] as const;

type PreviousCompanyDates = {
	previousCompany1StartDate?: string | undefined;
	previousCompany1EndDate?: string | undefined;
	previousCompany2StartDate?: string | undefined;
	previousCompany2EndDate?: string | undefined;
	previousCompany3StartDate?: string | undefined;
	previousCompany3EndDate?: string | undefined;
};

/**
 * 社員（Employee）集約
 */
export class Employee {
	readonly employeeCode: string;
	readonly hasSpouse: boolean | undefined;
	readonly hasChildren: boolean | undefined;
	readonly hasDependents: boolean | undefined;
	readonly projectHistories: ProjectHistory[];

	private constructor(input: {
		employeeCode: string;
		hasSpouse: boolean | undefined;
		hasChildren: boolean | undefined;
		hasDependents: boolean | undefined;
		projectHistories: ProjectHistory[];
	}) {
		this.employeeCode = input.employeeCode;
		this.hasSpouse = input.hasSpouse;
		this.hasChildren = input.hasChildren;
		this.hasDependents = input.hasDependents;
		this.projectHistories = input.projectHistories;
	}

	/**
	 * 新規社員を生成する（社員コード採番・案件履歴/前職日付/スキル重複の
	 * 検証を内部で行う）。
	 * @param lastCode 採番時点での既存社員コードの最大値（存在しなければnull）
	 */
	static create(
		data: PreviousCompanyDates & {
			skills: ReadonlyArray<{ skillId: number; years: number }>;
			projects: ReadonlyArray<ProjectHistoryInput>;
			hasSpouse?: "有" | "無" | undefined;
			hasChildren?: "有" | "無" | undefined;
			hasDependents?: "有" | "無" | undefined;
		},
		lastCode: string | null,
	): Employee {
		assertNoDuplicateSkillIds(data.skills.map((skill) => skill.skillId));

		const projectHistories = data.projects.map((project) =>
			ProjectHistory.create(project),
		);

		Employee.assertValidPreviousCompanyDates(data);

		return new Employee({
			employeeCode: Employee.nextEmployeeCode(lastCode),
			hasSpouse:
				data.hasSpouse !== undefined
					? Employee.toBoolean(data.hasSpouse)
					: undefined,
			hasChildren:
				data.hasChildren !== undefined
					? Employee.toBoolean(data.hasChildren)
					: undefined,
			hasDependents:
				data.hasDependents !== undefined
					? Employee.toBoolean(data.hasDependents)
					: undefined,
			projectHistories,
		});
	}

	/** 社員コードの採番ルール（既存の最大コードの次の番号をEMP+3桁以上の数字で生成） */
	static nextEmployeeCode(lastCode: string | null): string {
		if (lastCode === null) return "EMP001";

		const match = /^EMP(\d+)$/.exec(lastCode);
		if (!match) {
			throw new Error(`不正な社員コード形式です: ${lastCode}`);
		}

		const nextNumber = Number(match[1]) + 1;
		return `EMP${String(nextNumber).padStart(3, "0")}`;
	}

	// 有無をtrue/falseに変換するルール
	static toBoolean(value: "有" | "無"): boolean {
		return value === "有";
	}

	/** skillIdの重複を禁止する（社員・案件履歴どちらのスキル一覧でも使う） */
	static assertNoDuplicateSkillIds(skillIds: ReadonlyArray<number>): void {
		assertNoDuplicateSkillIds(skillIds);
	}

	/** 開始日・終了日の前後関係を検証する汎用ルール（endDate < startDateを禁止） */
	static assertValidDateRange(
		startDate: string,
		endDate: string,
		label: string,
	): void {
		if (new Date(endDate) < new Date(startDate)) {
			throw new InvalidDateRangeError(
				`${label}の終了日は開始日以降である必要があります`,
			);
		}
	}

	/** 前職1〜3社目それぞれの開始日・終了日の前後関係を検証する（部分入力可） */
	static assertValidPreviousCompanyDates(data: PreviousCompanyDates): void {
		const pairs = [
			[data.previousCompany1StartDate, data.previousCompany1EndDate],
			[data.previousCompany2StartDate, data.previousCompany2EndDate],
			[data.previousCompany3StartDate, data.previousCompany3EndDate],
		] as const;

		pairs.forEach(([start, end], index) => {
			if (start !== undefined && end !== undefined) {
				Employee.assertValidDateRange(start, end, PREVIOUS_COMPANY_LABELS[index]!);
			}
		});
	}
}
