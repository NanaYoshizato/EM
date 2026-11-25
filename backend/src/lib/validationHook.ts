import type { Context } from "hono";
import type { ZodError } from "zod";

/** 入力チェックのエラーを文言にする（送られてきた値は含めず、項目名だけを示す） */
export const toValidationMessage = (error: ZodError): string => {
  const fields = [
    ...new Set(error.issues.map((issue) => issue.path.join(".")).filter(Boolean)),
  ];
  if (fields.length > 0) {
    return `入力内容に誤りがあります（${fields.join("、")}）`;
  }
  // 項目に紐づかないチェック（例：更新する項目が無い）は、自分で書いた文言を返す
  const custom = error.issues.find((issue) => issue.code === "custom");
  return custom?.message ?? "入力内容に誤りがあります";
};

export const validationHook = (
  result: { success: true } | { success: false; error: ZodError },
  c: Context,
) => {
  if (!result.success) {
    return c.json({ error: toValidationMessage(result.error) }, 400);
  }
};
