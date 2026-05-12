import { z } from "zod";
import { Gender } from "@prisma/client";

export const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),

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

  weeklyWorkHours: z.coerce.number().min(0).optional(),
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

  studiedFrameworkIds: z.array(z.string()).optional(),
  availableFrameworkIds: z.array(z.string()).optional(),
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

  weeklyWorkHours: z.coerce.number().min(0).optional(),
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

  studiedFrameworkIds: z.array(z.string()).optional(),
  availableFrameworkIds: z.array(z.string()).optional(),
});

export type UpdateEmployeeInput = z.infer<typeof updateEmployeeSchema>;

export const EmployeeListSchema = z.array(
  z.object({
    employee_id: z.string(),
    name: z.string(),
  }),
);

export const EmployeeDetailsSchema = z.object({
  employee_id: z.string(),
  userId: z.string(),
  name: z.string(),
  furigana: z.string(),
  email: z.string().email(),
  birthDate: z.string(),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  phone: z.string().nullable(),
  joinDate: z.string().nullable(),
  trainingEndDate: z.string().nullable(),
  studiedFrameworkIds: z.array(z.string()),
  availableFrameworkIds: z.array(z.string()),
  previousCompany1Name: z.string().nullable(),
  previousCompany1StartDate: z.string().nullable(),
  previousCompany1EndDate: z.string().nullable(),
  previousCompany2Name: z.string().nullable(),
  previousCompany2StartDate: z.string().nullable(),
  previousCompany2EndDate: z.string().nullable(),
  previousCompany3Name: z.string().nullable(),
  previousCompany3StartDate: z.string().nullable(),
  previousCompany3EndDate: z.string().nullable(),
  weeklyWorkHours: z.number().nullable(),
  monthlyEstimatedSalary: z.number().nullable(),
  postalCode: z.string().nullable(),
  prefecture: z.string().nullable(),
  city: z.string().nullable(),
  streetAddress: z.string().nullable(),
  emergencyContactName: z.string().nullable(),
  emergencyContactRelationship: z.string().nullable(),
  emergencyContactPhone: z.string().nullable(),
  hasSpouse: z.string().nullable(),
  hasChildren: z.string().nullable(),
  hasDependents: z.string().nullable(),
  myNumber: z.string().nullable(),
  employmentInsuranceNumber: z.string().nullable(),
  basicPensionNumber: z.string().nullable(),
  salaryAccount: z.string().nullable(),
  isDelete: z.boolean(),
  creater_id: z.string().nullable(),
  createAt: z.string(),
  updater_id: z.string().nullable(),
  updateAt: z.string(),
});
