import { describe, it, expect } from "vitest";
import {
  DuplicateFieldError,
  DuplicateSkillError,
  Employee,
  EmployeeError,
  ProjectHistory,
  InvalidDateRangeError,
} from "../domain/employee";

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
    ).toThrow(DuplicateSkillError);
  });

  it("稼働中でも、過去の終了日を受理する", () => {
    expect(() =>
      ProjectHistory.create({
        ...base,
        active: true,
        startDate: "2020-01-01",
        endDate: "2020-02-01",
      }),
    ).not.toThrow();
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

  it("前職2・3社目もそれぞれ独立してチェックする", () => {
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

const baseProfile = {
  name: "山田太郎",
  specialty: "UNDECIDED",
  workStatus: "WAITING",
} as const;

describe("Employee.create", () => {
  const baseData = {
    ...baseProfile,
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
    expect(employee.profile.hasSpouse).toBeUndefined();
    expect(employee.profile.hasChildren).toBeUndefined();
    expect(employee.profile.hasDependents).toBeUndefined();
  });

  it("idはnull（未登録）になる", () => {
    const employee = Employee.create(baseData, null);
    expect(employee.id).toBeNull();
  });

  it("基本情報・スキルを保持する", () => {
    const employee = Employee.create(
      { ...baseData, email: "a@example.com", skills: [{ skillId: 1, years: 2 }] },
      null,
    );
    expect(employee.profile.name).toBe("山田太郎");
    expect(employee.profile.email).toBe("a@example.com");
    expect(employee.skills).toEqual([{ skillId: 1, years: 2 }]);
  });

  it("hasSpouse等を有/無からbooleanに変換する", () => {
    const employee = Employee.create(
      { ...baseData, hasSpouse: "有", hasChildren: "無" },
      null,
    );
    expect(employee.profile.hasSpouse).toBe(true);
    expect(employee.profile.hasChildren).toBe(false);
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
    ).toThrow(DuplicateSkillError);
  });
});

describe("Employee.reconstruct", () => {
  it("保存済みの値をそのまま組み立て、案件履歴をチェックしない", () => {
    const employee = Employee.reconstruct({
      id: 1,
      version: new Date("2026-10-01T00:00:00Z"),
      employeeCode: "EMP001",
      profile: baseProfile,
      skills: [{ skillId: 1, years: 1 }],
      projectHistories: [
        {
          // createなら弾かれる「終了日が開始日より前」の案件
          active: false,
          projectName: "案件A",
          factory: "現場A",
          skills: [],
          startDate: "2020-02-01",
          endDate: "2020-01-01",
          contracts: [],
        },
      ],
    });

    expect(employee.id).toBe(1);
    expect(employee.version).toEqual(new Date("2026-10-01T00:00:00Z"));
    expect(employee.employeeCode).toBe("EMP001");
    expect(employee.projectHistories[0]).toBeInstanceOf(ProjectHistory);
    expect(employee.skillsReplaced).toBe(false);
    expect(employee.projectHistoriesReplaced).toBe(false);
  });
});

describe("Employee.update", () => {
  const restore = (profile: Partial<Parameters<typeof Employee.reconstruct>[0]["profile"]> = {}) =>
    Employee.reconstruct({
      id: 1,
      version: new Date("2026-10-01T00:00:00Z"),
      employeeCode: "EMP001",
      profile: { ...baseProfile, phone: "090-0000-0000", ...profile },
      skills: [{ skillId: 1, years: 1 }],
      projectHistories: [],
    });

  it("送られてきた項目だけを変更し、送られてこなかった項目は保存済みの値を残す", () => {
    const employee = restore();
    employee.update({ name: "山田花子", phone: undefined });

    expect(employee.profile.name).toBe("山田花子");
    expect(employee.profile.phone).toBe("090-0000-0000");
    expect(employee.skills).toEqual([{ skillId: 1, years: 1 }]);
    expect(employee.skillsReplaced).toBe(false);
    expect(employee.projectHistoriesReplaced).toBe(false);
  });

  it("hasSpouse等を有/無からbooleanに変換する", () => {
    const employee = restore();
    employee.update({ hasSpouse: "有" });
    expect(employee.profile.hasSpouse).toBe(true);
  });

  it("skills・projectsが送られてきたら差し替え、差し替えたことを記録する", () => {
    const employee = restore();
    employee.update({
      skills: [{ skillId: 2, years: 3 }],
      projects: [
        {
          active: false,
          projectName: "案件B",
          factory: "現場B",
          skills: [2],
          startDate: "2026-01-01",
          contracts: [],
        },
      ],
    });

    expect(employee.skills).toEqual([{ skillId: 2, years: 3 }]);
    expect(employee.skillsReplaced).toBe(true);
    expect(employee.projectHistories[0]!.projectName).toBe("案件B");
    expect(employee.projectHistoriesReplaced).toBe(true);
  });

  it("前職の終了日だけ送られてきた場合、保存済みの開始日と合わせてチェックする", () => {
    const employee = restore({ previousCompany1StartDate: "2020-02-01" });
    expect(() =>
      employee.update({ previousCompany1EndDate: "2020-01-01" }),
    ).toThrow("前職1社目の終了日は開始日以降である必要があります");
  });

  it("保存済みの前職日付が不正でも、両方とも新しい値で上書きされればチェックを通る", () => {
    const employee = restore({
      previousCompany1StartDate: "2020-02-01",
      previousCompany1EndDate: "2020-01-01",
    });
    expect(() =>
      employee.update({
        previousCompany1StartDate: "2019-01-01",
        previousCompany1EndDate: "2019-12-31",
      }),
    ).not.toThrow();
  });

  it("チェックに失敗した場合、値を何も変えない", () => {
    const employee = restore();
    expect(() =>
      employee.update({
        name: "山田花子",
        skills: [{ skillId: 2, years: 1 }],
        projects: [
          {
            active: false,
            projectName: "案件B",
            factory: "現場B",
            skills: [],
            startDate: "2026-02-01",
            endDate: "2026-01-01",
            contracts: [],
          },
        ],
      }),
    ).toThrow(InvalidDateRangeError);

    expect(employee.profile.name).toBe("山田太郎");
    expect(employee.skills).toEqual([{ skillId: 1, years: 1 }]);
    expect(employee.skillsReplaced).toBe(false);
  });

  it("skillsが重複している場合は例外を投げる", () => {
    const employee = restore();
    expect(() =>
      employee.update({
        skills: [
          { skillId: 2, years: 1 },
          { skillId: 2, years: 2 },
        ],
      }),
    ).toThrow(DuplicateSkillError);
  });
});

describe("DuplicateFieldError", () => {
  it("重複した項目ごとに、結果コードと文言を持つ", () => {
    const error = new DuplicateFieldError("myNumber");
    expect(error).toBeInstanceOf(EmployeeError);
    expect(error.name).toBe("DuplicateFieldError");
    expect(error.code).toBe("DUPLICATE_MY_NUMBER");
    expect(error.message).toBe("マイナンバーが既に使用されています");
  });
});
