import { describe, it, expect, vi, afterEach } from "vitest";
import { Employee, ProjectHistory, InvalidDateRangeError } from "../domain/employee";

describe("Employee.nextEmployeeCode", () => {
  it("直前のコードが無い場合、EMP001を返す", () => {
    expect(Employee.nextEmployeeCode(null)).toBe("EMP001");
  });

  it("直前のコードの次の番号を3桁ゼロ埋めで返す", () => {
    expect(Employee.nextEmployeeCode("EMP005")).toBe("EMP006");
  });

  it("3桁を超える場合はそのまま桁数が増える", () => {
    expect(Employee.nextEmployeeCode("EMP999")).toBe("EMP1000");
  });

  it("EMPで始まらない不正な形式の場合は例外を投げる", () => {
    expect(() => Employee.nextEmployeeCode("XXX001")).toThrow(
      "不正な社員コード形式です: XXX001",
    );
  });
});

describe("Employee.toBoolean", () => {
  it("有はtrueに変換する", () => {
    expect(Employee.toBoolean("有")).toBe(true);
  });

  it("無はfalseに変換する", () => {
    expect(Employee.toBoolean("無")).toBe(false);
  });
});

describe("Employee.assertNoDuplicateSkillIds", () => {
  it("重複が無ければ何もしない", () => {
    expect(() => Employee.assertNoDuplicateSkillIds([1, 2, 3])).not.toThrow();
  });

  it("重複があれば例外を投げる", () => {
    expect(() => Employee.assertNoDuplicateSkillIds([1, 2, 1])).toThrow(
      "スキルが重複して指定されています",
    );
  });
});

describe("ProjectHistory.create", () => {
  const base = {
    active: false,
    projectName: "案件A",
    factory: "現場A",
    skills: [1, 2],
    contracts: [],
  };

  it("endDateが無い場合は生成できる", () => {
    const history = ProjectHistory.create({ ...base, startDate: "2026-01-01" });
    expect(history.startDate).toBe("2026-01-01");
    expect(history.endDate).toBeUndefined();
  });

  it("endDateがstartDateより後の場合は生成できる", () => {
    const history = ProjectHistory.create({
      ...base,
      startDate: "2026-01-01",
      endDate: "2026-02-01",
    });
    expect(history.endDate).toBe("2026-02-01");
  });

  it("endDateがstartDateより前の場合、InvalidDateRangeErrorを投げる", () => {
    expect(() =>
      ProjectHistory.create({
        ...base,
        startDate: "2026-02-01",
        endDate: "2026-01-01",
      }),
    ).toThrow(InvalidDateRangeError);
  });

  it("endDateとstartDateが同じ場合は許容する（即日参入・即日終了）", () => {
    expect(() =>
      ProjectHistory.create({
        ...base,
        startDate: "2026-01-01",
        endDate: "2026-01-01",
      }),
    ).not.toThrow();
  });

  it("active:trueなのにendDateが過去の場合、InvalidDateRangeErrorを投げる", () => {
    expect(() =>
      ProjectHistory.create({
        ...base,
        active: true,
        startDate: "2020-01-01",
        endDate: "2020-02-01",
      }),
    ).toThrow(InvalidDateRangeError);
  });

  it("active:falseならendDateが過去でもエラーにならない", () => {
    expect(() =>
      ProjectHistory.create({
        ...base,
        active: false,
        startDate: "2020-01-01",
        endDate: "2020-02-01",
      }),
    ).not.toThrow();
  });

  it("active:trueでendDateが未来の場合はエラーにならない", () => {
    expect(() =>
      ProjectHistory.create({
        ...base,
        active: true,
        startDate: "2020-01-01",
        endDate: "2099-01-01",
      }),
    ).not.toThrow();
  });

  it("skillIds・contractsがそのまま保持される", () => {
    const history = ProjectHistory.create({
      ...base,
      startDate: "2026-01-01",
      contracts: [{ startDate: "2026-01-01", unitPrice: 600000 }],
    });
    expect(history.skillIds).toEqual([1, 2]);
    expect(history.contracts).toEqual([
      { startDate: "2026-01-01", unitPrice: 600000 },
    ]);
  });

  it("skillsが重複している場合は例外を投げる", () => {
    expect(() =>
      ProjectHistory.create({ ...base, skills: [1, 1], startDate: "2026-01-01" }),
    ).toThrow("スキルが重複して指定されています");
  });
});

describe("ProjectHistory.create — タイムゾーン", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("JST09:30時点では、今日終了する稼働中案件を受理する（UTC深夜0:30 = JST9:30）", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T00:30:00Z"));

    expect(() =>
      ProjectHistory.create({
        active: true,
        projectName: "案件A",
        factory: "現場A",
        skills: [],
        startDate: "2026-01-01",
        endDate: "2026-09-30",
        contracts: [],
      }),
    ).not.toThrow();
  });

  it("JST翌0:30時点では、前日終了扱いの稼働中案件をエラーにする（UTC15:30 = JST翌0:30）", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-30T15:30:00Z"));

    expect(() =>
      ProjectHistory.create({
        active: true,
        projectName: "案件A",
        factory: "現場A",
        skills: [],
        startDate: "2026-01-01",
        endDate: "2026-09-30",
        contracts: [],
      }),
    ).toThrow(InvalidDateRangeError);
  });
});

