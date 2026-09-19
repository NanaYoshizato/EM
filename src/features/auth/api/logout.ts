import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { apiClient } from "@/lib/apiClient";

export async function logout(): Promise<void> {
  try {
    await signOut(auth);
  } catch (error) {
    console.error("Firebase signOut error:", error);
  }
  await apiClient.post("/api/logout", {});
}
