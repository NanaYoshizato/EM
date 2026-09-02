import { apiClient } from "@/lib/apiClient";
import type { LoginResponse } from "../types/auth";

export async function login(idToken: string): Promise<LoginResponse> {
  return apiClient.post("/api/login", { idToken });
}