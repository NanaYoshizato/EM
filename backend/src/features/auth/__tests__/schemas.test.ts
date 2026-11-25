import { describe, it, expect } from "vitest";
import { LoginAuthSchema } from "../types/schemas";

describe("LoginAuthSchema — IDトークンの形式", () => {
  const parse = (idToken: unknown) => LoginAuthSchema.safeParse({ idToken });

  it.each([
    ["署名付きのJWT", "eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIxIn0.c2lnbmF0dXJl-_"],
    ["エミュレーターの署名なしJWT", "eyJhbGciOiJub25lIn0.eyJzdWIiOiIxIn0."],
  ])("%sは通す", (_, idToken) => {
    expect(parse(idToken).success).toBe(true);
  });

  it.each([
    ["空文字", ""],
    ["区切りが足りない", "abc.def"],
    ["区切りが多い", "a.b.c.d"],
    ["空白入り", "a.b .c"],
    ["改行入り", "a.b.c\n"],
    ["JWTで使わない記号", "a.b.c/../x"],
    ["長すぎる", `${"a".repeat(4093)}.b.c`],
    ["文字列以外", 123],
  ])("%sは弾く", (_, idToken) => {
    expect(parse(idToken).success).toBe(false);
  });
});
