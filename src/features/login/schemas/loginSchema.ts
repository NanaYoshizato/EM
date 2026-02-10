import { z } from "zod";
import { messages } from "../../../constants/messages";

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, messages.common.validation.required)
    .email(messages.common.validation.invalidEmail),

  password: z
    .string()
    .min(1, messages.common.validation.required)
    .min(8, messages.common.validation.minLength(8)),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