describe("Employee.assertValidDateRange", () => {
  it("endDateがstartDate以降なら何もしない", () => {
    expect(() =>
      Employee.assertValidDateRange("2020-01-01", "2020-01-01", "前職"),
    ).not.toThrow();
  });

  it("endDateがstartDateより前の場合、ラベル付きメッセージでエラーを投げる", () => {
    expect(() =>
      Employee.assertValidDateRange("2020-02-01", "2020-01-01", "前職1社目"),
    ).toThrow("前職1社目の終了日は開始日以降である必要があります");
  });
});

describe("Employee.assertValidPreviousCompanyDates", () => {
  it("何も指定が無ければ何もしない", () => {
    expect(() => Employee.assertValidPreviousCompanyDates({})).not.toThrow();
  });

  it("開始日だけ・終了日だけの片方欠けはチェックしない", () => {
    expect(() =>
      Employee.assertValidPreviousCompanyDates({
        previousCompany1StartDate: "2020-01-01",
      }),
    ).not.toThrow();
  });

  it("前職1社目の開始日＞終了日の場合、ラベル付きでエラーを投げる", () => {
    expect(() =>
      Employee.assertValidPreviousCompanyDates({
        previousCompany1StartDate: "2020-02-01",
        previousCompany1EndDate: "2020-01-01",
      }),
    ).toThrow("前職1社目の終了日は開始日以降である必要があります");
  });

  it("前職2・3社目もそれぞれ独立して検証する", () => {
    expect(() =>
      Employee.assertValidPreviousCompanyDates({
        previousCompany2StartDate: "2020-02-01",
        previousCompany2EndDate: "2020-01-01",
      }),
    ).toThrow("前職2社目の終了日は開始日以降である必要があります");

    expect(() =>
      Employee.assertValidPreviousCompanyDates({
        previousCompany3StartDate: "2020-02-01",
        previousCompany3EndDate: "2020-01-01",
      }),
    ).toThrow("前職3社目の終了日は開始日以降である必要があります");
  });
});

describe("Employee.create", () => {
  const baseData = {
    skills: [],
    projects: [],
  };

  it("直前の社員コードから次の社員コードを採番する", () => {
    const employee = Employee.create(baseData, "EMP005");
    expect(employee.employeeCode).toBe("EMP006");
  });

  it("直前の社員コードが無い場合、EMP001になる", () => {
    const employee = Employee.create(baseData, null);
    expect(employee.employeeCode).toBe("EMP001");
  });

  it("hasSpouse等が未指定の場合はundefinedのまま", () => {
    const employee = Employee.create(baseData, null);
    expect(employee.hasSpouse).toBeUndefined();
    expect(employee.hasChildren).toBeUndefined();
    expect(employee.hasDependents).toBeUndefined();
  });

  it("hasSpouse等を有/無からboolean配列に変換する", () => {
    const employee = Employee.create(
      { ...baseData, hasSpouse: "有", hasChildren: "無" },
      null,
    );
    expect(employee.hasSpouse).toBe(true);
    expect(employee.hasChildren).toBe(false);
  });

  it("projectsをProjectHistoryの配列として保持する", () => {
    const employee = Employee.create(
      {
        ...baseData,
        projects: [
          {
            active: false,
            projectName: "案件A",
            factory: "現場A",
            skills: [1],
            startDate: "2026-01-01",
            contracts: [],
          },
        ],
      },
      null,
    );
    expect(employee.projectHistories).toHaveLength(1);
    expect(employee.projectHistories[0]).toBeInstanceOf(ProjectHistory);
    expect(employee.projectHistories[0]!.projectName).toBe("案件A");
  });

  it("案件履歴の日付が不正な場合、生成時にInvalidDateRangeErrorを投げる", () => {
    expect(() =>
      Employee.create(
        {
          ...baseData,
          projects: [
            {
              active: false,
              projectName: "案件A",
              factory: "現場A",
              skills: [],
              startDate: "2026-02-01",
              endDate: "2026-01-01",
              contracts: [],
            },
          ],
        },
        null,
      ),
    ).toThrow(InvalidDateRangeError);
  });

  it("前職の日付が不正な場合、生成時にInvalidDateRangeErrorを投げる", () => {
    expect(() =>
      Employee.create(
        {
          ...baseData,
          previousCompany1StartDate: "2020-02-01",
          previousCompany1EndDate: "2020-01-01",
        },
        null,
      ),
    ).toThrow(InvalidDateRangeError);
  });

  it("skillsが重複している場合、生成時に例外を投げる", () => {
    expect(() =>
      Employee.create(
        { ...baseData, skills: [{ skillId: 1, years: 1 }, { skillId: 1, years: 2 }] },
        null,
      ),
    ).toThrow("スキルが重複して指定されています");
  });
});
