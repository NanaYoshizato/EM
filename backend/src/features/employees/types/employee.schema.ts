import { z } from "zod";
import { Gender, EmployeeStatus, Specialty, WorkStatus } from "@prisma/client";

export const createEmployeeSchema = z.object({
  /* メールアドレス */
  email: z.email(),

  /* 氏名 */
  name: z
    .string()
    .trim()
    .min(1)
    .max(50),

  /* フリガナ */
  furigana: z
    .string()
    .trim()
    .min(1)
    .max(50),

  /* 生年月日 */
  birthDate: z.iso.date(),

  /* 性別 */
  gender: z.enum(Gender),

  /* 電話番号 */
  phone: z
    .string()
    .regex(/^0\d{1,4}-?\d{1,4}-?\d{4}$/)
    .optional(),

  /* 入社年月 */
  joinDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/)
    .optional(),

  /* 専門領域 */
  specialty: z.enum(Specialty),

  /* 稼働ステータス */
  workStatus: z.enum(WorkStatus),

  /* GitHubユーザー名 */
  gitHub: z
    .string()
    .trim()
    .max(39)
    .optional(),

  /* 研修終了日 */
  trainingEndDate: z.iso.date().optional(),

  /* 前職1社目の会社名 */
  previousCompany1Name: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 前職1社目の在籍開始日 */
  previousCompany1StartDate: z.iso.date().optional(),

  /* 前職1社目の在籍終了日 */
  previousCompany1EndDate: z.iso.date().optional(),

  /* 前職2社目の会社名 */
  previousCompany2Name: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 前職2社目の在籍開始日 */
  previousCompany2StartDate: z.iso.date().optional(),

  /* 前職2社目の在籍終了日 */
  previousCompany2EndDate: z.iso.date().optional(),

  /* 前職3社目の会社名 */
  previousCompany3Name: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 前職3社目の在籍開始日 */
  previousCompany3StartDate: z.iso.date().optional(),

  /* 前職3社目の在籍終了日 */
  previousCompany3EndDate: z.iso.date().optional(),

  /* 週あたり稼働時間 */
  weeklyWorkHours: z
    .string()
    .trim()
    .max(20)
    .optional(),

  /* 月額想定給与 */
  monthlyEstimatedSalary: z
    .coerce.number()
    .int()
    .min(0)
    .optional(),

  /* 郵便番号 */
  postalCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$/)
    .optional(),

  /* 都道府県 */
  prefecture: z
    .string()
    .trim()
    .max(10)
    .optional(),

  /* 市区町村 */
  city: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 番地・建物名 */
  streetAddress: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 緊急連絡先氏名 */
  emergencyContactName: z
    .string()
    .trim()
    .max(50)
    .optional(),

  /* 緊急連絡先続柄 */
  emergencyContactRelationship: z
    .string()
    .trim()
    .max(20)
    .optional(),

  /* 緊急連絡先電話番号 */
  emergencyContactPhone: z
    .string()
    .regex(/^0\d{1,4}-?\d{1,4}-?\d{4}$/)
    .optional(),

  /* 配偶者の有無 */
  hasSpouse: z.enum(["有", "無"]).optional(),

  /* 子の有無 */
  hasChildren: z.enum(["有", "無"]).optional(),

  /* 扶養家族の有無 */
  hasDependents: z.enum(["有", "無"]).optional(),

  /* マイナンバー */
  myNumber: z
    .string()
    .regex(/^\d{12}$/)
    .optional(),

  /* 雇用保険番号 */
  employmentInsuranceNumber: z
    .string()
    .regex(/^\d{4}-\d{6}-\d{1}$/)
    .optional(),

  /* 基礎年金番号 */
  basicPensionNumber: z
    .string()
    .regex(/^\d{4}-\d{6}$/)
    .optional(),

  /* 給与振込口座 */
  salaryAccount: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 保有スキル */
  skills: z
    .array(
      z.object({
        /* スキルID */
        skillId: z
          .number()
          .int()
          .positive(),
        /* 経験年数 */
        years: z.coerce.number().min(0),
      }),
    )
    .max(50)
    .refine(
      (skills) => new Set(skills.map((skill) => skill.skillId)).size === skills.length,
      "スキルが重複して指定されています",
    ),

  /* 案件履歴 */
  projects: z
    .array(
      z.object({
        /* 稼働中か */
        active: z.boolean(),

        /* 案件名 */
        projectName: z
          .string()
          .trim()
          .min(1)
          .max(100),

        /* 常駐先企業名 */
        factory: z
          .string()
          .trim()
          .min(1)
          .max(100),

        /* 使用スキルのID一覧 */
        skills: z.array(z
          .number()
          .int()
          .positive()
        )
          .max(20)
          .refine(
            (ids) => new Set(ids).size === ids.length,
            "スキルが重複して指定されています",
          ),

        /* 参画開始日 */
        startDate: z.iso.date(),

        /* 参画終了日 */
        endDate: z.iso.date().optional(),

        /* 契約単価履歴 */
        contracts: z
          .array(
            z.object({
              /* 適用開始日 */
              startDate: z.iso.date(),

              /* 契約単価 */
              unitPrice: z
                .coerce.number()
                .int()
                .min(0)
                .optional(),
            }),
          )
          .max(20),
      }),
    )
    .max(50),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  /* 氏名 */
  name: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),

  /* フリガナ */
  furigana: z
    .string()
    .trim()
    .min(1)
    .max(50)
    .optional(),

  /* 生年月日 */
  birthDate: z.iso.date().optional(),

  /* 性別 */
  gender: z.enum(Gender).optional(),

  /* 電話番号 */
  phone: z
    .string()
    .regex(/^0\d{1,4}-?\d{1,4}-?\d{4}$/)
    .optional(),

  /* 入社年月 */
  joinDate: z
    .string()
    .regex(/^\d{4}-\d{2}$/, "入社年月はYYYY-MM形式で入力してください。")
    .optional(),

  /* 専門領域 */
  specialty: z.enum(Specialty).optional(),

  /* 稼働ステータス */
  workStatus: z.enum(WorkStatus).optional(),

  /* GitHubユーザー名 */
  gitHub: z
    .string()
    .trim()
    .max(39)
    .optional(),

  /* 研修終了日 */
  trainingEndDate: z.iso.date().optional(),

  /* 前職1社目の会社名 */
  previousCompany1Name: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 前職1社目の在籍開始日 */
  previousCompany1StartDate: z.iso.date().optional(),

  /* 前職1社目の在籍終了日 */
  previousCompany1EndDate: z.iso.date().optional(),

  /* 前職2社目の会社名 */
  previousCompany2Name: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 前職2社目の在籍開始日 */
  previousCompany2StartDate: z.iso.date().optional(),

  /* 前職2社目の在籍終了日 */
  previousCompany2EndDate: z.iso.date().optional(),

  /* 前職3社目の会社名 */
  previousCompany3Name: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 前職3社目の在籍開始日 */
  previousCompany3StartDate: z.iso.date().optional(),

  /* 前職3社目の在籍終了日 */
  previousCompany3EndDate: z.iso.date().optional(),

  /* 週あたり稼働時間 */
  weeklyWorkHours: z
    .string()
    .trim()
    .max(20)
    .optional(),

  /* 月額想定給与 */
  monthlyEstimatedSalary: z
    .coerce.number()
    .int()
    .min(0)
    .optional(),

  /* 郵便番号 */
  postalCode: z
    .string()
    .regex(/^\d{3}-?\d{4}$/)
    .optional(),

  /* 都道府県 */
  prefecture: z
    .string()
    .trim()
    .max(10)
    .optional(),

  /* 市区町村 */
  city: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 番地・建物名 */
  streetAddress: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 緊急連絡先氏名 */
  emergencyContactName: z
    .string()
    .trim()
    .max(50)
    .optional(),

  /* 緊急連絡先続柄 */
  emergencyContactRelationship: z
    .string()
    .trim()
    .max(20)
    .optional(),

  /* 緊急連絡先電話番号 */
  emergencyContactPhone: z
    .string()
    .regex(/^0\d{1,4}-?\d{1,4}-?\d{4}$/)
    .optional(),

  /* 配偶者の有無 */
  hasSpouse: z.enum(["有", "無"]).optional(),

  /* 子の有無 */
  hasChildren: z.enum(["有", "無"]).optional(),

  /* 扶養家族の有無 */
  hasDependents: z.enum(["有", "無"]).optional(),

  /* マイナンバー */
  myNumber: z
    .string()
    .regex(/^\d{12}$/)
    .optional(),

  /* 雇用保険番号 */
  employmentInsuranceNumber: z
    .string()
    .regex(/^\d{4}-\d{6}-\d{1}$/)
    .optional(),

  /* 基礎年金番号 */
  basicPensionNumber: z
    .string()
    .regex(/^\d{4}-\d{6}$/)
    .optional(),

  /* 給与振込口座 */
  salaryAccount: z
    .string()
    .trim()
    .max(100)
    .optional(),

  /* 保有スキル */
  skills: z
    .array(
      z.object({
        /* スキルID */
        skillId: z
          .number()
          .int()
          .positive(),

        /* 経験年数 */
        years: z.coerce.number().min(0),
      }),
    )
    .max(50)
    .refine(
      (skills) => new Set(skills.map((skill) => skill.skillId)).size === skills.length,
      "スキルが重複して指定されています",
    )
    .optional(),

  /* 案件履歴 */
  projects: z
    .array(
      z.object({
        /* 稼働中か */
        active: z.boolean(),

        /* 案件名 */
        projectName: z
          .string()
          .trim()
          .min(1)
          .max(100),

        /* 常駐先企業名 */
        factory: z
          .string()
          .trim()
          .min(1)
          .max(100),

        /* 使用スキルのID一覧 */
        skills: z.array(z
          .number()
          .int()
          .positive()
        )
          .max(20)
          .refine(
            (ids) => new Set(ids).size === ids.length,
            "スキルが重複して指定されています",
          ),

        /* 参画開始日 */
        startDate: z.iso.date(),

        /* 参画終了日 */
        endDate: z.iso.date().optional(),

        /* 契約単価履歴 */
        contracts: z
          .array(
            z.object({
              /* 適用開始日 */
              startDate: z.iso.date(),

              /* 契約単価 */
              unitPrice: z
                .coerce.number()
                .int()
                .min(0)
                .optional(),
            }),
          )
          .max(20),
      }),
    )
    .max(50)
    .optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

