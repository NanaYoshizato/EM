import { describe, it, expect } from "vitest";
import { createEmployeeSchema, updateEmployeeSchema } from "../types/employee.schema";
import { Gender, Specialty, WorkStatus } from "@prisma/client";

const baseInput = {
  email: "test@example.com",
  name: "山田太郎",
  furigana: "ヤマダタロウ",
  birthDate: "1990-01-01",
  gender: Gender.MALE,
  specialty: Specialty.UNDECIDED,
  workStatus: WorkStatus.WAITING,
  skills: [] as Array<{ skillId: number; years: number }>,
  projects: [] as unknown[],
};

describe("createEmployeeSchema — skillsの重複チェック", () => {
  it("重複が無ければ通る", () => {
    const result = createEmployeeSchema.safeParse({
      ...baseInput,
      skills: [
        { skillId: 1, years: 1 },
        { skillId: 2, years: 2 },
      ],
    });
    expect(result.success).toBe(true);
  });

  it("skillIdが重複していれば弾かれる", () => {
    const result = createEmployeeSchema.safeParse({
      ...baseInput,
      skills: [
        { skillId: 1, years: 1 },
        { skillId: 1, years: 2 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("projects[].skillsが重複していれば弾かれる", () => {
    const result = createEmployeeSchema.safeParse({
      ...baseInput,
      projects: [
        {
          active: false,
          projectName: "案件A",
          factory: "現場A",
          skills: [1, 1],
          startDate: "2026-01-01",
          contracts: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});

describe("updateEmployeeSchema — skillsの重複チェック", () => {
  it("skillsが未指定なら通る", () => {
    const result = updateEmployeeSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it("skillIdが重複していれば弾かれる", () => {
    const result = updateEmployeeSchema.safeParse({
      skills: [
        { skillId: 1, years: 1 },
        { skillId: 1, years: 2 },
      ],
    });
    expect(result.success).toBe(false);
  });

  it("projects[].skillsが重複していれば弾かれる", () => {
    const result = updateEmployeeSchema.safeParse({
      projects: [
        {
          active: false,
          projectName: "案件A",
          factory: "現場A",
          skills: [1, 1],
          startDate: "2026-01-01",
          contracts: [],
        },
      ],
    });
    expect(result.success).toBe(false);
  });
});
