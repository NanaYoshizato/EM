import { createMiddleware } from "hono/factory";
import { getAuthToken } from "@/lib/authToken";
import { authenticate } from "@/features/auth/service";
import type { User } from "@/features/auth/domain/user";

export type AuthEnv = { Variables: {user: User}};

export const requireAuth = createMiddleware<AuthEnv>(async (c, next) => {
    const user = await authenticate(getAuthToken(c));
    if(!user){
        return c.json({ error: "認証に失敗しました" }, 401);
    }
     c.set("user", user);
  await next();
})
