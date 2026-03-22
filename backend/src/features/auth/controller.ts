import type { RouteHandler } from "@hono/zod-openapi";
import { getCookie } from "hono/cookie";
import { loginService, registerService, meService } from "./service";
import type { loginRoute, registerRoute, meRoute } from "./types/routes";
import { setAuthCookie } from "@/lib/cookie";

export const loginController: RouteHandler<typeof loginRoute> = async (c) => {
  const { email, password } = c.req.valid("json");

  const result = await loginService(email, password);

  if (!result) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  setAuthCookie(c, result.token);

  return c.json({ message: "Login success" }, 200);
};

export const registerController: RouteHandler<typeof registerRoute> = async (
  c,
) => {
  const { email, password } = c.req.valid("json");

  const result = await registerService(email, password);

  if (!result) {
    return c.json({ message: "Email already in use" }, 409);
  }

  setAuthCookie(c, result.token);

  return c.json({ message: "Register success" }, 201);
};

export const meController: RouteHandler<typeof meRoute> = async (c) => {
  const token = getCookie(c, "access_token");

  if (!token) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  const user = await meService(token);

  if (!user) {
    return c.json({ message: "Unauthorized" }, 401);
  }

  return c.json({ id: user.id, email: user.email }, 200);
};
