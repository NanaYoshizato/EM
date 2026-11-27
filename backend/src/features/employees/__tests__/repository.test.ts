import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
    $queryRaw: vi.fn(),
    employee: {
      findMany: vi.fn(),
      findFirst: vi.fn(),
      count: vi.fn(),
    },
  },
}));

import {
  employeeRepository,
  employeeQueryRepository,
  findEmployeeSummaryByUserId,
} from "../repository";
import { prisma } from "@/lib/prisma";
import { Gender, Specialty, WorkStatus, Prisma } from "@prisma/client";
import {
  ConcurrentUpdateError,
  DuplicateFieldError,
  Employee,
  InvalidSkillIdError,
} from "../domain/employee";
import { DETAIL_FIELD_GROUPS } from "../domain/fieldGroups";
import { updateEmployeeSchema } from "../types/employee.schema";
import type { FieldGroup } from "../domain/types";

const mockTransaction = vi.mocked(prisma.$transaction);
const mockQueryRaw = vi.mocked(prisma.$queryRaw);
const mockEmployeeFindMany = vi.mocked(prisma.employee.findMany);
const mockEmployeeFindFirst = vi.mocked(prisma.employee.findFirst);
const mockEmployeeCount = vi.mocked(prisma.employee.count);

const baseInput = {
  email: "test@example.com",
  birthDate: "1990-01-01",
  name: "山田太郎",
  furigana: "ヤマダタロウ",
  gender: Gender.MALE,
  specialty: Specialty.UNDECIDED,
  workStatus: WorkStatus.WAITING,
  skills: [],
  projects: [],
};

beforeEach(() => {
  vi.clearAllMocks();
});

/** トランザクション内で使うtxの偽物を作り、$transactionのコールバックに渡す */
const runTransaction = () => {
  const tx = {
    employee: {
      create: vi.fn().mockResolvedValue({ id: 6 }),
      update: vi.fn().mockResolvedValue({}),
      updateMany: vi.fn().mockResolvedValue({ count: 1 }),
    },
    skill: { findMany: vi.fn().mockResolvedValue([]) },
    employeeSkill: { deleteMany: vi.fn() },
    employeeProjectHistory: { deleteMany: vi.fn() },
    employeeProjectHistorySkill: { deleteMany: vi.fn() },
    employeeProjectContract: { deleteMany: vi.fn() },
  };
  (
    mockTransaction as unknown as {
      mockImplementation: (
        fn: (cb: (t: typeof tx) => Promise<unknown>) => Promise<unknown>,
      ) => void;
    }
  ).mockImplementation(async (callback) => callback(tx));
  return tx;
};

const p2002 = (column: string) =>
  new Prisma.PrismaClientKnownRequestError("Unique constraint failed", {
    code: "P2002",
    clientVersion: "6.19.3",
    meta: { target: [column] },
  });

const storedEmployee = () =>
  Employee.reconstruct({
    id: 1,
    version: new Date("2026-10-01T00:00:00Z"),
    employeeCode: "EMP001",
    profile: { name: "山田太郎", specialty: "UNDECIDED", workStatus: "WAITING" },
    skills: [{ skillId: 1, years: 1 }],
    projectHistories: [],
  });

describe("findLastEmployeeCode", () => {
  it("既存社員コードの最大値を返す", async () => {
    mockQueryRaw.mockResolvedValue([{ employee_code: "EMP101" }]);

    const result = await employeeRepository.findLastEmployeeCode();

    expect(result).toBe("EMP101");
  });

  it("社員が1人もいない場合、nullを返す", async () => {
    mockQueryRaw.mockResolvedValue([]);

    const result = await employeeRepository.findLastEmployeeCode();

    expect(result).toBeNull();
  });
});

