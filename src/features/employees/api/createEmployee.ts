import { apiClient } from "@/lib/apiClient";
import { EmployeeFormValues } from "../types/employee";

const GENDER_MAP: Record<string, "MALE" | "FEMALE" | "OTHER"> = {
  男性: "MALE",
  女性: "FEMALE",
  その他: "OTHER",
};

export async function createEmployee(
  values: EmployeeFormValues,
): Promise<void> {
  const payload = {
    email: values.email,
    name: values.name,
    furigana: values.furigana,
    birthDate: values.birthDate,
    gender: GENDER_MAP[values.gender] ?? "OTHER",
    phone: values.phone || undefined,
    joinDate: values.joinDate || undefined,
    trainingEndDate: values.trainingEndDate || undefined,
    previousCompany1Name: values.previousCompany1Name || undefined,
    previousCompany1StartDate: values.previousCompany1StartDate || undefined,
    previousCompany1EndDate: values.previousCompany1EndDate || undefined,
    previousCompany2Name: values.previousCompany2Name || undefined,
    previousCompany2StartDate: values.previousCompany2StartDate || undefined,
    previousCompany2EndDate: values.previousCompany2EndDate || undefined,
    previousCompany3Name: values.previousCompany3Name || undefined,
    previousCompany3StartDate: values.previousCompany3StartDate || undefined,
    previousCompany3EndDate: values.previousCompany3EndDate || undefined,
    weeklyWorkHours: values.weeklyWorkHours || undefined,
    monthlyEstimatedSalary: values.monthlyEstimatedSalary
      ? Number(values.monthlyEstimatedSalary)
      : undefined,
    postalCode: values.postalCode || undefined,
    prefecture: values.prefecture || undefined,
    city: values.city || undefined,
    streetAddress: values.streetAddress || undefined,
    emergencyContactName: values.emergencyContactName || undefined,
    emergencyContactRelationship:
      values.emergencyContactRelationship || undefined,
    emergencyContactPhone: values.emergencyContactPhone || undefined,
    hasSpouse: values.hasSpouse || undefined,
    hasChildren: values.hasChildren || undefined,
    hasDependents: values.hasDependents || undefined,
    myNumber: values.myNumber || undefined,
    employmentInsuranceNumber: values.employmentInsuranceNumber || undefined,
    basicPensionNumber: values.basicPensionNumber || undefined,
    salaryAccount: values.salaryAccount || undefined,
  };

  await apiClient.post("/api/employees", payload);
}
