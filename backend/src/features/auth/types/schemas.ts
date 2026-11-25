import { z } from "@hono/zod-openapi";
import { ROLE_NAMES } from "@/constants/roles";

export const MessageSchema = z.object({ message: z.string() });

/**
 * FirebaseのIDトークン（JWT形式：英数字・-・_ の3つの区切りを.でつなぐ）
 * エミュレーターのトークンは署名が空のため、3つ目は空を許可する
 */
const ID_TOKEN_FORMAT = /^[\w-]+\.[\w-]+\.[\w-]*$/;

export const LoginAuthSchema = z.object({
  idToken: z.string().max(4096).regex(ID_TOKEN_FORMAT, "IDトークンの形式が正しくありません"),
});

export const RoleNameSchema = z.enum(ROLE_NAMES);
export type RoleName = z.infer<typeof RoleNameSchema>;

export const LoginResponseSchema = z.object({
  code: z.string(),
  message: z.string(),
  accessToken: z.string(),
});

export const MeResponseSchema = z.object({
  email: z.email(),
  role: RoleNameSchema,
  roleLabel: z.string(),
  employee: z
    .object({
      employeeCode: z.string(),
      name: z.string(),
    })
    .nullable(),
});
