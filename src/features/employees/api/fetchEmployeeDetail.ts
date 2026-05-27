import { EmployeeDetail } from "../types/employee";
import { MOCK_EMPLOYEE_DETAILS } from "./mocks/employees";

export async function fetchEmployeeDetail(id: string): Promise<EmployeeDetail> {
  // バックエンド実装後に以下に差し替え:
  // return apiClient.get(`/api/employees/${id}`);

  await new Promise((resolve) => setTimeout(resolve, 300));
  const employee = MOCK_EMPLOYEE_DETAILS.find((e) => e.id === id);
  if (!employee) throw new Error("社員が見つかりませんでした");
  return employee;
}
