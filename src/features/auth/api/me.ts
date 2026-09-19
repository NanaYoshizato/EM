import { apiClient } from "@/lib/apiClient";

export type MeResponse = {
  id: number;
  email: string;
  employee: {
    id: number;
    employeeCode: string;
    name: string;
  } | null;
};

export async function fetchMe(): Promise<MeResponse | null> {
  try {
    return await apiClient.get("/api/me");
  } catch {
    return null;
  }
}
