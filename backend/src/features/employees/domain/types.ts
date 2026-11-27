/**
 * 社員ドメインの型
 */

import type { Employee, ProjectHistory } from "./employee";
import type { RoleName } from "@/constants/roles";

export type Gender = "MALE" | "FEMALE" | "OTHER";
export type Specialty = "FE" | "BE" | "UNDECIDED";
export type WorkStatus =
	| "WORKING"
	| "WAITING"
	| "TRAINING"
	| "IN_OFFICE"
	| "BEFORE_JOIN"
	| "LEAVE";

/** 社員の基本情報（日付は"YYYY-MM-DD"の文字列。値が無い項目はundefined） */
export type EmployeeProfile = {
	name: string;
	specialty: Specialty;
	workStatus: WorkStatus;
	furigana?: string | undefined;
	email?: string | undefined;
	birthDate?: string | undefined;
	gender?: Gender | undefined;
	phone?: string | undefined;
	joinDate?: string | undefined;
	gitHub?: string | undefined;
	trainingEndDate?: string | undefined;
	previousCompany1Name?: string | undefined;
	previousCompany1StartDate?: string | undefined;
	previousCompany1EndDate?: string | undefined;
	previousCompany2Name?: string | undefined;
	previousCompany2StartDate?: string | undefined;
	previousCompany2EndDate?: string | undefined;
	previousCompany3Name?: string | undefined;
	previousCompany3StartDate?: string | undefined;
	previousCompany3EndDate?: string | undefined;
	weeklyWorkHours?: string | undefined;
	monthlyEstimatedSalary?: number | undefined;
	postalCode?: string | undefined;
	prefecture?: string | undefined;
	city?: string | undefined;
	streetAddress?: string | undefined;
	emergencyContactName?: string | undefined;
	emergencyContactRelationship?: string | undefined;
	emergencyContactPhone?: string | undefined;
	hasSpouse?: boolean | undefined;
	hasChildren?: boolean | undefined;
	hasDependents?: boolean | undefined;
	myNumber?: string | undefined;
	employmentInsuranceNumber?: string | undefined;
	basicPensionNumber?: string | undefined;
	salaryAccount?: string | undefined;
};

/** 社員スキル（値オブジェクト） */
export type EmployeeSkill = Readonly<{ skillId: number; years: number }>;

/** 契約単価の履歴（1件分） */
export type Contract = Readonly<{
	startDate: string;
	unitPrice?: number | null | undefined;
}>;

/** 案件履歴の入力（リクエストのprojects[]の1件分） */
export type ProjectHistoryInput = {
	active: boolean;
	projectName: string;
	factory: string;
	skills: ReadonlyArray<number>;
	startDate: string;
	endDate?: string | null | undefined;
	contracts: ReadonlyArray<Contract>;
};

/** 前職1〜3社目の開始日・終了日 */
export type PreviousCompanyDates = Pick<
	EmployeeProfile,
	| "previousCompany1StartDate"
	| "previousCompany1EndDate"
	| "previousCompany2StartDate"
	| "previousCompany2EndDate"
	| "previousCompany3StartDate"
	| "previousCompany3EndDate"
>;

/** 必ず値がある項目（nullで消せない） */
type RequiredProfileField = "name" | "specialty" | "workStatus";

/** 外から受け取る基本情報（任意の項目はnullで「値なし」） */
export type ProfileInput = Pick<EmployeeProfile, RequiredProfileField> & {
	[K in Exclude<keyof EmployeeProfile, RequiredProfileField>]?: EmployeeProfile[K] | null;
};

/** 新規登録の入力 */
export type NewEmployeeInput = ProfileInput & {
	skills: ReadonlyArray<EmployeeSkill>;
	projects: ReadonlyArray<ProjectHistoryInput>;
};

/** 更新の入力（ProfileInputの全項目を省略可能にしたもの。送られてきた項目だけを変更する） */
export type EmployeeChanges = {
	[K in keyof ProfileInput]?: ProfileInput[K] | undefined;
} & {
	skills?: ReadonlyArray<EmployeeSkill> | undefined;
	projects?: ReadonlyArray<ProjectHistoryInput> | undefined;
};

