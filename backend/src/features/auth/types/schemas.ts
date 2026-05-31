import { z } from "@hono/zod-openapi";

export const MessageSchema = z.object({ message: z.string() });

export const AuthBodySchema = z.object({
  email: z.email(),
  password: z.string().min(1),
});

export const MeResponseSchema = z.object({
  id: z.number(),
  email: z.email(),
  employee: z
    .object({
      id: z.number(),
      employeeCode: z.string(),
      name: z.string(),
    })
    .nullable(),
});
