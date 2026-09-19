import { apiClient } from "@/lib/apiClient";
import { EmployeeDetail } from "../types/employee";

type EmployeeDetailResponse = {
  employeeId: number;
  employeeCode: string;
  userId: number;
  name: string;
  furigana: string | null;
  email: string | null;
  birthDate: string | null;
  gender: "MALE" | "FEMALE" | "OTHER" | null;
  phone: string | null;
  joinDate: string | null;
  trainingEndDate: string | null;
  studiedFrameworkIds: number[];
  availableFrameworkIds: number[];
  studiedFrameworkNames: string[];
  availableFrameworkNames: string[];
  status:
    | "WORKING"
    | "WAITING"
    | "TRAINING"
    | "BEFORE_JOIN"
    | "LEAVE"
    | null;
  previousCompany1Name: string | null;
  previousCompany1StartDate: string | null;
  previousCompany1EndDate: string | null;
  previousCompany2Name: string | null;
  previousCompany2StartDate: string | null;
  previousCompany2EndDate: string | null;
  previousCompany3Name: string | null;
  previousCompany3StartDate: string | null;
  previousCompany3EndDate: string | null;
  weeklyWorkHours: string | null;
  monthlyEstimatedSalary: number | null;
  postalCode: string | null;
  prefecture: string | null;
  city: string | null;
  streetAddress: string | null;
  emergencyContactName: string | null;
  emergencyContactRelationship: string | null;
  emergencyContactPhone: string | null;
  hasSpouse: boolean | null;
  hasChildren: boolean | null;
  hasDependents: boolean | null;
  myNumber: string | null;
  employmentInsuranceNumber: string | null;
  basicPensionNumber: string | null;
  salaryAccount: string | null;
};

const GENDER_LABEL = {
  MALE: "男性",
  FEMALE: "女性",
  OTHER: "その他",
} as const;

const STATUS_TO_CONDITION = {
  WORKING: "稼働中",
  WAITING: "待機中",
  TRAINING: "研修中",
  BEFORE_JOIN: "入社前",
  LEAVE: "退職",
} as const;

const toYesNo = (v: boolean | null): "有" | "無" | undefined => {
  if (v === true) return "有";
  if (v === false) return "無";
  return undefined;
};

const toDateString = (v: string | null): string => (v ? v.slice(0, 10) : "");

const mapToDetail = (res: EmployeeDetailResponse): EmployeeDetail => ({
  id: String(res.employeeId),
  employeeNumber: res.employeeCode,
  condition: res.status ? STATUS_TO_CONDITION[res.status] : null,
  name: res.name,
  furigana: res.furigana ?? "",
  birthDate: toDateString(res.birthDate),
  gender: res.gender ? GENDER_LABEL[res.gender] : "その他",
  phone: res.phone ?? "",
  email: res.email ?? "",
  joinDate: toDateString(res.joinDate),
  trainingEndDate: toDateString(res.trainingEndDate) || undefined,
  trainingLanguages: res.studiedFrameworkNames,
  availableLanguages: res.availableFrameworkNames,
  previousCompany1Name: res.previousCompany1Name ?? undefined,
  previousCompany1StartDate:
    toDateString(res.previousCompany1StartDate) || undefined,
  previousCompany1EndDate:
    toDateString(res.previousCompany1EndDate) || undefined,
  previousCompany2Name: res.previousCompany2Name ?? undefined,
  previousCompany2StartDate:
    toDateString(res.previousCompany2StartDate) || undefined,
  previousCompany2EndDate:
    toDateString(res.previousCompany2EndDate) || undefined,
  previousCompany3Name: res.previousCompany3Name ?? undefined,
  previousCompany3StartDate:
    toDateString(res.previousCompany3StartDate) || undefined,
  previousCompany3EndDate:
    toDateString(res.previousCompany3EndDate) || undefined,
  weeklyWorkHours: res.weeklyWorkHours ?? undefined,
  monthlyEstimatedSalary:
    res.monthlyEstimatedSalary != null
      ? String(res.monthlyEstimatedSalary)
      : undefined,
  postalCode: res.postalCode ?? undefined,
  prefecture: res.prefecture ?? undefined,
  city: res.city ?? undefined,
  streetAddress: res.streetAddress ?? undefined,
  emergencyContactName: res.emergencyContactName ?? undefined,
  emergencyContactRelationship: res.emergencyContactRelationship ?? undefined,
  emergencyContactPhone: res.emergencyContactPhone ?? undefined,
  hasSpouse: toYesNo(res.hasSpouse),
  hasChildren: toYesNo(res.hasChildren),
  hasDependents: toYesNo(res.hasDependents),
  myNumber: res.myNumber ?? undefined,
  employmentInsuranceNumber: res.employmentInsuranceNumber ?? undefined,
  basicPensionNumber: res.basicPensionNumber ?? undefined,
  salaryAccount: res.salaryAccount ?? undefined,
});

export async function fetchEmployeeDetail(id: string): Promise<EmployeeDetail> {
  const res = (await apiClient.get(
    `/api/employees/${id}`,
  )) as EmployeeDetailResponse;
  return mapToDetail(res);
}
