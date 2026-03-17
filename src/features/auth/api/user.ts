import { AuthUser } from "../types/auth";

// TODO: バックエンドに GET /api/me が実装されたら差し替える
export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const isLoggedIn = sessionStorage.getItem("mock-logged-in");

  if (!isLoggedIn) return null;

  return {
    id: "1",
    name: "山田太郎",
    email: "test@example.com",
  };
}

// 本番版（バックエンドに /api/user ができたら）
// export async function fetchCurrentUser(): Promise<AuthUser | null> {
//   try {
//     const res = await fetch("http://localhost:3001/api/me", {
//       credentials: "include",
//     });
//
//     if (!res.ok) return null;
//
//     const data = await res.json();
//     return data.user;
//   } catch {
//     return null;
//   }
// }