import { z } from "@hono/zod-openapi";
import { ROLE_NAMES } from "@/constants/roles";

export const MessageSchema = z.object({ message: z.string() });

export const LoginAuthSchema = z.object({ idToken: z.string() });

export const RoleNameSchema = z.enum(ROLE_NAMES);
export type RoleName = z.infer<typeof RoleNameSchema>;

export const MeResponseSchema = z.object({
  id: z.number(),
  email: z.email(),
  role: RoleNameSchema,
  employee: z
    .object({
      id: z.number(),
      employeeCode: z.string(),
      name: z.string(),
    })
    .nullable(),
});