describe("findById", () => {
  it("DBの値から社員を組み立てる（nullはundefined、日付は文字列に変換）", async () => {
    mockEmployeeFindFirst.mockResolvedValue({
      id: 1,
      employeeCode: "EMP001",
      name: "山田太郎",
      specialty: "UNDECIDED",
      workStatus: "WAITING",
      furigana: null,
      birthDate: new Date("1990-01-01"),
      joinDate: new Date("2026-04-01"),
      previousCompany1StartDate: null,
      hasSpouse: true,
      updatedAt: new Date("2026-10-01T00:00:00Z"),
      employeeSkills: [{ skillId: 1, years: 2.5 }],
      projectHistories: [
        {
          active: false,
          projectName: "案件A",
          factory: "現場A",
          startDate: new Date("2026-01-01"),
          endDate: null,
          skills: [{ skillId: 1 }],
          contracts: [{ startDate: new Date("2026-01-01"), unitPrice: null }],
        },
      ],
    } as never);

    const employee = await employeeRepository.findById(1);

    expect(mockEmployeeFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1, isDelete: false } }),
    );
    expect(employee?.id).toBe(1);
    expect(employee?.version).toEqual(new Date("2026-10-01T00:00:00Z"));
    expect(employee?.profile.furigana).toBeUndefined();
    expect(employee?.profile.birthDate).toBe("1990-01-01");
    expect(employee?.profile.joinDate).toBe("2026-04-01");
    expect(employee?.profile.hasSpouse).toBe(true);
    expect(employee?.skills).toEqual([{ skillId: 1, years: 2.5 }]);
    expect(employee?.projectHistories[0]).toMatchObject({
      startDate: "2026-01-01",
      endDate: undefined,
      skillIds: [1],
      contracts: [{ startDate: "2026-01-01", unitPrice: undefined }],
    });
  });

  it("存在しない・論理削除済みの場合、nullを返す", async () => {
    mockEmployeeFindFirst.mockResolvedValue(null);

    expect(await employeeRepository.findById(999)).toBeNull();
  });
});

