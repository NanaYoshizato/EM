import type { Context } from "hono";
import { loginService } from "./service";

export const loginController = async (c: Context) => {
  const body = await c.req.json();

  const result = await loginService(body.email, body.password);

  if (!result) {
    return c.json({ message: "Invalid credentials" }, 401);
  }

  c.header(
    "Set-Cookie",
    `access_token=${result.token}; HttpOnly; Path=/; Max-Age=3600`,
  );

  return c.json({ message: "Login success" }, 200);
};
