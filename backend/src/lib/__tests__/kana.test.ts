import { describe, it, expect } from "vitest";
import { toKatakana } from "../kana";

describe("toKatakana", () => {
  it("ひらがなをカタカナにする", () => {
    expect(toKatakana("やまだ たろう")).toBe("ヤマダ タロウ");
  });

  it("小さい文字・濁点付きも変換する", () => {
    expect(toKatakana("じょうぎ")).toBe("ジョウギ");
  });

  it("カタカナ・漢字・英数字はそのまま", () => {
    expect(toKatakana("ヤマダ山田abc1")).toBe("ヤマダ山田abc1");
  });
});