describe("findDetail", () => {
  /** DBの1行分（応答に出してはいけない列も含める） */
  const row = {
    id: 1,
    employeeCode: "EMP001",
    userId: 10,
    user: { isDelete: false, role: { name: "employee" } },
    name: "山田太郎",
    furigana: "ヤマダタロウ",
    email: "test@example.com",
    birthDate: new Date("1990-01-01"),
    gender: Gender.MALE,
    phone: null,
    joinDate: new Date("2026-04-01"),
    specialty: "BE",
    workStatus: "WORKING",
    gitHub: null,
    trainingEndDate: null,
    previousCompany1Name: "前職A",
    previousCompany1StartDate: new Date("2020-04-01"),
    previousCompany1EndDate: null,
    previousCompany2Name: null,
    previousCompany2StartDate: null,
    previousCompany2EndDate: null,
    previousCompany3Name: null,
    previousCompany3StartDate: null,
    previousCompany3EndDate: null,
    weeklyWorkHours: null,
    monthlyEstimatedSalary: 300000,
    postalCode: null,
    prefecture: null,
    city: null,
    streetAddress: null,
    nearestStation: "東京駅",
    emergencyContactName: null,
    emergencyContactRelationship: null,
    emergencyContactPhone: null,
    hasSpouse: true,
    hasChildren: false,
    hasDependents: null,
    myNumber: "123456789012",
    employmentInsuranceNumber: null,
    basicPensionNumber: null,
    salaryAccount: null,
    isDelete: false,
    createrId: "1",
    createdAt: new Date("2026-01-01"),
    updaterId: "1",
    updatedAt: new Date("2026-01-01"),
    employeeSkills: [{ skillId: 1, years: 2.5, skill: { name: "TypeScript" } }],
    projectHistories: [
      {
        active: true,
        projectName: "案件A",
        factory: "現場A",
        startDate: new Date("2026-01-01"),
        endDate: null,
        skills: [{ skillId: 1, skill: { name: "TypeScript" } }],
        contracts: [{ startDate: new Date("2026-01-01"), unitPrice: 600000 }],
      },
    ],
  };

  const ALL: Set<FieldGroup> = new Set(["public", "basic", "contact", "projects", "confidential"]);
  const PUBLIC_ONLY: Set<FieldGroup> = new Set(["public"]);

  /** findFirstに渡したselect */
  const selectArg = () => mockEmployeeFindFirst.mock.calls[0]?.[0]?.select ?? {};

  it("論理削除済みを除いて読み込む", async () => {
    mockEmployeeFindFirst.mockResolvedValue(row as never);

    await employeeQueryRepository.findDetail(1, ALL);

    expect(mockEmployeeFindFirst).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 1, isDelete: false } }),
    );
  });

  it("画面表示用の形に変換する（日付は文字列・入社年月は年月まで、家族の有無は有/無、スキル名付き）", async () => {
    mockEmployeeFindFirst.mockResolvedValue(row as never);

    const result = await employeeQueryRepository.findDetail(1, ALL);

    expect(result).toMatchObject({
      employeeCode: "EMP001",
      role: "employee",
      birthDate: "1990-01-01",
      joinDate: "2026-04",
      previousCompany1StartDate: "2020-04-01",
      previousCompany1EndDate: null,
      myNumber: "123456789012",
      hasSpouse: true,
      hasChildren: false,
      hasDependents: null,
      skills: [{ skillId: 1, name: "TypeScript", years: 2.5 }],
      projects: [
        {
          active: true,
          projectName: "案件A",
          factory: "現場A",
          startDate: "2026-01-01",
          endDate: null,
          skills: [{ skillId: 1, name: "TypeScript" }],
          contracts: [{ startDate: "2026-01-01", unitPrice: 600000 }],
        },
      ],
    });
  });

  it("返した入社年月は、そのまま更新に送っても入力チェックを通る", async () => {
    mockEmployeeFindFirst.mockResolvedValue(row as never);

    const result = await employeeQueryRepository.findDetail(1, ALL);

    expect(updateEmployeeSchema.safeParse({ joinDate: result?.joinDate }).success).toBe(true);
  });

  it("返す項目は分類表（DETAIL_FIELD_GROUPS）の項目だけで、過不足が無い", async () => {
    mockEmployeeFindFirst.mockResolvedValue(row as never);

    const result = await employeeQueryRepository.findDetail(1, ALL);

    expect(Object.keys(result ?? {}).sort()).toEqual(Object.keys(DETAIL_FIELD_GROUPS).sort());
  });

  it("読めないまとまりの列はDBに要求せず、項目はnullで返す", async () => {
    mockEmployeeFindFirst.mockResolvedValue(row as never);

    const result = await employeeQueryRepository.findDetail(1, PUBLIC_ONLY);

    for (const column of ["user", "workStatus", "previousCompany1Name", "email", "birthDate", "projectHistories", "myNumber", "hasSpouse"]) {
      expect(selectArg()).not.toHaveProperty(column);
    }
    for (const [field, group] of Object.entries(DETAIL_FIELD_GROUPS)) {
      if (group !== "public") expect(result).toHaveProperty(field, null);
    }
    expect(result).toMatchObject({
      employeeCode: "EMP001",
      name: "山田太郎",
      furigana: "ヤマダタロウ",
      specialty: "BE",
      joinDate: "2026-04",
      skills: [{ skillId: 1, name: "TypeScript", years: 2.5 }],
    });
  });

  it("読めるまとまりだけを読む（連絡先だけ読める場合）", async () => {
    mockEmployeeFindFirst.mockResolvedValue(row as never);

    const result = await employeeQueryRepository.findDetail(1, new Set(["public", "contact"]));

    expect(selectArg()).toHaveProperty("email", true);
    expect(selectArg()).not.toHaveProperty("myNumber");
    expect(selectArg()).not.toHaveProperty("projectHistories");
    expect(result?.email).toBe("test@example.com");
    expect(result?.myNumber).toBeNull();
    expect(result?.projects).toBeNull();
  });

  it("公開の項目は、指定が無くても必ず読む", async () => {
    mockEmployeeFindFirst.mockResolvedValue(row as never);

    await employeeQueryRepository.findDetail(1, new Set());

    expect(selectArg()).toHaveProperty("name", true);
    expect(selectArg()).toHaveProperty("employeeSkills");
    expect(selectArg()).not.toHaveProperty("workStatus");
  });

  it.each([
    ["アカウントが無い", null],
    ["アカウントが論理削除済み", { isDelete: true, role: { name: "admin" } }],
  ])("%s場合、roleはnull", async (_, user) => {
    mockEmployeeFindFirst.mockResolvedValue({ ...row, userId: null, user } as never);

    const result = await employeeQueryRepository.findDetail(1, ALL);

    expect(result?.role).toBeNull();
  });

  it("存在しない・論理削除済みの場合、nullを返す", async () => {
    mockEmployeeFindFirst.mockResolvedValue(null);

    expect(await employeeQueryRepository.findDetail(999, ALL)).toBeNull();
  });
});

