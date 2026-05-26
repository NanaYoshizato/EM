import {
  PrismaClient,
  Gender,
  EmployeeStatus,
  SettlementUnit,
} from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();
async function main() {
  const hashed = await bcrypt.hash("password123", 10);

  // ----------------------
  // User
  // ----------------------
  const user1 = await prisma.user.create({
    data: {
      email: "admin@test.com",
      password: hashed,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "mentor@test.com",
      password: hashed,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "employee1@test.com",
      password: hashed,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: "employee2@test.com",
      password: hashed,
    },
  });

  // ----------------------
  // Framework
  // ----------------------
  const react = await prisma.framework.create({
    data: { frameworkName: "React" },
  });

  const node = await prisma.framework.create({
    data: { frameworkName: "Node.js" },
  });

  // ----------------------
  // Employee
  // ----------------------
  const employee1 = await prisma.employee.create({
    data: {
      employeeCode: "EMP001",
      userId: user1.id,
      name: "山田太郎",
      gender: Gender.MALE,
      birthDate: new Date("1990-01-01"),
    },
  });

  const employee2 = await prisma.employee.create({
    data: {
      employeeCode: "EMP002",
      userId: user2.id,
      name: "佐藤花子",
      gender: Gender.FEMALE,
      birthDate: new Date("1995-05-10"),
    },
  });

  // ----------------------
  // Employee（フルデータ）
  // ----------------------
  const employeeFull1 = await prisma.employee.create({
    data: {
      employeeCode: "EMP100",
      userId: user3.id,
      name: "鈴木一郎",
      furigana: "スズキイチロウ",
      email: "ichiro@test.com",
      birthDate: new Date("1988-03-15"),
      gender: Gender.MALE,
      phone: "09011112222",

      joinDate: new Date("2020-04-01"),
      trainingEndDate: new Date("2020-06-30"),

      weeklyWorkHours: "40",
      monthlyEstimatedSalary: 500000,

      postalCode: "1000001",
      prefecture: "東京都",
      city: "千代田区",
      streetAddress: "1-1-1",
      nearestStation: "東京駅",

      emergencyContactName: "鈴木花子",
      emergencyContactRelationship: "配偶者",
      emergencyContactPhone: "09099998888",

      hasSpouse: true,
      hasChildren: true,
      hasDependents: true,

      myNumber: "123456789012",
      employmentInsuranceNumber: "EI123456",
      basicPensionNumber: "PN123456",
      salaryAccount: "三菱UFJ銀行",

      previousCompany1Name: "前職A",
      previousCompany1StartDate: new Date("2015-04-01"),
      previousCompany1EndDate: new Date("2019-12-31"),

      studiedFrameworks: {
        create: [{ frameworkId: react.id }],
      },
      availableFrameworks: {
        create: [{ frameworkId: node.id }],
      },
    },
  });

  const employeeFull2 = await prisma.employee.create({
    data: {
      employeeCode: "EMP101",
      userId: user4.id,
      name: "田中花子",
      furigana: "タナカハナコ",
      email: "hanako@test.com",
      birthDate: new Date("1992-07-20"),
      gender: Gender.FEMALE,
      phone: "08033334444",

      joinDate: new Date("2021-01-10"),
      trainingEndDate: new Date("2021-03-31"),

      weeklyWorkHours: "38",
      monthlyEstimatedSalary: 450000,

      postalCode: "1500001",
      prefecture: "東京都",
      city: "渋谷区",
      streetAddress: "2-2-2",
      nearestStation: "渋谷駅",

      emergencyContactName: "田中太郎",
      emergencyContactRelationship: "父",
      emergencyContactPhone: "08077776666",

      hasSpouse: false,
      hasChildren: false,
      hasDependents: false,

      myNumber: "987654321098",
      employmentInsuranceNumber: "EI654321",
      basicPensionNumber: "PN654321",
      salaryAccount: "みずほ銀行",

      previousCompany1Name: "前職B",
      previousCompany1StartDate: new Date("2018-04-01"),
      previousCompany1EndDate: new Date("2020-12-31"),

      studiedFrameworks: {
        create: [{ frameworkId: node.id }],
      },
      availableFrameworks: {
        create: [{ frameworkId: react.id }],
      },
    },
  });

  // ----------------------
  // Employee × Framework
  // ----------------------
  await prisma.employeeStudiedFramework.createMany({
    data: [
      { employeeId: employee1.id, frameworkId: react.id },
      { employeeId: employee1.id, frameworkId: node.id },
    ],
  });

  await prisma.employeeAvailableFramework.create({
    data: {
      employeeId: employee2.id,
      frameworkId: react.id,
    },
  });

  // ----------------------
  // Project
  // ----------------------
  const project = await prisma.project.create({
    data: {
      name: "ECサイト開発",
      clientCompanyName: "ABC株式会社",
      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-12-31"),
      minWorkHours: 140,
      maxWorkHours: 180,
      settlementUnit: SettlementUnit.MIN_30,
      minPrice: 600000,
      maxPrice: 700000,
    },
  });

  // ----------------------
  // Project（フルデータ）
  // ----------------------
  const projectFull1 = await prisma.project.create({
    data: {
      name: "金融システム開発",
      clientCompanyName: "XYZ銀行",
      clientAddress: "東京都中央区1-2-3",

      startDate: new Date("2025-04-01"),
      endDate: new Date("2026-03-31"),

      minWorkHours: 140,
      maxWorkHours: 180,

      excessUnitPrice: 3000,
      deductionUnitPrice: 2000,

      settlementUnit: SettlementUnit.MIN_30,

      minPrice: 600000,
      maxPrice: 700000,

      workStyle: "常駐",
      nearestStation: "日本橋駅",

      remarks: "長期案件、Java経験必須",
    },
  });

  const projectFull2 = await prisma.project.create({
    data: {
      name: "ECサイトリニューアル",
      clientCompanyName: "EC株式会社",
      clientAddress: "東京都港区4-5-6",

      startDate: new Date("2026-01-01"),
      endDate: new Date("2026-09-30"),

      minWorkHours: 150,
      maxWorkHours: 190,

      excessUnitPrice: 3500,
      deductionUnitPrice: 2500,

      settlementUnit: SettlementUnit.MIN_60,

      minPrice: 650000,
      maxPrice: 750000,

      workStyle: "リモート併用",
      nearestStation: "品川駅",

      remarks: "React / Node.js 必須",
    },
  });

  // ----------------------
  // Project × Framework
  // ----------------------
  await prisma.projectFramework.create({
    data: {
      projectId: project.id,
      frameworkId: react.id,
    },
  });

  // ----------------------
  // ProjectAssignment
  // ----------------------
  await prisma.projectAssignment.createMany({
    data: [
      {
        projectId: projectFull1.id,
        employeeId: employeeFull1.id,
        status: EmployeeStatus.WORKING,
        startDate: new Date("2025-04-01"),
        contractPrice: 680000,
        excessUnitPrice: 3000,
        deductionUnitPrice: 2000,
        mentorId: user2.id,
      },
      {
        projectId: projectFull2.id,
        employeeId: employeeFull2.id,
        status: EmployeeStatus.WAITING,
        startDate: new Date("2026-01-01"),
        contractPrice: 700000,
      },
    ],
  });

  console.log("🌱 Seed data created!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
