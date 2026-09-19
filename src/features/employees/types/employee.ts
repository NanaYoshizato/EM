export type { EmployeeFormValues } from "../schemas/employeeSchema";

export type EmployeeStatus =
  | "WORKING"
  | "WAITING"
  | "TRAINING"
  | "BEFORE_JOIN"
  | "LEAVE";

// 社員一覧画面用ビュー: Employee + ProjectAssignment 合成
export type Employee = {
  employeeId: number;
  employeeCode: string;
  name: string;
  frameworks: string[];
  contractPrice: number | null;
  status: EmployeeStatus | null;
};

export const STATUS_LABEL: Record<EmployeeStatus, string> = {
  WORKING: "稼働中",
  WAITING: "待機中",
  TRAINING: "研修中",
  BEFORE_JOIN: "入社前",
  LEAVE: "退職",
};

export type EmployeeDetail = {
  id: string;
  employeeNumber: string;
  condition: "稼働中" | "待機中" | "研修中" | "入社前" | "退職" | null;
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

export type SortKey = "employeeCode" | "frameworks" | "contractPrice";
export type SortOrder = "asc" | "desc";
