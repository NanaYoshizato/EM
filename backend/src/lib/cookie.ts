import type { Context } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";

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

/**
 * リクエストからアクセストークンを取得する
 * フロントとバックエンドが別オリジンのため、Set-Cookieはブラウザ／フロント側に届かない。
 * そのためAuthorizationヘッダー（Bearer）を正とし、同一オリジンからの利用向けにCookieもフォールバックとして見る
 */
export const getAuthToken = (c: Context) => {
  const authHeader = c.req.header("Authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }
  return getCookie(c, "access_token");
};
