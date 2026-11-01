import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import {
  ConcurrentUpdateError,
  DuplicateFieldError,
  Employee,
  EMPLOYEE_CODE_PREFIX,
  InvalidSkillIdError,
  type ProjectHistory,
} from "./domain/employee";
import type { EmployeeRepository, EmployeeSkill } from "./domain/types";

/** 重複禁止の制約がかかったカラム名 → ドメインの項目名 */
const DUPLICATE_FIELDS = {
  email: "email",
  my_number: "myNumber",
  employee_code: "employeeCode",
} as const;

/** 重複禁止の制約違反（P2002）をDuplicateFieldErrorに変換する。それ以外のエラーはそのまま返す */
const toDomainError = (error: unknown): unknown => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    // meta.targetには違反したカラム名の配列が入る（例：["my_number"]）
    const target = error.meta?.target;
    const column = String(Array.isArray(target) ? target[0] : target);
    // 想定しているカラムだけ変換する（hasOwnはtoStringなどの継承したキーを含めない）
    if (Object.hasOwn(DUPLICATE_FIELDS, column)) {
      return new DuplicateFieldError(
        DUPLICATE_FIELDS[column as keyof typeof DUPLICATE_FIELDS],
      );
    }
  }
  return error;
};

/** 社員スキルと案件で使ったスキルのIDを、重複なしで集める */
const collectSkillIds = (
  skills: ReadonlyArray<EmployeeSkill>,
  projectHistories: ReadonlyArray<ProjectHistory>,
) => {
  const ids = new Set(skills.map((skill) => skill.skillId));
  projectHistories.forEach((history) =>
    history.skillIds.forEach((skillId) => ids.add(skillId)),
  );
  return Array.from(ids);
};

/** 指定されたスキルIDがすべてskillテーブルにあるか確認する（1つでも無ければInvalidSkillIdError） */
const assertSkillIdsExist = async (
  tx: Prisma.TransactionClient,
  skillIds: number[],
) => {
  if (skillIds.length === 0) return;
  const found = await tx.skill.findMany({
    where: { id: { in: skillIds } },
    select: { id: true },
  });
  if (found.length !== skillIds.length) {
    throw new InvalidSkillIdError();
  }
};

/** "YYYY-MM-DD" → Date（値が無ければnull） */
const toDate = (value: string | undefined) =>
  value === undefined ? null : new Date(value);

/** Date → "YYYY-MM-DD" */
const toDateString = (date: Date) => date.toISOString().slice(0, 10);

/** Date | null → "YYYY-MM-DD" | undefined（DBのnullはドメインではundefinedで表す） */
const toOptionalDateString = (date: Date | null) =>
  date ? toDateString(date) : undefined;

/** 集約の基本情報をemployeeテーブルのカラムに変換する（値の無い項目はnullで保存する） */
const toEmployeeColumns = ({ profile }: Employee) => ({
  name: profile.name,
  furigana: profile.furigana ?? null,
  email: profile.email ?? null,
  birthDate: toDate(profile.birthDate),
  gender: profile.gender ?? null,
  phone: profile.phone ?? null,
  joinDate: toDate(profile.joinDate),
  specialty: profile.specialty,
  workStatus: profile.workStatus,
  gitHub: profile.gitHub ?? null,
  trainingEndDate: toDate(profile.trainingEndDate),
  previousCompany1Name: profile.previousCompany1Name ?? null,
  previousCompany1StartDate: toDate(profile.previousCompany1StartDate),
  previousCompany1EndDate: toDate(profile.previousCompany1EndDate),
  previousCompany2Name: profile.previousCompany2Name ?? null,
  previousCompany2StartDate: toDate(profile.previousCompany2StartDate),
  previousCompany2EndDate: toDate(profile.previousCompany2EndDate),
  previousCompany3Name: profile.previousCompany3Name ?? null,
  previousCompany3StartDate: toDate(profile.previousCompany3StartDate),
  previousCompany3EndDate: toDate(profile.previousCompany3EndDate),
  weeklyWorkHours: profile.weeklyWorkHours ?? null,
  monthlyEstimatedSalary: profile.monthlyEstimatedSalary ?? null,
  postalCode: profile.postalCode ?? null,
  prefecture: profile.prefecture ?? null,
  city: profile.city ?? null,
  streetAddress: profile.streetAddress ?? null,
  emergencyContactName: profile.emergencyContactName ?? null,
  emergencyContactRelationship: profile.emergencyContactRelationship ?? null,
  emergencyContactPhone: profile.emergencyContactPhone ?? null,
  hasSpouse: profile.hasSpouse ?? null,
  hasChildren: profile.hasChildren ?? null,
  hasDependents: profile.hasDependents ?? null,
  myNumber: profile.myNumber ?? null,
  employmentInsuranceNumber: profile.employmentInsuranceNumber ?? null,
  basicPensionNumber: profile.basicPensionNumber ?? null,
  salaryAccount: profile.salaryAccount ?? null,
});

