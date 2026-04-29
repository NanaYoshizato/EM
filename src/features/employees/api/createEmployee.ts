import { EmployeeFormValues } from "../types/employee";

export async function createEmployee(values: EmployeeFormValues): Promise<void> {
  // バックエンド実装後に以下に差し替え:
  // return apiClient.post("/api/employees", values);

  console.log("createEmployee (mock):", values);
  await new Promise((resolve) => setTimeout(resolve, 300));
}
