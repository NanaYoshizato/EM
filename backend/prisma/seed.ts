import {
  PrismaClient,
  Gender,
  EmployeeStatus,
  SettlementUnit,
  SkillCategory,
} from "@prisma/client";
import { ROLES, ROLE_ID } from "../src/constants/roles";

const prisma = new PrismaClient();
async function main() {
  // ----------------------
  // Role（マスタデータ。idはsrc/constants/roles.tsの並び順と一致させる）
  // ----------------------
  for (const role of ROLES) {
    await prisma.role.upsert({
      where: { id: role.id },
      update: {},
      create: role,
    });
  }

  // ----------------------
  // Skill（マスタデータ。名前で重複しないようにupsert）
  // ----------------------
  const skillMaster = [
    { name: "TypeScript", category: SkillCategory.LANGUAGE },
    { name: "Java", category: SkillCategory.LANGUAGE },
    { name: "Python", category: SkillCategory.LANGUAGE },
    { name: "React", category: SkillCategory.LIBRARY },
    { name: "Next.js", category: SkillCategory.FRAMEWORK },
    { name: "Spring Boot", category: SkillCategory.FRAMEWORK },
    { name: "AWS", category: SkillCategory.CLOUD },
    { name: "Docker", category: SkillCategory.OTHER },
  ];
  const skillId: Record<string, number> = {};
  for (const skill of skillMaster) {
    const row = await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: skill,
    });
    skillId[skill.name] = row.id;
  }

  // ----------------------
  // User
  // ----------------------
  const user1 = await prisma.user.create({
    data: {
      email: "admin@test.com",
      firebaseUid: "admin-firebase-uid",
      roleId: ROLE_ID.admin,
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "mentor@test.com",
      firebaseUid: "mentor-firebase-uid",
      roleId: ROLE_ID.mentor,
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "employee1@test.com",
      firebaseUid: "employee1-firebase-uid",
      roleId: ROLE_ID.employee,
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: "employee2@test.com",
      firebaseUid: "employee2-firebase-uid",
      roleId: ROLE_ID.sales,
    },
  });

  const user5 = await prisma.user.create({
    data: {
      email: "sysadmin@test.com",
      firebaseUid: "sysadmin-firebase-uid",
      roleId: ROLE_ID.system_admin,
    },
  });

  // ----------------------
  // Employee
  // ----------------------
  await prisma.employee.create({
    data: {
      employeeCode: "EMP001",
      userId: user1.id,
      name: "山田太郎",
      gender: Gender.MALE,
      birthDate: new Date("1990-01-01"),
    },
  });

  await prisma.employee.create({
    data: {
      employeeCode: "EMP002",
      userId: user2.id,
      name: "佐藤花子",
      gender: Gender.FEMALE,
      birthDate: new Date("1995-05-10"),
    },
  });

  await prisma.employee.create({
    data: {
      employeeCode: "EMP003",
      userId: user5.id,
      name: "高橋次郎",
      gender: Gender.MALE,
      birthDate: new Date("1985-11-03"),
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
    },
  });

  // ----------------------
  // EmployeeSkill（保有スキル）
  // ----------------------
  await prisma.employeeSkill.createMany({
    data: [
      { employeeId: employeeFull1.id, skillId: skillId["Java"], years: 5 },
      { employeeId: employeeFull1.id, skillId: skillId["Spring Boot"], years: 3.5 },
      { employeeId: employeeFull1.id, skillId: skillId["AWS"], years: 1 },
      { employeeId: employeeFull2.id, skillId: skillId["TypeScript"], years: 3 },
      { employeeId: employeeFull2.id, skillId: skillId["React"], years: 2.5 },
    ],
  });

  // ----------------------
  // EmployeeProjectHistory（案件履歴＋使用スキル＋契約単価の履歴）
  // ----------------------
  await prisma.employeeProjectHistory.create({
    data: {
      employeeId: employeeFull1.id,
      active: false,
      projectName: "在庫管理システム保守",
      factory: "DEF物流株式会社",
      startDate: new Date("2023-04-01"),
      endDate: new Date("2025-03-31"),
      skills: { create: [{ skillId: skillId["Java"] }] },
      contracts: { create: [{ startDate: new Date("2023-04-01"), unitPrice: 600000 }] },
    },
  });

  await prisma.employeeProjectHistory.create({
    data: {
      employeeId: employeeFull1.id,
      active: true,
      projectName: "金融システム開発",
      factory: "XYZ銀行",
      startDate: new Date("2025-04-01"),
      skills: {
        create: [{ skillId: skillId["Java"] }, { skillId: skillId["Spring Boot"] }],
      },
      contracts: {
        create: [
          { startDate: new Date("2025-04-01"), unitPrice: 650000 },
          { startDate: new Date("2025-10-01"), unitPrice: 680000 },
        ],
      },
    },
  });

  await prisma.employeeProjectHistory.create({
    data: {
      employeeId: employeeFull2.id,
      active: true,
      projectName: "ECサイトリニューアル",
      factory: "EC株式会社",
      startDate: new Date("2026-01-01"),
      skills: {
        create: [{ skillId: skillId["TypeScript"] }, { skillId: skillId["React"] }],
      },
      contracts: { create: [{ startDate: new Date("2026-01-01") }] },
    },
  });

  // ----------------------
  // Project
  // ----------------------
  await prisma.project.create({
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
  // ProjectAssignment
  // ----------------------
  const assignment1 = await prisma.projectAssignment.create({
    data: {
      projectId: projectFull1.id,
      employeeId: employeeFull1.id,
      status: EmployeeStatus.WORKING,
      startDate: new Date("2025-04-01"),
      contractPrice: 680000,
      excessUnitPrice: 3000,
      deductionUnitPrice: 2000,
      mentorId: user2.id,
    },
  });

  const assignment2 = await prisma.projectAssignment.create({
    data: {
      projectId: projectFull2.id,
      employeeId: employeeFull2.id,
      status: EmployeeStatus.WAITING,
      startDate: new Date("2026-01-01"),
      contractPrice: 700000,
    },
  });

  // ----------------------
  // ProjectAssignment単価改定履歴（assignment1は契約開始後に単価改定があった例）
  // ----------------------
  await prisma.projectAssignmentContract.createMany({
    data: [
      {
        projectAssignmentId: assignment1.id,
        startDate: new Date("2025-04-01"),
        unitPrice: 650000,
      },
      {
        projectAssignmentId: assignment1.id,
        startDate: new Date("2025-10-01"),
        unitPrice: 680000,
      },
      {
        projectAssignmentId: assignment2.id,
        startDate: new Date("2026-01-01"),
        unitPrice: 700000,
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
