import { apiClient } from "@/lib/apiClient";

export async function logout(): Promise<void> {
  await apiClient.post("/api/logout", {});
}
