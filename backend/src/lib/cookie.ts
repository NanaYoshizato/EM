import type { Context } from "hono";
import { deleteCookie, setCookie } from "hono/cookie";

/** Cookieをセット */
export const setAuthCookie = (c: Context, token: string) => {
  setCookie(c, "access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production", // https環境のみ
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 5, // 有効期限5日
  })
};

/** Cookieを削除 */
export const deleteAuthCookie = (c: Context) => {
  deleteCookie(c, "access_token", {
    path: "/"
  })
};
