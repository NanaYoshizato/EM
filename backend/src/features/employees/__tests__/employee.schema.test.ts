import { describe, it, expect } from "vitest";
import { updateEmployeeSchema } from "../types/employee.schema";

describe("updateEmployeeSchema — 空の更新", () => {
  it("更新する項目が1つも無ければ弾く", () => {
    expect(updateEmployeeSchema.safeParse({}).success).toBe(false);
  });

  it("スキーマに無い項目だけの場合も、取り除かれて空になるので弾く", () => {
    expect(updateEmployeeSchema.safeParse({ foo: 1 }).success).toBe(false);
  });

  it("項目が1つでもあれば通す", () => {
    expect(updateEmployeeSchema.safeParse({ name: "山田花子" }).success).toBe(true);
  });
});
