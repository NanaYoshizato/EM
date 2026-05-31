import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "./types/employee.schema";

export class DuplicateEmailError extends Error {
  constructor() {
    super("DuplicateEmail");
    this.name = "DuplicateEmailError";
  }
}

const DEFAULT_PASSWORD = "overtech";

const buildEmployeeCode = (id: number) => `EMP${String(id).padStart(3, "0")}`;

export const createEmployeeWithUser = async (data: CreateEmployeeInput) => {
  return prisma.$transaction(async (tx) => {
    const existingEmployeeWithEmail = await tx.employee.findFirst({
      where: { email: data.email, isDelete: false },
    });
    if (existingEmployeeWithEmail) {
      throw new DuplicateEmailError();
    }

    let user = await tx.user.findUnique({ where: { email: data.email } });
    if (!user) {
      const hashed = await bcrypt.hash(DEFAULT_PASSWORD, 10);
      user = await tx.user.create({
        data: { email: data.email, password: hashed },
      });
    } else {
      const linkedEmployee = await tx.employee.findUnique({
        where: { userId: user.id },
      });
      if (linkedEmployee) {
        throw new DuplicateEmailError();
      }
    }

    const last = await tx.employee.findFirst({ orderBy: { id: "desc" } });
    const nextId = (last?.id ?? 0) + 1;
    const code = buildEmployeeCode(nextId);

    const employee = await tx.employee.create({
      data: {
        user: { connect: { id: user.id } },
        employeeCode: code,
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
        ...(data.hasSpouse !== undefined && {
          hasSpouse: data.hasSpouse === "有",
        }),
        ...(data.hasChildren !== undefined && {
          hasChildren: data.hasChildren === "有",
        }),
        ...(data.hasDependents !== undefined && {
          hasDependents: data.hasDependents === "有",
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
        ...(data.studiedFrameworkIds !== undefined && {
          studiedFrameworks: {
            create: data.studiedFrameworkIds.map((frameworkId) => ({
              frameworkId,
            })),
          },
        }),
        ...(data.availableFrameworkIds !== undefined && {
          availableFrameworks: {
            create: data.availableFrameworkIds.map((frameworkId) => ({
              frameworkId,
            })),
          },
        }),
      },
    });

    return { userId: user.id, employeeId: employee.id };
  });
};

export const updateEmployee = async (
  employeeId: number,
  data: UpdateEmployeeInput,
) => {
  const updateData: Prisma.EmployeeUpdateInput = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.furigana !== undefined) updateData.furigana = data.furigana;
  if (data.birthDate !== undefined)
    updateData.birthDate = new Date(data.birthDate);
  if (data.gender !== undefined) updateData.gender = data.gender;
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
    updateData.hasSpouse = data.hasSpouse === "有";
  if (data.hasChildren !== undefined)
    updateData.hasChildren = data.hasChildren === "有";
  if (data.hasDependents !== undefined)
    updateData.hasDependents = data.hasDependents === "有";

  if (data.myNumber !== undefined) updateData.myNumber = data.myNumber;
  if (data.employmentInsuranceNumber !== undefined)
    updateData.employmentInsuranceNumber = data.employmentInsuranceNumber;
  if (data.basicPensionNumber !== undefined)
    updateData.basicPensionNumber = data.basicPensionNumber;
  if (data.salaryAccount !== undefined)
    updateData.salaryAccount = data.salaryAccount;

  return prisma.$transaction(async (tx) => {
    if (data.studiedFrameworkIds !== undefined) {
      await tx.employeeStudiedFramework.deleteMany({
        where: { employeeId },
      });
      if (data.studiedFrameworkIds.length > 0) {
        await tx.employeeStudiedFramework.createMany({
          data: data.studiedFrameworkIds.map((frameworkId) => ({
            employeeId,
            frameworkId,
          })),
        });
      }
    }

    if (data.availableFrameworkIds !== undefined) {
      await tx.employeeAvailableFramework.deleteMany({
        where: { employeeId },
      });
      if (data.availableFrameworkIds.length > 0) {
        await tx.employeeAvailableFramework.createMany({
          data: data.availableFrameworkIds.map((frameworkId) => ({
            employeeId,
            frameworkId,
          })),
        });
      }
    }

    const updated = await tx.employee.update({
      where: { id: employeeId },
      data: updateData,
    });

    return updated;
  });
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
          frameworks: {
            where: { isDelete: false },
            select: { framework: { select: { frameworkName: true } } },
          },
        },
      },
    },
    orderBy: { id: "asc" },
  });

  return employees.map((emp) => {
    const latestAssignment = emp.assignments[0] ?? null;
    const frameworks = latestAssignment
      ? latestAssignment.frameworks.map((paf) => paf.framework.frameworkName)
      : [];

    return {
      employeeId: emp.id,
      employeeCode: emp.employeeCode,
      name: emp.name,
      frameworks,
      contractPrice: latestAssignment?.contractPrice ?? null,
      status: latestAssignment?.status ?? null,
    };
  });
};

export const getEmployeeDetails = async (employeeId: number) => {
  return prisma.employee.findUnique({
    where: { id: employeeId },
    include: {
      studiedFrameworks: { include: { framework: true } },
      availableFrameworks: { include: { framework: true } },
      assignments: {
        where: { isDelete: false },
        orderBy: { startDate: "desc" },
        take: 1,
        select: { status: true },
      },
    },
  });
};
