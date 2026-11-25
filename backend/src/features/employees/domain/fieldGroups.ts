import type { EmployeeDetail, FieldGroup, NewEmployeeInput } from "./types";

/** 
 * 項目がどのまとまりに属するか（権限の判定に使う）
 * PERMISSION_TABLEのemployee.○○の値を項目に設定
 *  */
export const FIELD_GROUPS: Record<keyof NewEmployeeInput, FieldGroup> = {
    // 公開（一覧に出る項目）
    name: "public",
    furigana: "public",
    specialty: "public",
    skills: "public",
    joinDate: "public",

    // 基本情報
    workStatus: "basic",
    trainingEndDate: "basic",
    gitHub: "basic",
    previousCompany1Name: "basic",
    previousCompany1StartDate: "basic",
    previousCompany1EndDate: "basic",
    previousCompany2Name: "basic",
    previousCompany2StartDate: "basic",
    previousCompany2EndDate: "basic",
    previousCompany3Name: "basic",
    previousCompany3StartDate: "basic",
    previousCompany3EndDate: "basic",

    // 連絡先
    email: "contact",
    phone: "contact",
    birthDate: "contact",
    gender: "contact",
    postalCode: "contact",
    prefecture: "contact",
    city: "contact",
    streetAddress: "contact",
    emergencyContactName: "contact",
    emergencyContactRelationship: "contact",
    emergencyContactPhone: "contact",

    // 案件履歴
    projects: "projects",

    // 機密情報
    myNumber: "confidential",
    salaryAccount: "confidential",
    employmentInsuranceNumber: "confidential",
    basicPensionNumber: "confidential",
    weeklyWorkHours: "confidential",
    monthlyEstimatedSalary: "confidential",
    hasSpouse: "confidential",
    hasChildren: "confidential",
    hasDependents: "confidential",
};

/** まとまりの守りの強さ */
export const GROUP_LEVELS: Record<FieldGroup, number> = {
    public: 0,
    basic: 1,
    projects: 1,
    contact: 2,
    confidential: 3,
};

export const DETAIL_FIELD_GROUPS: Record<keyof EmployeeDetail, FieldGroup> = {
    ...FIELD_GROUPS,
    employeeCode: "public",
    role: "basic",
};