// 一覧画面用ビュー: Employee(社員ID/社員番号/氏名) + ProjectAssignment(言語/単価/状態)
export const EmployeeListItemSchema = z.object({
  employeeId: z.number(),
  employeeCode: z.string(),
  name: z.string(),
  contractPrice: z.number().nullable(),
  status: z.enum(EmployeeStatus).nullable(),
});

export type EmployeeListItem = z.infer<typeof EmployeeListItemSchema>;

export const EmployeeListSchema = z.array(EmployeeListItemSchema);

export const EmployeeListQuerySchema = z.object({
  employeeCode: z.string().optional(),
  name: z.string().optional(),
});

export const EmployeeDetailsSchema = z.object({
  employeeId: z.number(),
  employeeCode: z.string(),
  userId: z.number().nullable(),
  name: z.string(),
  furigana: z.string().nullable(),
  email: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: z.enum(Gender).nullable(),
  phone: z.string().nullable(),
  joinDate: z.string().nullable(),
  trainingEndDate: z.string().nullable(),
  status: z.enum(EmployeeStatus).nullable(),
  previousCompany1Name: z.string().nullable(),
  previousCompany1StartDate: z.string().nullable(),
  previousCompany1EndDate: z.string().nullable(),
  previousCompany2Name: z.string().nullable(),
  previousCompany2StartDate: z.string().nullable(),
  previousCompany2EndDate: z.string().nullable(),
  previousCompany3Name: z.string().nullable(),
  previousCompany3StartDate: z.string().nullable(),
  previousCompany3EndDate: z.string().nullable(),
  weeklyWorkHours: z.string().nullable(),
  monthlyEstimatedSalary: z.number().nullable(),
  postalCode: z.string().nullable(),
  prefecture: z.string().nullable(),
  city: z.string().nullable(),
  streetAddress: z.string().nullable(),
  emergencyContactName: z.string().nullable(),
  emergencyContactRelationship: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  hasSpouse: z.boolean().nullable(),
  hasChildren: z.boolean().nullable(),
  hasDependents: z.boolean().nullable(),
  myNumber: z.string().nullable(),
  employmentInsuranceNumber: z.string().nullable(),
  basicPensionNumber: z.string().nullable(),
  salaryAccount: z.string().nullable(),
  isDelete: z.boolean(),
  createrId: z.string().nullable(),
  createdAt: z.string(),
  updaterId: z.string().nullable(),
  updatedAt: z.string(),
});