/** 社員スキルテーブルの作成データ */
const toSkillsCreate = (employee: Employee) => ({
  create: employee.skills.map(({ skillId, years }) => ({ skillId, years })),
});

/** 案件履歴テーブル（＋案件スキル・契約）の作成データ */
const toProjectHistoriesCreate = (employee: Employee) => ({
  create: employee.projectHistories.map((history) => ({
    active: history.active,
    projectName: history.projectName,
    factory: history.factory,
    startDate: new Date(history.startDate),
    endDate: toDate(history.endDate),
    skills: {
      create: history.skillIds.map((skillId) => ({ skillId })),
    },
    contracts: {
      create: history.contracts.map((contract) => ({
        startDate: new Date(contract.startDate),
        unitPrice: contract.unitPrice ?? null,
      })),
    },
  })),
});

/**
 * 既存社員コードの最大値を取得する。
 */
const findLastEmployeeCode = async (): Promise<string | null> => {
  // 論理削除済みも対象にする（削除済みの社員のコードも、重複禁止の対象に残り続けるため）
  // 文字数→文字列の順に並べると、数値として大きい順になる（EMP1000がEMP999より先に来る）
  const pattern = `^${EMPLOYEE_CODE_PREFIX}[0-9]+$`;
  const rows = await prisma.$queryRaw<Array<{ employee_code: string }>>`
    SELECT employee_code FROM employee
    WHERE employee_code ~ ${pattern}
    ORDER BY LENGTH(employee_code) DESC, employee_code DESC
    LIMIT 1
  `;
  return rows[0]?.employee_code ?? null;
};

/** DBから社員を読み込んで組み立てる（存在しない・論理削除済みならnull） */
const findById = async (employeeId: number): Promise<Employee | null> => {
  // 社員は丸ごと読み込むので、子テーブルもまとめて読み込む（保存した順に並べる）
  const row = await prisma.employee.findFirst({
    where: { id: employeeId, isDelete: false },
    include: {
      employeeSkills: { orderBy: { id: "asc" } },
      projectHistories: {
        orderBy: { id: "asc" },
        include: {
          skills: { orderBy: { id: "asc" } },
          contracts: { orderBy: { id: "asc" } },
        },
      },
    },
  });
  if (!row) return null;

  // DBの形（nullとDate）を、ドメインの形（undefinedと文字列）に変換して組み立てる
  return Employee.reconstruct({
    id: row.id,
    // 保存時に「他の人が先に更新していないか」を確かめるため、読み込んだ時点の更新日時を持たせる
    version: row.updatedAt,
    employeeCode: row.employeeCode,
    profile: {
      name: row.name,
      specialty: row.specialty,
      workStatus: row.workStatus,
      furigana: row.furigana ?? undefined,
      email: row.email ?? undefined,
      birthDate: toOptionalDateString(row.birthDate),
      gender: row.gender ?? undefined,
      phone: row.phone ?? undefined,
      joinDate: toOptionalDateString(row.joinDate),
      gitHub: row.gitHub ?? undefined,
      trainingEndDate: toOptionalDateString(row.trainingEndDate),
      previousCompany1Name: row.previousCompany1Name ?? undefined,
      previousCompany1StartDate: toOptionalDateString(row.previousCompany1StartDate),
      previousCompany1EndDate: toOptionalDateString(row.previousCompany1EndDate),
      previousCompany2Name: row.previousCompany2Name ?? undefined,
      previousCompany2StartDate: toOptionalDateString(row.previousCompany2StartDate),
      previousCompany2EndDate: toOptionalDateString(row.previousCompany2EndDate),
      previousCompany3Name: row.previousCompany3Name ?? undefined,
      previousCompany3StartDate: toOptionalDateString(row.previousCompany3StartDate),
      previousCompany3EndDate: toOptionalDateString(row.previousCompany3EndDate),
      weeklyWorkHours: row.weeklyWorkHours ?? undefined,
      monthlyEstimatedSalary: row.monthlyEstimatedSalary ?? undefined,
      postalCode: row.postalCode ?? undefined,
      prefecture: row.prefecture ?? undefined,
      city: row.city ?? undefined,
      streetAddress: row.streetAddress ?? undefined,
      emergencyContactName: row.emergencyContactName ?? undefined,
      emergencyContactRelationship: row.emergencyContactRelationship ?? undefined,
      emergencyContactPhone: row.emergencyContactPhone ?? undefined,
      hasSpouse: row.hasSpouse ?? undefined,
      hasChildren: row.hasChildren ?? undefined,
      hasDependents: row.hasDependents ?? undefined,
      myNumber: row.myNumber ?? undefined,
      employmentInsuranceNumber: row.employmentInsuranceNumber ?? undefined,
      basicPensionNumber: row.basicPensionNumber ?? undefined,
      salaryAccount: row.salaryAccount ?? undefined,
    },
    skills: row.employeeSkills.map(({ skillId, years }) => ({ skillId, years })),
    projectHistories: row.projectHistories.map((history) => ({
      active: history.active,
      projectName: history.projectName,
      factory: history.factory,
      skills: history.skills.map(({ skillId }) => skillId),
      startDate: toDateString(history.startDate),
      endDate: toOptionalDateString(history.endDate),
      contracts: history.contracts.map((contract) => ({
        startDate: toDateString(contract.startDate),
        unitPrice: contract.unitPrice ?? undefined,
      })),
    })),
  });
};

