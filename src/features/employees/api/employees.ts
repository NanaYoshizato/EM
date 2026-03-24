import { apiClient } from "@/lib/apiClient";
import { Employee, EmployeeSearchParams } from "../types/employee";
import { MOCK_EMPLOYEES } from "./mocks/employees";

export async function fetchEmployees(params: EmployeeSearchParams): Promise<Employee[]> {
  // バックエンド実装後に以下に差し替え:
  // const query = new URLSearchParams({
  //   name: params.employeeNameForm,
  //   employeeNumber: params.employeeNumberForm,
  // }).toString();
  // return apiClient.get(`/api/employees?${query}`);

  await new Promise((resolve) => setTimeout(resolve, 300));
  return MOCK_EMPLOYEES.filter((emp) => {
    const matchName   = params.employeeNameForm   ? emp.name.includes(params.employeeNameForm) : true;
    const matchNumber = params.employeeNumberForm ? emp.employeeNumber.includes(params.employeeNumberForm) : true;
    return matchName && matchNumber;
  });
}

export async function deleteEmployee(id: string): Promise<void> {
  // バックエンド実装後に以下に差し替え:
  // return apiClient.delete(`/api/employees/${id}`);

  await new Promise((resolve) => setTimeout(resolve, 200));
}