import { describe, it, expect } from "vitest";
import { createEmployeeSchema, EmployeeListQuerySchema, updateEmployeeSchema } from "../types/employee.schema";

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

describe("null（値を消す・値なし）", () => {
  it.each([
    "phone", "joinDate", "gitHub", "trainingEndDate", "previousCompany1Name", "previousCompany1EndDate",
    "monthlyEstimatedSalary", "postalCode", "hasSpouse", "myNumber", "salaryAccount",
  ])("更新：任意の項目%sはnullを通す", (field) => {
    expect(updateEmployeeSchema.safeParse({ [field]: null }).success).toBe(true);
  });

  it.each(["name", "furigana", "birthDate", "gender", "specialty", "workStatus", "skills", "projects"])(
    "更新：登録で必須の項目%sはnullを弾く",
    (field) => {
      expect(updateEmployeeSchema.safeParse({ [field]: null }).success).toBe(false);
    },
  );

  it("登録：任意の項目のnullを通す", () => {
    const result = createEmployeeSchema.safeParse({
      email: "a@test.com",
      name: "山田太郎",
      furigana: "ヤマダタロウ",
      birthDate: "2000-01-01",
      gender: "MALE",
      specialty: "FE",
      workStatus: "WAITING",
      gitHub: null,
      phone: null,
      skills: [],
      projects: [
        {
          active: true,
          projectName: "案件A",
          factory: "現場A",
          skills: [],
          startDate: "2026-01-01",
          endDate: null,
          contracts: [{ startDate: "2026-01-01", unitPrice: null }],
        },
      ],
    });
    expect(result.success).toBe(true);
  });
});


describe("updateEmployeeSchema — 自由入力の文字の制限", () => {
  const parse = (data: Record<string, unknown>) => updateEmployeeSchema.safeParse(data);
  const project = (projectName: string) => ({
    active: false,
    projectName,
    factory: "株式会社A",
    skills: [],
    startDate: "2025-01-01",
    contracts: [],
  });

  it.each([
    ["NUL", "\u{0}"],
    ["改行", "\u{A}"],
    ["タブ", "\u{9}"],
    ["ESC", "\u{1B}"],
    ["DEL", "\u{7F}"],
    ["C1制御文字", "\u{85}"],
    ["双方向制御（RLO）", "\u{202E}"],
    ["双方向制御（RLI）", "\u{2067}"],
    ["アラビア文字マーク", "\u{61C}"],
    ["ゼロ幅スペース", "\u{200B}"],
    ["ゼロ幅接合子", "\u{200D}"],
    ["BOM", "\u{FEFF}"],
    ["ソフトハイフン", "\u{AD}"],
    ["行区切り", "\u{2028}"],
    ["段落区切り", "\u{2029}"],
    ["タグ文字", "\u{E0041}"],
    ["結合書記素接合子", "\u{34F}"],
    ["ハングルの空白文字", "\u{3164}"],
    ["点字の空白", "\u{2800}"],
    ["私用領域", "\u{E000}"],
    ["非文字", "\u{FFFF}"],
    ["片割れのサロゲート", "\uD800"],
    ["NBSP", "\u{A0}"],
    ["幅の違う空白", "\u{2003}"],
    ["異体字セレクタ", "\u{FE0F}"],
    ["漢字の異体字セレクタ", "\u{E0100}"],
    ["結合文字の積み重ね", "x\u{301}\u{302}\u{303}"],
  ])("%sを含む文字列は弾く", (_, char) => {
    expect(parse({ city: `港${char}区` }).success).toBe(false);
  });

  it("案件履歴の案件名も同じ制限がかかる", () => {
    expect(parse({ projects: [project("案件\u{202E}A")] }).success).toBe(false);
  });

  it.each([
    ["全角空白", "山田\u{3000}太郎"],
    ["半角空白", "Taro Yamada"],
    ["アクセント付きの文字", "José"],
    ["絵文字", "\u{1F363}"],
  ])("%sは通す", (_, name) => {
    expect(parse({ name }).success).toBe(true);
  });

  it("記号は自由入力では通す", () => {
    expect(parse({ previousCompany1Name: "A&B<商事>/'東京'" }).success).toBe(true);
  });

  it("分解された濁点はNFCで1文字にまとめる", () => {
    const result = parse({ furigana: "カ\u{3099}" });
    expect(result.success && result.data.furigana).toBe("ガ");
  });

  it("前後の空白は取り除く", () => {
    const result = parse({ city: "\u{3000}港区 " });
    expect(result.success && result.data.city).toBe("港区");
  });

  it.each(["name", "furigana", "emergencyContactName"])("人名（%s）は / と \\ を弾く", (field) => {
    expect(parse({ [field]: "../山田" }).success).toBe(false);
    expect(parse({ [field]: "山田\\太郎" }).success).toBe(false);
  });

  it("人名以外は / を通す", () => {
    expect(parse({ streetAddress: "1-2-3 ABCビル 5F/6F" }).success).toBe(true);
  });

  it.each(["octocat", "a-b", "a", "a".repeat(39), ""])("GitHubのユーザー名「%s」は通す", (gitHub) => {
    expect(parse({ gitHub }).success).toBe(true);
  });

  it.each(["../x", "a/b", "a?x=1", "-a", "a-", "a--b", "a_b", "a".repeat(40), "山田"])(
    "GitHubのユーザー名「%s」は弾く",
    (gitHub) => {
      expect(parse({ gitHub }).success).toBe(false);
    },
  );
});

