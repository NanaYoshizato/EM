import { apiClient } from "@/lib/apiClient";
import { Employee, EmployeeSearchParams } from "../types/employee";

export async function fetchEmployees(
  params: EmployeeSearchParams,
): Promise<Employee[]> {
  const query = new URLSearchParams();
  if (params.employeeNameForm) query.set("name", params.employeeNameForm);
  if (params.employeeNumberForm)
    query.set("employeeCode", params.employeeNumberForm);
  const qs = query.toString();
  const path = `/api/employees${qs ? `?${qs}` : ""}`;
  return apiClient.get(path);
}

export async function deleteEmployee(id: number): Promise<void> {
  await apiClient.delete(`/api/employees/${id}`);
}
