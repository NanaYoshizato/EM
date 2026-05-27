export type { EmployeeFormValues } from "../schemas/employeeSchema";

export type Employee = {
    id: string;
    employeeNumber: string;
    name: string;
    frameWork: string;
    projectValue: number;
    condition: "稼働中" | "待機中" | "研修中" | "入社前";
};

export type EmployeeDetail = {
    id: string;
    employeeNumber: string;
    condition: "稼働中" | "待機中" | "研修中" | "入社前";
    // 基本情報
    name: string;
    furigana: string;
    birthDate: string;
    gender: "男性" | "女性" | "その他";
    phone: string;
    email: string;
    joinDate: string;
    trainingEndDate?: string;
    trainingLanguages: string[];
    availableLanguages: string[];
    previousCompany1Name?: string;
    previousCompany1StartDate?: string;
    previousCompany1EndDate?: string;
    previousCompany2Name?: string;
    previousCompany2StartDate?: string;
    previousCompany2EndDate?: string;
    previousCompany3Name?: string;
    previousCompany3StartDate?: string;
    previousCompany3EndDate?: string;
    weeklyWorkHours?: string;
    monthlyEstimatedSalary?: string;
    // 住所
    postalCode?: string;
    prefecture?: string;
    city?: string;
    streetAddress?: string;
    // 緊急連絡先
    emergencyContactName?: string;
    emergencyContactRelationship?: string;
    emergencyContactPhone?: string;
    hasSpouse?: "有" | "無";
    hasChildren?: "有" | "無";
    hasDependents?: "有" | "無";
    // 機密情報
    myNumber?: string;
    employmentInsuranceNumber?: string;
    basicPensionNumber?: string;
    salaryAccount?: string;
};

export type EmployeeSearchParams = {
    employeeNameForm: string;
    employeeNumberForm: string;
};

export type SortKey = "employeeNumber" | "frameWork" | "projectValue";
export type SortOrder = "asc" | "desc";