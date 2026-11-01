import type { FieldGroup, NewEmployeeInput } from "./types";

/** 項目がどのまとまりに属するか（権限の判定に使う） */
export const FIELD_GROUPS: Record<keyof NewEmployeeInput, FieldGroup> = {
    // 基本情報
    name: "basic",
    furigana: "basic",
    specialty: "basic",
    workStatus: "basic",
    skills: "basic",
    joinDate: "basic",
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
    basic: 1,
    projects: 1,
    contact: 2,
    confidential: 3,
};
