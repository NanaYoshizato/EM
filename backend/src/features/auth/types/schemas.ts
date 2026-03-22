import { z } from "@hono/zod-openapi";

export const MessageSchema = z.object({ message: z.string() });

export const AuthBodySchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const MeResponseSchema = z.object({
  id: z.string(),
  email: z.string().email(),
});
