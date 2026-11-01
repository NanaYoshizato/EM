import type { Context } from "hono";

/**
 * リクエストからアクセストークンを取得する
 * フロントとバックエンドが別オリジンのため、Set-Cookieはブラウザ／フロント側に届かない。 
 * 
 * バックエンド(Hono)→バックエンド(Next)→フロント(Next)で受け渡しが行われている。
 * Next側がCookieをブラウザに付与している。
 * Honoの役割はFirebaseのトークン発行を行う。
 * トークンに含める設定値はHono > Nextが優先される
 * サーバーを中継するのでセキュリティ懸念
 */
export const getAuthToken = (c: Context): string | undefined => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  return authHeader.slice("Bearer ".length);
};
