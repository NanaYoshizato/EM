import type { Context } from "hono";

export const setAuthCookie = (c: Context, token: string) => {
  c.header(
    "Set-Cookie",
    `access_token=${token}; HttpOnly; Path=/; Max-Age=3600`,
  );
};
