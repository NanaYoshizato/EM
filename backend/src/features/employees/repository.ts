import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "./types/employee.schema";
import { Employee, ProjectHistory } from "./domain/employee";
import {
  DuplicateFieldError,
  EmployeeNotFoundError,
  InvalidSkillIdError,
} from "./errors";

const toDuplicateFieldError = (error: unknown): DuplicateFieldError | null => {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P2002"
  ) {
    const target = error.meta?.target;
    const field = Array.isArray(target) ? String(target[0]) : String(target);
    return new DuplicateFieldError(field);
  }
  return null;
};

const collectSkillIds = (data: CreateEmployeeInput | UpdateEmployeeInput) => {
  const ids = new Set<number>();
  data.skills?.forEach((skill) => ids.add(skill.skillId));
  data.projects?.forEach((project) =>
    project.skills.forEach((skillId) => ids.add(skillId)),
  );
  return Array.from(ids);
};

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

/**
 * 既存社員コードの最大値を取得する（論理削除済みも含む。削除済みの
 * コードもDBの一意制約を占有し続けるため）。
 * EMPプレフィックス＋ゼロ埋め数字という前提の下、「文字数優先→文字列
 * 降順」が数値としての降順と一致する（EMP1000はEMP999より長いので
 * 必ず先に来る）。
 */
export const findLastEmployeeCode = async (): Promise<string | null> => {
  const rows = await prisma.$queryRaw<Array<{ employee_code: string }>>`
    SELECT employee_code FROM employee
    WHERE employee_code ~ '^EMP[0-9]+$'
    ORDER BY LENGTH(employee_code) DESC, employee_code DESC
    LIMIT 1
  `;
  return rows[0]?.employee_code ?? null;
};

/**
 * 検証済みのEmployee集約を永続化する（社員コード採番・業務ルール検証は
 * 呼び出し側で完了している前提）。
 */
