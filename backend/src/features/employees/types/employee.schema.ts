import { z } from "zod";
import { Gender, EmployeeStatus } from "@prisma/client";

export const createEmployeeSchema = z.object({
  email: z.string().email(),

  name: z.string(),
  furigana: z.string(),
  birthDate: z.string(),
  gender: z.nativeEnum(Gender),
  phone: z.string().optional(),

  joinDate: z.string().optional(),
  trainingEndDate: z.string().optional(),

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
  monthlyEstimatedSalary: z.coerce.number().min(0).optional(),

  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  streetAddress: z.string().optional(),

  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),

  hasSpouse: z.string().optional(),
  hasChildren: z.string().optional(),
  hasDependents: z.string().optional(),

  myNumber: z.string().optional(),
  employmentInsuranceNumber: z.string().optional(),
  basicPensionNumber: z.string().optional(),
  salaryAccount: z.string().optional(),

  studiedFrameworkIds: z.array(z.number()).optional(),
  availableFrameworkIds: z.array(z.number()).optional(),
});

export type CreateEmployeeInput = z.infer<typeof createEmployeeSchema>;

export const updateEmployeeSchema = z.object({
  name: z.string().optional(),
  furigana: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.nativeEnum(Gender).optional(),
  phone: z.string().optional(),

  joinDate: z.string().optional(),
  trainingEndDate: z.string().optional(),

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
  monthlyEstimatedSalary: z.coerce.number().min(0).optional(),

  postalCode: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  streetAddress: z.string().optional(),

  emergencyContactName: z.string().optional(),
  emergencyContactRelationship: z.string().optional(),
  emergencyContactPhone: z.string().optional(),

  hasSpouse: z.string().optional(),
  hasChildren: z.string().optional(),
  hasDependents: z.string().optional(),

  myNumber: z.string().optional(),
  employmentInsuranceNumber: z.string().optional(),
  basicPensionNumber: z.string().optional(),
  salaryAccount: z.string().optional(),

  studiedFrameworkIds: z.array(z.number()).optional(),
  availableFrameworkIds: z.array(z.number()).optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

// 一覧画面用ビュー: Employee(社員ID/社員番号/氏名) + ProjectAssignment(言語/単価/状態)
export const EmployeeListItemSchema = z.object({
  employeeId: z.number(),
  employeeCode: z.string(),
  name: z.string(),
  frameworks: z.array(z.string()),
  contractPrice: z.number().nullable(),
  status: z.nativeEnum(EmployeeStatus).nullable(),
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
  userId: z.number(),
  name: z.string(),
  furigana: z.string().nullable(),
  email: z.string().nullable(),
  birthDate: z.string().nullable(),
  gender: z.nativeEnum(Gender).nullable(),
  phone: z.string().nullable(),
  joinDate: z.string().nullable(),
  trainingEndDate: z.string().nullable(),
  studiedFrameworkIds: z.array(z.number()),
  availableFrameworkIds: z.array(z.number()),
  studiedFrameworkNames: z.array(z.string()),
  availableFrameworkNames: z.array(z.string()),
  status: z.nativeEnum(EmployeeStatus).nullable(),
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
