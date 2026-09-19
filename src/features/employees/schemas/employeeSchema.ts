import { z } from "zod";
import { messages } from "../../../constants/messages";

export const employeeSchema = z.object({
  // 基本情報
  name: z.string().min(1, messages.common.validation.required),
  furigana: z.string().min(1, messages.common.validation.required),
  birthDate: z.string().min(1, messages.common.validation.required),
  gender: z.enum(["男性", "女性", "その他"]),
  phone: z.string().min(1, messages.common.validation.required),
  email: z
    .string()
    .min(1, messages.common.validation.required)
    .email(messages.common.validation.invalidEmail),
  joinDate: z.string().min(1, messages.common.validation.required),
  trainingEndDate: z.string().optional(),
  trainingLanguages: z.array(z.string()),
  availableLanguages: z.array(z.string()),

  // 前職企業（最大3社）
  previousCompany1Name: z.string().optional(),
  previousCompany1StartDate: z.string().optional(),
  previousCompany1EndDate: z.string().optional(),
  previousCompany2Name: z.string().optional(),
  previousCompany2StartDate: z.string().optional(),
  previousCompany2EndDate: z.string().optional(),
  previousCompany3Name: z.string().optional(),
  previousCompany3StartDate: z.string().optional(),
  previousCompany3EndDate: z.string().optional(),

  weeklyWorkHours: z.string().optional(),
  monthlyEstimatedSalary: z.string().optional(),

  // 住所
  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  streetAddress: z.string().optional(),

  // 緊急連絡先
  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),
  hasSpouse: z.enum(["有", "無"]).optional(),
  hasChildren: z.enum(["有", "無"]).optional(),
  hasDependents: z.enum(["有", "無"]).optional(),

  // 機密情報
  myNumber: z.string().optional(),
  employmentInsuranceNumber: z.string().optional(),
  basicPensionNumber: z.string().optional(),
  salaryAccount: z.string().optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;
