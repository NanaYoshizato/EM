import type { RouteHandler } from "@hono/zod-openapi";
import { getCookie } from "hono/cookie";
import { loginService, registerService, meService, logoutService } from "./service";
import type { loginRoute, registerRoute, logoutRoute, meRoute } from "./types/routes";
import { setAuthCookie, deleteAuthCookie } from "@/lib/cookie";

/** ログインコントローラー */
export const loginController: RouteHandler<typeof loginRoute> = async (c) => {
  const { idToken } = c.req.valid("json");

  try {
    const result = await loginService(idToken);

    if (!result || result.code !== "SUCCESS") {
      return c.json({ code: "UNAUTHORIZED", message: "認証に失敗しました" }, 401);
    }

    setAuthCookie(c, result.sessionCookie);

    return c.json({ code: "Login success", message: "ログインに成功しました" }, 200);
  } catch (error: unknown) {
    console.error(error);
    return c.json({ code: "UNAUTHORIZED", message: "認証に失敗しました" }, 401);
  }
};

/** 登録コントローラー */
export const registerController: RouteHandler<typeof registerRoute> = async (
  c,
) => {
  const { idToken } = c.req.valid("json");

  const result = await registerService(idToken);

  if (!result) {
    return c.json({ message: "Email already in use" }, 409);
  }

  setAuthCookie(c, result.idToken);

  return c.json({ message: "Register success" }, 201);
};

/** ログアウトコントローラー */
export const logoutController: RouteHandler<typeof logoutRoute> = async (c) => {
  const sessionCookie = getCookie(c, "access_token");
  await logoutService(sessionCookie);
  deleteAuthCookie(c);
  return c.json({ code: "Logout success", message: "ログアウトに成功しました" }, 200);
};

/** ログイン情報コントローラー */
export const meController: RouteHandler<typeof meRoute> = async (c) => {
  const sessionCookie = getCookie(c, "access_token");
  const me = await meService(sessionCookie);

  if (!me) {
    deleteAuthCookie(c);
    return c.json({ code: "UNAUTHORIZED", message: "認証に失敗しました" }, 401);
  }

  return c.json(me, 200);
};