/** 社員が持つ値の一式（コンストラクタに渡す形） */
export type EmployeeState = {
	id: number | null;
	version: Date | null;
	employeeCode: string;
	profile: EmployeeProfile;
	skills: ReadonlyArray<EmployeeSkill>;
	projectHistories: ReadonlyArray<ProjectHistory>;
};

/** 業務エラーの結果コード（serviceがcontrollerに返す） */
export type EmployeeErrorCode =
	| "INVALID_DATE_RANGE"
	| "DUPLICATE_SKILL"
	| "INVALID_SKILL_ID"
	| "DUPLICATE_EMAIL"
	| "DUPLICATE_MY_NUMBER"
	| "DUPLICATE_EMPLOYEE_CODE"
	| "CONFLICT";

/**
 * 社員のDBへの保存・読み込みを行うポート（実装はrepository.ts）。
 * serviceはこの型だけを知り、Prismaなどの具体的な実装には依存しない。
 */
export type EmployeeRepository = {
	/** 既存社員コードの最大値（社員が1人もいなければnull） */
	findLastEmployeeCode(): Promise<string | null>;
	/** DBから社員を読み込む（存在しない・論理削除済みならnull） */
	findById(employeeId: number): Promise<Employee | null>;
	/** 新規社員を保存し、採番されたidを返す（重複はDuplicateFieldError、存在しないスキルはInvalidSkillIdError） */
	insert(employee: Employee): Promise<number>;
	/** 保存済みの社員を更新する（読み込み後に他の更新が入っていたらConcurrentUpdateError。重複・スキルはinsertと同じ） */
	update(employee: Employee): Promise<void>;
}

/**
 * 社員情報の権限の区分
 */
export type FieldGroup = "public" | "basic" | "contact" | "projects" | "confidential";


type OrNull<T> = { [K in keyof T]-?: Exclude<T[K], undefined> | null };

/**
 * 案件詳細履歴
 */
export type ProjectHistoryDetail = {
	active: boolean;
	projectName: string;
	factory: string;
	startDate: string;
	endDate: string | null;
	skills: { skillId: number; name: string }[];
	contracts: { startDate: string; unitPrice: number | null }[];
};

/**
 * 社員詳細（POSTの型をGET用に作りかえる。応答の型と合わせるため、配列はreadonlyにしない）
 */
export type EmployeeDetail  = {
	// 公開の項目（必ず読むのでnullにならない）
	employeeCode: string;
	name: string;
	specialty: Specialty;
	skills: { skillId: number; name: string; years: number }[];
	role: RoleName | null; //入社前社員の登録をするためnullを許容
	projects: ProjectHistoryDetail[] | null;
} & OrNull<Omit<ProfileInput, "name" | "specialty">>;

/** 社員一覧の1件（公開の項目だけ） */
export type EmployeeListItem = {
	employeeId: number;
	employeeCode: string;
	name: string;
	furigana: string | null;
	specialty: Specialty;
	joinDate: string | null; // "YYYY-MM"
	skills: string[];
};

/** 社員一覧の絞り込み・並び順・ページ */
export type EmployeeListCondition = {
	employeeCode?: string | undefined;
	name?: string | undefined;
	specialty?: Specialty | undefined;
	workStatus?: WorkStatus | undefined;
	skillIds?: number[] | undefined;
	joinedMonth?: string | undefined; // "YYYY-MM"
	sort: "asc" | "desc";
	page: number;
	limit: number;
};

/** 社員の読み取り専用ポート（実装はrepository.ts） */
export type EmployeeQueryRepository = {
	/**
	 * 社員詳細（存在しない・論理削除済みならnull）。
	 * groupsにあるまとまりの列だけをDBから読み、それ以外のまとまりの項目はnullで返す（公開の項目は必ず読む）
	 */
	findDetail(employeeId: number, groups: Set<FieldGroup>): Promise<EmployeeDetail | null>;
	/** 社員一覧（論理削除済みを除く）。該当件数と、指定したページの社員を返す */
	findList(condition: EmployeeListCondition): Promise<{ items: EmployeeListItem[]; total: number }>;
};
