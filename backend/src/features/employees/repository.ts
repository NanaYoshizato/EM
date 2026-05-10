import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import type { CreateEmployeeInput } from "./types/createEmployee.schema";

export const createEmployeeWithUser = async (data: CreateEmployeeInput) => {
  return prisma.$transaction(async (tx) => {
    const hashed = await bcrypt.hash(data.password, 10);
    const user = await tx.user.create({
      data: { email: data.email, password: hashed },
    });

    const employee = await tx.employee.create({
      data: {
        userId: user.id,
        name: data.name,
        furigana: data.furigana,
        email: data.email,
        birthDate: new Date(data.birthDate),
        gender: data.gender,
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

        ...(data.hasSpouse !== undefined && { hasSpouse: data.hasSpouse }),
        ...(data.hasChildren !== undefined && {
          hasChildren: data.hasChildren,
        }),
        ...(data.hasDependents !== undefined && {
          hasDependents: data.hasDependents,
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

        ...(data.studiedFrameworkIds && {
          studiedFrameworks: {
            create: data.studiedFrameworkIds.map((frameworkId) => ({
              frameworkId,
            })),
          },
        }),
        ...(data.availableFrameworkIds && {
          availableFrameworks: {
            create: data.availableFrameworkIds.map((frameworkId) => ({
              frameworkId,
            })),
          },
        }),
      },
    });

    return { userId: user.id, employeeId: employee.employee_id };
  });
};
