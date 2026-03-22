import { apiClient } from "@/lib/apiClient";
import { LoginFormValues } from "../schemas/loginSchema";
import { LoginResponse } from "../types/auth";

export async function login(req: LoginFormValues): Promise<LoginResponse> {
    return apiClient.post("/api/login", req);
  }