describe("insert", () => {
  it("集約の社員コード・基本情報・子テーブルを保存し、採番されたidを返す", async () => {
    const tx = runTransaction();
    const employee = Employee.create(
      { ...baseInput, hasSpouse: true, joinDate: "2026-04" },
      "EMP005",
    );

    const id = await employeeRepository.insert(employee);

    expect(id).toBe(6);
    const data = tx.employee.create.mock.calls[0]![0].data;
    expect(data.employeeCode).toBe("EMP006");
    expect(data.name).toBe("山田太郎");
    expect(data.hasSpouse).toBe(true);
    expect(data.joinDate).toEqual(new Date("2026-04"));
    expect(data.phone).toBeNull();
    expect(data.employeeSkills).toEqual({ create: [] });
  });

  it("重複禁止の制約違反（P2002）を、ドメインの項目名付きのDuplicateFieldErrorに変換する", async () => {
    mockTransaction.mockRejectedValue(p2002("my_number"));

    const error = await employeeRepository
      .insert(Employee.create(baseInput, null))
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(DuplicateFieldError);
    expect((error as DuplicateFieldError).field).toBe("myNumber");
  });

  it("想定外のカラムの重複禁止の制約違反は、そのまま投げる", async () => {
    const original = p2002("user_id");
    mockTransaction.mockRejectedValue(original);

    await expect(
      employeeRepository.insert(Employee.create(baseInput, null)),
    ).rejects.toBe(original);
  });

  it("存在しないskillIdの場合、InvalidSkillIdErrorを投げる", async () => {
    const tx = runTransaction();
    tx.skill.findMany.mockResolvedValue([{ id: 1 }]);
    const employee = Employee.create(
      {
        ...baseInput,
        skills: [
          { skillId: 1, years: 1 },
          { skillId: 999, years: 1 },
        ],
      },
      null,
    );

    await expect(employeeRepository.insert(employee)).rejects.toBeInstanceOf(
      InvalidSkillIdError,
    );
    expect(tx.employee.create).not.toHaveBeenCalled();
  });
});