/**
 * チェック済みの社員をDBに保存する
 */
const insert = async (employee: Employee): Promise<number> => {
  try {
    return await prisma.$transaction(async (tx) => {
      await assertSkillIdsExist(
        tx,
        collectSkillIds(employee.skills, employee.projectHistories),
      );

      // 本体と子テーブル（スキル・案件履歴・案件スキル・契約）を1回のcreateでまとめて作る
      const created = await tx.employee.create({
        data: {
          employeeCode: employee.employeeCode,
          ...toEmployeeColumns(employee),
          employeeSkills: toSkillsCreate(employee),
          projectHistories: toProjectHistoriesCreate(employee),
        },
      });
      return created.id;
    });
  } catch (error) {
    // Prismaのエラーをドメインのエラーに変換して投げ直す（それ以外はそのまま）
    throw toDomainError(error);
  }
};

/**
 * 保存済みの社員を更新する。
 */
const update = async (employee: Employee): Promise<void> => {
  const { id: employeeId, version, skillsReplaced, projectHistoriesReplaced } =
    employee;
  if (employeeId === null || version === null) {
    throw new Error("未登録の社員は更新できません");
  }

  try {
    await prisma.$transaction(async (tx) => {
      // 1. 基本情報を更新する。読み込んだ時点のupdatedAtのままのときだけ更新され、
      //    変わっていれば（他の更新・削除が入っていれば）更新件数が0になる
      const { count } = await tx.employee.updateMany({
        where: { id: employeeId, isDelete: false, updatedAt: version },
        data: toEmployeeColumns(employee),
      });
      if (count === 0) {
        throw new ConcurrentUpdateError();
      }

      // 2. 差し替えた子テーブルのスキルだけ、存在を確認する
      await assertSkillIdsExist(
        tx,
        collectSkillIds(
          skillsReplaced ? employee.skills : [],
          projectHistoriesReplaced ? employee.projectHistories : [],
        ),
      );

      // 3. 差し替えた子テーブルを物理削除する（外部キーがあるので、案件スキル・契約→案件履歴の順に消す）
      if (skillsReplaced) {
        await tx.employeeSkill.deleteMany({ where: { employeeId } });
      }
      if (projectHistoriesReplaced) {
        const ofThisEmployee = { projectHistory: { employeeId } };
        await tx.employeeProjectHistorySkill.deleteMany({ where: ofThisEmployee });
        await tx.employeeProjectContract.deleteMany({ where: ofThisEmployee });
        await tx.employeeProjectHistory.deleteMany({ where: { employeeId } });
      }

      // 4. 差し替えた子テーブルを作り直す
      if (skillsReplaced || projectHistoriesReplaced) {
        await tx.employee.update({
          where: { id: employeeId },
          data: {
            ...(skillsReplaced && { employeeSkills: toSkillsCreate(employee) }),
            ...(projectHistoriesReplaced && {
              projectHistories: toProjectHistoriesCreate(employee),
            }),
          },
        });
      }
    });
  } catch (error) {
    throw toDomainError(error);
  }
};

/** EmployeeRepository（ポート）のPrisma実装 */
export const employeeRepository: EmployeeRepository = {
  findLastEmployeeCode,
  findById,
  insert,
  update,
};

export const getEmployeeList = async (filters?: {
  employeeCode?: string;
  name?: string;
}) => {
  const where: Prisma.EmployeeWhereInput = { isDelete: false };

  if (filters?.employeeCode) {
    where.employeeCode = { contains: filters.employeeCode };
  }

  if (filters?.name) {
    where.name = { contains: filters.name };
  }

  const employees = await prisma.employee.findMany({
    where,
    select: {
      id: true,
      employeeCode: true,
      name: true,
      assignments: {
        where: { isDelete: false },
        orderBy: { startDate: "desc" },
        select: {
          status: true,
          contractPrice: true,
          startDate: true,
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return employees.map((emp) => {
    const latestAssignment = emp.assignments[0] ?? null;

    return {
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      name: emp.name,
      contractPrice: latestAssignment?.contractPrice ?? null,
      status: latestAssignment?.status ?? null,
    };
  });
};

export const getEmployeeDetails = async (employeeId: number) => {
  return prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      assignments: {
        where: { isDelete: false },
        orderBy: { startDate: "desc" },
        take: 1,
        select: { status: true },
      },
    },
  });
};

/** 社員テーブルのid, 社員番号, 氏名を取得する */
export const findEmployeeSummaryByUserId = async (userId: number) => {
  return await prisma.employee.findFirst({
    where: { userId, isDelete: false },
    select: { employeeCode: true, name: true },
  })
}