export const insertEmployee = async (
  employee: Employee,
  data: CreateEmployeeInput,
): Promise<{ employeeId: number }> => {
  try {
    return await prisma.$transaction(async (tx) => {
      await assertSkillIdsExist(tx, collectSkillIds(data));

      const created = await tx.employee.create({
        data: {
          employeeCode: employee.employeeCode,
          name: data.name,
          furigana: data.furigana,
          email: data.email,
          birthDate: new Date(data.birthDate),
          gender: data.gender,
          specialty: data.specialty,
          workStatus: data.workStatus,
          ...(data.gitHub !== undefined && { gitHub: data.gitHub }),
          ...(data.phone !== undefined && { phone: data.phone }),
          ...(data.joinDate !== undefined && {
            joinDate: new Date(data.joinDate),
          }),
          ...(data.trainingEndDate !== undefined && {
            trainingEndDate: new Date(data.trainingEndDate),
          }),
          ...(data.previousCompany1Name !== undefined && {
            previousCompany1Name: data.previousCompany1Name,
          }),
          ...(data.previousCompany1StartDate !== undefined && {
            previousCompany1StartDate: new Date(data.previousCompany1StartDate),
          }),
          ...(data.previousCompany1EndDate !== undefined && {
            previousCompany1EndDate: new Date(data.previousCompany1EndDate),
          }),
          ...(data.previousCompany2Name !== undefined && {
            previousCompany2Name: data.previousCompany2Name,
          }),
          ...(data.previousCompany2StartDate !== undefined && {
            previousCompany2StartDate: new Date(data.previousCompany2StartDate),
          }),
          ...(data.previousCompany2EndDate !== undefined && {
            previousCompany2EndDate: new Date(data.previousCompany2EndDate),
          }),
          ...(data.previousCompany3Name !== undefined && {
            previousCompany3Name: data.previousCompany3Name,
          }),
          ...(data.previousCompany3StartDate !== undefined && {
            previousCompany3StartDate: new Date(data.previousCompany3StartDate),
          }),
          ...(data.previousCompany3EndDate !== undefined && {
            previousCompany3EndDate: new Date(data.previousCompany3EndDate),
          }),
          ...(data.weeklyWorkHours !== undefined && {
            weeklyWorkHours: data.weeklyWorkHours,
          }),
          ...(data.monthlyEstimatedSalary !== undefined && {
            monthlyEstimatedSalary: data.monthlyEstimatedSalary,
          }),
          ...(data.postalCode !== undefined && { postalCode: data.postalCode }),
          ...(data.prefecture !== undefined && { prefecture: data.prefecture }),
          ...(data.city !== undefined && { city: data.city }),
          ...(data.streetAddress !== undefined && {
            streetAddress: data.streetAddress,
          }),
          ...(data.emergencyContactName !== undefined && {
            emergencyContactName: data.emergencyContactName,
          }),
          ...(data.emergencyContactRelationship !== undefined && {
            emergencyContactRelationship: data.emergencyContactRelationship,
          }),
          ...(data.emergencyContactPhone !== undefined && {
            emergencyContactPhone: data.emergencyContactPhone,
          }),
          ...(employee.hasSpouse !== undefined && {
            hasSpouse: employee.hasSpouse,
          }),
          ...(employee.hasChildren !== undefined && {
            hasChildren: employee.hasChildren,
          }),
          ...(employee.hasDependents !== undefined && {
            hasDependents: employee.hasDependents,
          }),
          ...(data.myNumber !== undefined && { myNumber: data.myNumber }),
          ...(data.employmentInsuranceNumber !== undefined && {
            employmentInsuranceNumber: data.employmentInsuranceNumber,
          }),
          ...(data.basicPensionNumber !== undefined && {
            basicPensionNumber: data.basicPensionNumber,
          }),
          ...(data.salaryAccount !== undefined && {
            salaryAccount: data.salaryAccount,
          }),

          /** 社員スキルテーブル */
          employeeSkills: {
            create: data.skills.map((skill) => ({
              skillId: skill.skillId,
              years: skill.years,
            })),
          },

          /** 案件履歴テーブル（Employee集約が検証済みのProjectHistoryを永続化するだけ） */
          projectHistories: {
            create: employee.projectHistories.map((project) => ({
              active: project.active,
              projectName: project.projectName,
              factory: project.factory,
              startDate: new Date(project.startDate),
              ...(project.endDate !== undefined && {
                endDate: new Date(project.endDate),
              }),

              skills: {
                create: project.skillIds.map((skillId) => ({ skillId })),
              },
              contracts: {
                create: project.contracts.map((contract) => ({
                  startDate: new Date(contract.startDate),
                  ...(contract.unitPrice !== undefined && {
                    unitPrice: contract.unitPrice,
                  }),
                })),
              },
            })),
          },
        },
      });

      return { employeeId: created.id };
    });
  } catch (error) {
    const duplicateFieldError = toDuplicateFieldError(error);
    if (duplicateFieldError) throw duplicateFieldError;
    throw error;
  }
};

type PreviousCompanyDates = {
  previousCompany1StartDate: string | null;
  previousCompany1EndDate: string | null;
  previousCompany2StartDate: string | null;
  previousCompany2EndDate: string | null;
  previousCompany3StartDate: string | null;
  previousCompany3EndDate: string | null;
};

/**
 * 対象社員の前職1〜3社目の開始日・終了日を取得する（PATCHが一部の
 * フィールドしか送らない場合に、保存済みの値とマージして検証するため）。
 * 存在しない・論理削除済みならnullを返す（存在確認を兼ねる）。
 */