describe("update", () => {
  it("読み込んだ時点のupdatedAtを条件に基本情報を更新し、差し替えていない子テーブルには触れない", async () => {
    const tx = runTransaction();
    const employee = storedEmployee();
    employee.update({ name: "山田花子" });

    await employeeRepository.update(employee);

    const args = tx.employee.updateMany.mock.calls[0]![0];
    expect(args.where).toEqual({
      id: 1,
      isDelete: false,
      updatedAt: new Date("2026-10-01T00:00:00Z"),
    });
    expect(args.data.name).toBe("山田花子");
    expect(tx.employee.update).not.toHaveBeenCalled();
    expect(tx.employeeSkill.deleteMany).not.toHaveBeenCalled();
    expect(tx.employeeProjectHistory.deleteMany).not.toHaveBeenCalled();
  });

  it("読み込み後に他の更新・削除が入っていた場合（更新件数0）、ConcurrentUpdateErrorを投げ何もしない", async () => {
    const tx = runTransaction();
    tx.employee.updateMany.mockResolvedValue({ count: 0 });
    const employee = storedEmployee();
    employee.update({ skills: [{ skillId: 2, years: 1 }] });

    await expect(employeeRepository.update(employee)).rejects.toBeInstanceOf(
      ConcurrentUpdateError,
    );
    expect(tx.employeeSkill.deleteMany).not.toHaveBeenCalled();
    expect(tx.employee.update).not.toHaveBeenCalled();
  });

  it("スキル・案件履歴を差し替えた場合、物理削除してから作り直す", async () => {
    const tx = runTransaction();
    tx.skill.findMany.mockResolvedValue([{ id: 2 }]);
    const employee = storedEmployee();
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

    await employeeRepository.update(employee);

    expect(tx.employeeSkill.deleteMany).toHaveBeenCalledWith({
      where: { employeeId: 1 },
    });
    expect(tx.employeeProjectHistorySkill.deleteMany).toHaveBeenCalledWith({
      where: { projectHistory: { employeeId: 1 } },
    });
    expect(tx.employeeProjectContract.deleteMany).toHaveBeenCalledWith({
      where: { projectHistory: { employeeId: 1 } },
    });
    expect(tx.employeeProjectHistory.deleteMany).toHaveBeenCalledWith({
      where: { employeeId: 1 },
    });
    const data = tx.employee.update.mock.calls[0]![0].data;
    expect(data.employeeSkills).toEqual({
      create: [{ skillId: 2, years: 3 }],
    });
    expect(data.projectHistories.create[0].projectName).toBe("案件B");
  });

  it("存在しないskillIdの場合、InvalidSkillIdErrorを投げ更新しない", async () => {
    const tx = runTransaction();
    const employee = storedEmployee();
    employee.update({ skills: [{ skillId: 999, years: 1 }] });

    await expect(employeeRepository.update(employee)).rejects.toBeInstanceOf(
      InvalidSkillIdError,
    );
    expect(tx.employeeSkill.deleteMany).not.toHaveBeenCalled();
  });

  it("重複禁止の制約違反（P2002）をDuplicateFieldErrorに変換する", async () => {
    mockTransaction.mockRejectedValue(p2002("my_number"));
    const employee = storedEmployee();

    const error = await employeeRepository.update(employee).catch((e: unknown) => e);

    expect((error as DuplicateFieldError).field).toBe("myNumber");
  });

  it("未登録（idがnull）の社員は更新できない", async () => {
    await expect(
      employeeRepository.update(Employee.create(baseInput, null)),
    ).rejects.toThrow("未登録の社員は更新できません");
  });
});

