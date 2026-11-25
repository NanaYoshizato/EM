import type { Context } from "hono";

/** リクエストのAuthorizationヘッダー（Bearer）から通行証（セッションCookieの値）を取り出す。無ければundefined */
export const getAuthToken = (c: Context): string | undefined => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return undefined;
  return authHeader.slice("Bearer ".length);
};