describe("EmployeeListQuerySchema — 一覧の検索条件", () => {
  const parse = (params: Record<string, string>) => EmployeeListQuerySchema.safeParse(params);

  it("指定が無ければ、新しい順・1ページ目・12件", () => {
    expect(EmployeeListQuerySchema.parse({})).toEqual({ sort: "desc", page: 1, limit: 12 });
  });

  it("ページと件数は数字の文字列を数値にする", () => {
    expect(EmployeeListQuerySchema.parse({ page: "2", limit: "50" })).toMatchObject({ page: 2, limit: 50 });
  });

  it.each([
    ["件数が0", { limit: "0" }],
    ["件数が101（上限は100）", { limit: "101" }],
    ["ページが0", { page: "0" }],
    ["ページが小数", { page: "1.5" }],
    ["並び順がasc・desc以外", { sort: "new" }],
    ["専門領域が小文字", { specialtyFilter: "fe" }],
    ["専門領域が「all」（すべての場合は指定しない）", { specialtyFilter: "all" }],
    ["今月入社がtrue・false以外", { monthly: "1" }],
  ])("%s は受け付けない", (_, params) => {
    expect(parse(params).success).toBe(false);
  });

  it.each(["1", "3,12", Array.from({ length: 20 }, (_, i) => i + 1).join(",")])(
    "スキルID「%s」は受け付ける",
    (skillsFilter) => {
      expect(parse({ skillsFilter }).success).toBe(true);
    },
  );

  it.each([
    ["空", ""],
    ["0", "0"],
    ["数字以外", "react"],
    ["末尾のカンマ", "3,"],
    ["空白入り", "3, 12"],
    ["21件（上限は20件）", Array.from({ length: 21 }, (_, i) => i + 1).join(",")],
    ["10桁（DBの整数を超えうる）", "1234567890"],
  ])("スキルIDが%sなら受け付けない", (_, skillsFilter) => {
    expect(parse({ skillsFilter }).success).toBe(false);
  });
});


describe("家族の有無・稼働ステータスの値", () => {
  it.each([true, false])("家族の有無はboolean（%s）を通す", (hasSpouse) => {
    expect(updateEmployeeSchema.safeParse({ hasSpouse }).success).toBe(true);
  });

  it.each(["有", "無", "true"])("家族の有無の文字列「%s」は弾く", (hasSpouse) => {
    expect(updateEmployeeSchema.safeParse({ hasSpouse }).success).toBe(false);
  });

  it.each(["WORKING", "WAITING", "TRAINING", "IN_OFFICE", "BEFORE_JOIN", "LEAVE"])(
    "稼働ステータス%sを通す",
    (workStatus) => {
      expect(updateEmployeeSchema.safeParse({ workStatus }).success).toBe(true);
    },
  );

  it.each(["ASSIGNED", "CONTRACT_ENDED", "working"])("稼働ステータス%sは弾く", (workStatus) => {
    expect(updateEmployeeSchema.safeParse({ workStatus }).success).toBe(false);
  });
});
