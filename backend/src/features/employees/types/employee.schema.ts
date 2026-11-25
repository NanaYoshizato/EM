import { z } from "zod";
import { freeText, gitHubUsername, personName } from "@/lib/textSchema";
import { Gender, Specialty, WorkStatus } from "@prisma/client";
import { ROLE_NAMES } from "@/constants/roles";

export const createEmployeeSchema = z.object({
  /* メールアドレス */
  email: z.email(),

  /* 氏名 */
  name: personName()
    .min(1)
    .max(50),

  /* フリガナ */
  furigana: personName()
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
  gitHub: gitHubUsername()
    .optional(),

  /* 研修終了日 */
  trainingEndDate: z.iso.date().optional(),

  /* 前職1社目の会社名 */
  previousCompany1Name: freeText()
    .max(100)
    .optional(),

  /* 前職1社目の在籍開始日 */
  previousCompany1StartDate: z.iso.date().optional(),

  /* 前職1社目の在籍終了日 */
  previousCompany1EndDate: z.iso.date().optional(),

  /* 前職2社目の会社名 */
  previousCompany2Name: freeText()
    .max(100)
    .optional(),

  /* 前職2社目の在籍開始日 */
  previousCompany2StartDate: z.iso.date().optional(),

  /* 前職2社目の在籍終了日 */
  previousCompany2EndDate: z.iso.date().optional(),

  /* 前職3社目の会社名 */
  previousCompany3Name: freeText()
    .max(100)
    .optional(),

  /* 前職3社目の在籍開始日 */
  previousCompany3StartDate: z.iso.date().optional(),

  /* 前職3社目の在籍終了日 */
  previousCompany3EndDate: z.iso.date().optional(),

  /* 週あたり稼働時間 */
  weeklyWorkHours: freeText()
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
  prefecture: freeText()
    .max(10)
    .optional(),

  /* 市区町村 */
  city: freeText()
    .max(100)
    .optional(),

  /* 番地・建物名 */
  streetAddress: freeText()
    .max(100)
    .optional(),

  /* 緊急連絡先氏名 */
  emergencyContactName: personName()
    .max(50)
    .optional(),

  /* 緊急連絡先続柄 */
  emergencyContactRelationship: freeText()
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
  salaryAccount: freeText()
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
    .max(50),

  /* 案件履歴 */
  projects: z
    .array(
      z.object({
        /* 稼働中か */
        active: z.boolean(),

        /* 案件名 */
        projectName: freeText()
          .min(1)
          .max(100),

        /* 常駐先企業名 */
        factory: freeText()
          .min(1)
          .max(100),

        /* 使用スキルのID一覧 */
        skills: z.array(z
          .number()
          .int()
          .positive()
        )
          .max(20),

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
  name: personName()
    .min(1)
    .max(50)
    .optional(),

  /* フリガナ */
  furigana: personName()
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
  gitHub: gitHubUsername()
    .optional(),

  /* 研修終了日 */
  trainingEndDate: z.iso.date().optional(),

  /* 前職1社目の会社名 */
  previousCompany1Name: freeText()
    .max(100)
    .optional(),

  /* 前職1社目の在籍開始日 */
  previousCompany1StartDate: z.iso.date().optional(),

  /* 前職1社目の在籍終了日 */
  previousCompany1EndDate: z.iso.date().optional(),

  /* 前職2社目の会社名 */
  previousCompany2Name: freeText()
    .max(100)
    .optional(),

  /* 前職2社目の在籍開始日 */
  previousCompany2StartDate: z.iso.date().optional(),

  /* 前職2社目の在籍終了日 */
  previousCompany2EndDate: z.iso.date().optional(),

  /* 前職3社目の会社名 */
  previousCompany3Name: freeText()
    .max(100)
    .optional(),

  /* 前職3社目の在籍開始日 */
  previousCompany3StartDate: z.iso.date().optional(),

  /* 前職3社目の在籍終了日 */
  previousCompany3EndDate: z.iso.date().optional(),

  /* 週あたり稼働時間 */
  weeklyWorkHours: freeText()
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
  prefecture: freeText()
    .max(10)
    .optional(),

  /* 市区町村 */
  city: freeText()
    .max(100)
    .optional(),

  /* 番地・建物名 */
  streetAddress: freeText()
    .max(100)
    .optional(),

  /* 緊急連絡先氏名 */
  emergencyContactName: personName()
    .max(50)
    .optional(),

  /* 緊急連絡先続柄 */
  emergencyContactRelationship: freeText()
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
  salaryAccount: freeText()
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
    .optional(),

  /* 案件履歴 */
  projects: z
    .array(
      z.object({
        /* 稼働中か */
        active: z.boolean(),

        /* 案件名 */
        projectName: freeText()
          .min(1)
          .max(100),

        /* 常駐先企業名 */
        factory: freeText()
          .min(1)
          .max(100),

        /* 使用スキルのID一覧 */
        skills: z.array(z
          .number()
          .int()
          .positive()
        )
          .max(20),

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
}).refine(
  (data) => Object.keys(data).length > 0,
  "更新する項目がありません",
);

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

/** 社員一覧の検索条件 */
export const EmployeeListQuerySchema = z.object({
  /* 社員番号（部分一致） */
  employeeCode: freeText()
    .max(20)
    .optional(),

  /* 氏名・フリガナ（部分一致） */
  name: freeText()
    .max(50)
    .optional(),

  /* 専門領域 */
  specialtyFilter: z.enum(Specialty).optional(),

  /* 稼働ステータス（管理者・システム管理者のみ） */
  workStatusFilter: z.enum(WorkStatus).optional(),

  /* スキルID（カンマ区切り・20件まで。いずれかを持つ社員） */
  skillsFilter: z
    .string()
    .regex(/^[1-9]\d{0,8}(,[1-9]\d{0,8}){0,19}$/)
    .optional(),

  /* 今月入社の社員だけ */
  monthly: z.enum(["true", "false"]).optional(),

  /* 入社年月の並び順 */
  sort: z.enum(["asc", "desc"]).default("desc"),

  /* ページ番号 */
  page: z
    .coerce.number()
    .int()
    .min(1)
    .max(100000)
    .default(1),

  /* 1ページの件数 */
  limit: z
    .coerce.number()
    .int()
    .min(1)
    .max(100)
    .default(12),
});

export type EmployeeListQuery = z.infer<typeof EmployeeListQuerySchema>;

/** 社員一覧の1件（公開の項目だけ） */
const EmployeeListItemSchema = z.object({
  /* 社員ID */
  employeeId: z.number(),

  /* 社員番号 */
  employeeCode: z.string(),

  /* 氏名 */
  name: z.string(),

  /* フリガナ */
  furigana: z.string().nullable(),

  /* 専門領域 */
  specialty: z.enum(Specialty),

  /* 入社年月 */
  joinDate: z.string().nullable(),

  /* 保有スキル名 */
  skills: z.array(z.string()),
});

/** 社員一覧の応答（ページ付き） */
export const EmployeeListSchema = z.object({
  /* 社員 */
  items: z.array(EmployeeListItemSchema),

  /* 該当件数 */
  total: z.number(),

  /* 今のページ番号 */
  currentPage: z.number(),

  /* 総ページ数 */
  totalPage: z.number(),
});

/** 社員詳細の案件履歴（1件分） */
const ProjectHistoryDetailSchema = z.object({
  /* 稼働中か */
  active: z.boolean(),

  /* 案件名 */
  projectName: z.string(),

  /* 常駐先企業名 */
  factory: z.string(),

  /* 参画開始日 */
  startDate: z.string(),

  /* 参画終了日 */
  endDate: z.string().nullable(),

  /* 使用スキル */
  skills: z.array(
    z.object({
      /* スキルID */
      skillId: z.number(),

      /* スキル名 */
      name: z.string(),
    }),
  ),

  /* 契約単価履歴 */
  contracts: z.array(
    z.object({
      /* 適用開始日 */
      startDate: z.string(),

      /* 契約単価 */
      unitPrice: z.number().nullable(),
    }),
  ),
});

/** 社員詳細の応答（日付は"YYYY-MM-DD"。読む権限のないまとまりの項目はnull） */
export const EmployeeDetailSchema = z.object({
  /* 社員番号 */
  employeeCode: z.string(),

  /* ロール（アカウント未発行の社員はnull） */
  role: z.enum(ROLE_NAMES).nullable(),

  /* メールアドレス */
  email: z.string().nullable(),

  /* 氏名 */
  name: z.string(),

  /* フリガナ */
  furigana: z.string().nullable(),

  /* 生年月日 */
  birthDate: z.string().nullable(),

  /* 性別 */
  gender: z.enum(Gender).nullable(),

  /* 電話番号 */
  phone: z.string().nullable(),

  /* 入社年月（"YYYY-MM"） */
  joinDate: z.string().nullable(),

  /* 専門領域 */
  specialty: z.enum(Specialty),

  /* 稼働ステータス */
  workStatus: z.enum(WorkStatus).nullable(),

  /* GitHubユーザー名 */
  gitHub: z.string().nullable(),

  /* 研修終了日 */
  trainingEndDate: z.string().nullable(),

  /* 前職1社目の会社名 */
  previousCompany1Name: z.string().nullable(),

  /* 前職1社目の在籍開始日 */
  previousCompany1StartDate: z.string().nullable(),

  /* 前職1社目の在籍終了日 */
  previousCompany1EndDate: z.string().nullable(),

  /* 前職2社目の会社名 */
  previousCompany2Name: z.string().nullable(),

  /* 前職2社目の在籍開始日 */
  previousCompany2StartDate: z.string().nullable(),

  /* 前職2社目の在籍終了日 */
  previousCompany2EndDate: z.string().nullable(),

  /* 前職3社目の会社名 */
  previousCompany3Name: z.string().nullable(),

  /* 前職3社目の在籍開始日 */
  previousCompany3StartDate: z.string().nullable(),

  /* 前職3社目の在籍終了日 */
  previousCompany3EndDate: z.string().nullable(),

  /* 週あたり稼働時間 */
  weeklyWorkHours: z.string().nullable(),

  /* 月額想定給与 */
  monthlyEstimatedSalary: z.number().nullable(),

  /* 郵便番号 */
  postalCode: z.string().nullable(),

  /* 都道府県 */
  prefecture: z.string().nullable(),

  /* 市区町村 */
  city: z.string().nullable(),

  /* 番地・建物名 */
  streetAddress: z.string().nullable(),

  /* 緊急連絡先氏名 */
  emergencyContactName: z.string().nullable(),

  /* 緊急連絡先続柄 */
  emergencyContactRelationship: z.string().nullable(),

  /* 緊急連絡先電話番号 */
  emergencyContactPhone: z.string().nullable(),

  /* 配偶者の有無 */
  hasSpouse: z.enum(["有", "無"]).nullable(),

  /* 子の有無 */
  hasChildren: z.enum(["有", "無"]).nullable(),

  /* 扶養家族の有無 */
  hasDependents: z.enum(["有", "無"]).nullable(),

  /* マイナンバー */
  myNumber: z.string().nullable(),

  /* 雇用保険番号 */
  employmentInsuranceNumber: z.string().nullable(),

  /* 基礎年金番号 */
  basicPensionNumber: z.string().nullable(),

  /* 給与振込口座 */
  salaryAccount: z.string().nullable(),

  /* 保有スキル */
  skills: z.array(
    z.object({
      /* スキルID */
      skillId: z.number(),

      /* スキル名 */
      name: z.string(),

      /* 経験年数 */
      years: z.number(),
    }),
  ),

  /* 案件履歴 */
  projects: z.array(ProjectHistoryDetailSchema).nullable(),
});