export const findPreviousCompanyDates = async (
  employeeId: number,
): Promise<PreviousCompanyDates | null> => {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, isDelete: false },
    select: {
      previousCompany1StartDate: true,
      previousCompany1EndDate: true,
      previousCompany2StartDate: true,
      previousCompany2EndDate: true,
      previousCompany3StartDate: true,
      previousCompany3EndDate: true,
    },
  });
  if (!employee) return null;

  const toDateString = (date: Date | null) =>
    date ? date.toISOString().slice(0, 10) : null;

  return {
    previousCompany1StartDate: toDateString(employee.previousCompany1StartDate),
    previousCompany1EndDate: toDateString(employee.previousCompany1EndDate),
    previousCompany2StartDate: toDateString(employee.previousCompany2StartDate),
    previousCompany2EndDate: toDateString(employee.previousCompany2EndDate),
    previousCompany3StartDate: toDateString(employee.previousCompany3StartDate),
    previousCompany3EndDate: toDateString(employee.previousCompany3EndDate),
  };
};

export const updateEmployee = async (
  employeeId: number,
  data: UpdateEmployeeInput,
) => {
  if (data.skills !== undefined) {
    Employee.assertNoDuplicateSkillIds(data.skills.map((skill) => skill.skillId));
  }
  const projectHistories = data.projects?.map((project) =>
    ProjectHistory.create(project),
  );

  const updateData: Prisma.EmployeeUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.furigana !== undefined) updateData.furigana = data.furigana;
  if (data.birthDate !== undefined)
    updateData.birthDate = new Date(data.birthDate);
  if (data.gender !== undefined) updateData.gender = data.gender;
  if (data.specialty !== undefined) updateData.specialty = data.specialty;
  if (data.workStatus !== undefined) updateData.workStatus = data.workStatus;
  if (data.gitHub !== undefined) updateData.gitHub = data.gitHub;
  if (data.phone !== undefined) updateData.phone = data.phone;

  if (data.joinDate !== undefined)
    updateData.joinDate = new Date(data.joinDate);
  if (data.trainingEndDate !== undefined)
    updateData.trainingEndDate = new Date(data.trainingEndDate);

  if (data.previousCompany1Name !== undefined)
    updateData.previousCompany1Name = data.previousCompany1Name;
  if (data.previousCompany1StartDate !== undefined)
    updateData.previousCompany1StartDate = new Date(
      data.previousCompany1StartDate,
    );
  if (data.previousCompany1EndDate !== undefined)
    updateData.previousCompany1EndDate = new Date(data.previousCompany1EndDate);
  if (data.previousCompany2Name !== undefined)
    updateData.previousCompany2Name = data.previousCompany2Name;
  if (data.previousCompany2StartDate !== undefined)
    updateData.previousCompany2StartDate = new Date(
      data.previousCompany2StartDate,
    );
  if (data.previousCompany2EndDate !== undefined)
    updateData.previousCompany2EndDate = new Date(data.previousCompany2EndDate);
  if (data.previousCompany3Name !== undefined)
    updateData.previousCompany3Name = data.previousCompany3Name;
  if (data.previousCompany3StartDate !== undefined)
    updateData.previousCompany3StartDate = new Date(
      data.previousCompany3StartDate,
    );
  if (data.previousCompany3EndDate !== undefined)
    updateData.previousCompany3EndDate = new Date(data.previousCompany3EndDate);

  if (data.weeklyWorkHours !== undefined)
    updateData.weeklyWorkHours = data.weeklyWorkHours;
  if (data.monthlyEstimatedSalary !== undefined)
    updateData.monthlyEstimatedSalary = data.monthlyEstimatedSalary;

  if (data.postalCode !== undefined) updateData.postalCode = data.postalCode;
  if (data.prefecture !== undefined) updateData.prefecture = data.prefecture;
  if (data.city !== undefined) updateData.city = data.city;
  if (data.streetAddress !== undefined)
    updateData.streetAddress = data.streetAddress;

  if (data.emergencyContactName !== undefined)
    updateData.emergencyContactName = data.emergencyContactName;
  if (data.emergencyContactRelationship !== undefined)
    updateData.emergencyContactRelationship = data.emergencyContactRelationship;
  if (data.emergencyContactPhone !== undefined)
    updateData.emergencyContactPhone = data.emergencyContactPhone;

  if (data.hasSpouse !== undefined)
    updateData.hasSpouse = Employee.toBoolean(data.hasSpouse);
  if (data.hasChildren !== undefined)
    updateData.hasChildren = Employee.toBoolean(data.hasChildren);
  if (data.hasDependents !== undefined)
    updateData.hasDependents = Employee.toBoolean(data.hasDependents);

  if (data.myNumber !== undefined) updateData.myNumber = data.myNumber;
  if (data.employmentInsuranceNumber !== undefined)
    updateData.employmentInsuranceNumber = data.employmentInsuranceNumber;
  if (data.basicPensionNumber !== undefined)
    updateData.basicPensionNumber = data.basicPensionNumber;
  if (data.salaryAccount !== undefined)
    updateData.salaryAccount = data.salaryAccount;

  /**
   * 子データ（skills/projects）を物理削除して作り直す。
   * フロントのMemberProfileForm（skills/projectsタブ）は追加・編集・削除の
   * どの操作でも配列全体をPATCHで送信する設計で、個別行の履歴保持や
   * 監査UIも存在しないため、全体削除→作り直しはフロントの設計と一致する
   * 意図的な戦略（2026-09-29、フロント調査済み）。他テーブルの論理削除
   * （isDelete）とは扱いが異なる点に注意。
   */
  try {
    return await prisma.$transaction(async (tx) => {
      const existing = await tx.employee.findFirst({
        where: { id: employeeId, isDelete: false },
        select: { id: true },
      });
      if (!existing) {
        throw new EmployeeNotFoundError();
      }

      await assertSkillIdsExist(tx, collectSkillIds(data));

      if (data.skills !== undefined) {
        await tx.employeeSkill.deleteMany({ where: { employeeId } });
      }
      if (data.projects !== undefined) {
        const existingHistories = await tx.employeeProjectHistory.findMany({
          where: { employeeId },
          select: { id: true },
        });
        const historyIds = existingHistories.map((h) => h.id);
        if (historyIds.length > 0) {
          await tx.employeeProjectHistorySkill.deleteMany({
            where: { projectHistoryId: { in: historyIds } },
          });
          await tx.employeeProjectContract.deleteMany({
            where: { projectHistoryId: { in: historyIds } },
          });
        }
        await tx.employeeProjectHistory.deleteMany({ where: { employeeId } });
      }

      /** 更新データ */
      const updated = await tx.employee.update({
        where: { id: employeeId },
        data: {
          ...updateData,

          /** 社員スキルテーブル */
          ...(data.skills !== undefined && {
            employeeSkills: {
              create: data.skills.map((skill) => ({
                skillId: skill.skillId,
                years: skill.years,
              })),
            },
          }),

          /** 案件履歴テーブル（検証済みのProjectHistoryを永続化するだけ） */
          ...(projectHistories !== undefined && {
            projectHistories: {
              create: projectHistories.map((project) => ({
                active: project.active,
                projectName: project.projectName,
                factory: project.factory,
                startDate: new Date(project.startDate),
                ...(project.endDate !== undefined && {
                  endDate: new Date(project.endDate),
                }),
                skills: {
                  create: project.skillIds.map((skillId) => ({ skillId })),
                },
                contracts: {
                  create: project.contracts.map((contract) => ({
                    startDate: new Date(contract.startDate),
                    ...(contract.unitPrice !== undefined && {
                      unitPrice: contract.unitPrice,
                    }),
                  })),
                },
              })),
            },
          }),
        },
      });

      return updated;
    });
  } catch (error) {
    const duplicateFieldError = toDuplicateFieldError(error);
    if (duplicateFieldError) throw duplicateFieldError;
    throw error;
  }
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
  return await prisma.employee.findUnique({
    where: { userId },
    select: { id: true, employeeCode: true, name: true },
  })
}
