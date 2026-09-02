import { z } from "@hono/zod-openapi";

export const MessageSchema = z.object({ message: z.string() });

export const LoginAuthSchema = z.object({ idToken: z.string() });

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