describe("findList", () => {
  /** 既定の検索条件（絞り込みなし・新しい順・1ページ目・12件） */
  const base = { sort: "desc", page: 1, limit: 12 } as const;

  /** findManyとcountに渡した条件 */
  const findManyArg = () => mockEmployeeFindMany.mock.calls[0]?.[0];
  const whereArg = () => findManyArg()?.where;

  const row = {
    id: 1,
    employeeCode: "EMP001",
    name: "山田太郎",
    furigana: "ヤマダタロウ",
    specialty: "BE",
    joinDate: new Date("2026-04-01"),
    employeeSkills: [{ skill: { name: "TypeScript" } }, { skill: { name: "React" } }],
  };

  beforeEach(() => {
    mockEmployeeFindMany.mockResolvedValue([row] as never);
    mockEmployeeCount.mockResolvedValue(1);
  });

  it("公開の項目だけを一覧の形に変換し、該当件数と一緒に返す", async () => {
    mockEmployeeCount.mockResolvedValue(25);

    const result = await employeeQueryRepository.findList(base);

    expect(result).toEqual({
      total: 25,
      items: [
        {
          employeeId: 1,
          employeeCode: "EMP001",
          name: "山田太郎",
          furigana: "ヤマダタロウ",
          specialty: "BE",
          joinDate: "2026-04",
          skills: ["TypeScript", "React"],
        },
      ],
    });
  });

  it("公開の項目以外の列はDBに要求しない", async () => {
    await employeeQueryRepository.findList(base);

    const select = findManyArg()?.select ?? {};
    for (const column of ["workStatus", "email", "myNumber", "projectHistories", "user"]) {
      expect(select).not.toHaveProperty(column);
    }
  });

  it("論理削除済みを除き、件数と一覧は同じ条件で数える", async () => {
    await employeeQueryRepository.findList(base);

    expect(whereArg()).toEqual({ isDelete: false });
    expect(mockEmployeeCount).toHaveBeenCalledWith({ where: whereArg() });
  });

  it("入社年月の順（未入力は最後）、同じ日付はid順で並べる", async () => {
    await employeeQueryRepository.findList({ ...base, sort: "asc" });

    expect(findManyArg()?.orderBy).toEqual([
      { joinDate: { sort: "asc", nulls: "last" } },
      { id: "asc" },
    ]);
  });

  it("指定したページの分だけ読む（3ページ目・12件ずつなら24件飛ばす）", async () => {
    await employeeQueryRepository.findList({ ...base, page: 3 });

    expect(findManyArg()).toMatchObject({ skip: 24, take: 12 });
  });

  it("社員番号は大文字・小文字を区別せず部分一致", async () => {
    await employeeQueryRepository.findList({ ...base, employeeCode: "emp" });

    expect(whereArg()).toMatchObject({ employeeCode: { contains: "emp", mode: "insensitive" } });
  });

  it("氏名は、氏名かフリガナの部分一致（ひらがなはカタカナにしてフリガナと比べる）", async () => {
    await employeeQueryRepository.findList({ ...base, name: "やまだ" });

    expect(whereArg()).toMatchObject({
      OR: [
        { name: { contains: "やまだ", mode: "insensitive" } },
        { furigana: { contains: "ヤマダ", mode: "insensitive" } },
      ],
    });
  });

  it("専門領域・稼働ステータスは一致するものだけ", async () => {
    await employeeQueryRepository.findList({ ...base, specialty: "FE", workStatus: "WAITING" });

    expect(whereArg()).toMatchObject({ specialty: "FE", workStatus: "WAITING" });
  });

  it("スキルは、指定したいずれかを持つ社員", async () => {
    await employeeQueryRepository.findList({ ...base, skillIds: [3, 12] });

    expect(whereArg()).toMatchObject({ employeeSkills: { some: { skillId: { in: [3, 12] } } } });
  });

  it("スキルの指定が空なら絞り込まない", async () => {
    await employeeQueryRepository.findList({ ...base, skillIds: [] });

    expect(whereArg()).not.toHaveProperty("employeeSkills");
  });

  it.each([
    ["月の途中", "2026-11", "2026-11-01", "2026-12-01"],
    ["12月（翌年の1月1日まで）", "2026-12", "2026-12-01", "2027-01-01"],
  ])("入社月は、その月の1日から翌月1日の前まで（%s）", async (_, month, start, end) => {
    await employeeQueryRepository.findList({ ...base, joinedMonth: month });

    expect(whereArg()).toMatchObject({ joinDate: { gte: new Date(start), lt: new Date(end) } });
  });
});

describe("findEmployeeSummaryByUserId", () => {
  it("論理削除済みを除いて、社員番号と氏名だけを取得する", async () => {
    mockEmployeeFindFirst.mockResolvedValue({
      employeeCode: "EMP005",
      name: "山田太郎",
    } as never);

    const result = await findEmployeeSummaryByUserId(1);

    expect(mockEmployeeFindFirst).toHaveBeenCalledWith({
      where: { userId: 1, isDelete: false },
      select: { employeeCode: true, name: true },
    });
    expect(result).toEqual({ employeeCode: "EMP005", name: "山田太郎" });
  });
});
