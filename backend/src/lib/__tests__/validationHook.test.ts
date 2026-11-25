import { describe, it, expect, vi } from "vitest";
import { z } from "zod";
import type { Context } from "hono";
import { toValidationMessage, validationHook } from "../validationHook";
import { updateEmployeeSchema } from "@/features/employees/types/employee.schema";

/** 失敗したZodのエラーを取り出す */
const errorOf = (schema: z.ZodType, input: unknown) => {
  const result = schema.safeParse(input);
  if (result.success) throw new Error("失敗するはずの入力が通った");
  return result.error;
};

describe("toValidationMessage", () => {
  it("エラーになった項目名を、重複なしで並べる（入れ子は.でつなぐ）", () => {
    const schema = z.object({
      id: z.number().int().positive(),
      projects: z.array(z.object({ unitPrice: z.number() })),
    });

    const message = toValidationMessage(
      errorOf(schema, { id: 1.5, projects: [{ unitPrice: "x" }] }),
    );

    expect(message).toBe("入力内容に誤りがあります（id、projects.0.unitPrice）");
  });

  it("1つの項目に複数のエラーがあっても、項目名は1回だけ", () => {
    const schema = z.object({ code: z.string().min(5).regex(/^[A-Z]+$/) });

    expect(toValidationMessage(errorOf(schema, { code: "a" }))).toBe(
      "入力内容に誤りがあります（code）",
    );
  });

  it("送られてきた値は文言に含めない", () => {
    const schema = z.object({ myNumber: z.string().regex(/^\d{12}$/) });

    const message = toValidationMessage(errorOf(schema, { myNumber: "12345678901X" }));

    expect(message).not.toContain("12345678901X");
  });

  it("項目に紐づかない自作のチェックは、その文言を返す", () => {
    expect(toValidationMessage(errorOf(updateEmployeeSchema, {}))).toBe(
      "更新する項目がありません",
    );
  });

  it("項目に紐づかないZod既定のエラー（bodyがオブジェクトでない等）は、共通の文言を返す", () => {
    expect(toValidationMessage(errorOf(z.object({ id: z.number() }), "abc"))).toBe(
      "入力内容に誤りがあります",
    );
  });
});

describe("validationHook", () => {
  const contextMock = () =>
    ({ json: vi.fn((data: unknown, status: number) => ({ data, status })) }) as unknown as Context;

  it("失敗したら、{ error }の形で400を返す", () => {
    const c = contextMock();
    const error = errorOf(z.object({ id: z.number() }), { id: "x" });

    const response = validationHook({ success: false, error }, c);

    expect(c.json).toHaveBeenCalledWith({ error: "入力内容に誤りがあります（id）" }, 400);
    expect(response).toEqual({ data: { error: "入力内容に誤りがあります（id）" }, status: 400 });
  });

  it("成功したら何も返さない（そのままcontrollerへ進む）", () => {
    const c = contextMock();

    expect(validationHook({ success: true }, c)).toBeUndefined();
    expect(c.json).not.toHaveBeenCalled();
  });
});
