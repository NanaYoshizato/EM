import { z } from "zod";

export const createEmployeeSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),

  name: z.string(),
  furigana: z.string(),
  birthDate: z.string(),
  gender: z.string(),
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
  monthlyEstimatedSalary: z.string().optional(),

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
