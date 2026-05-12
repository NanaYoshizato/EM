import { describe, it, expect, vi, beforeEach } from "vitest";
import { Gender } from "@prisma/client";

vi.mock("../service", () => ({
  createEmployee: vi.fn(),
  updateEmployeeService: vi.fn(),
  getEmployeeDetailsService: vi.fn(),
}));

import {
  createEmployee,
  updateEmployeeService,
  getEmployeeDetailsService,
} from "../service";
import {
  createEmployeeController,
  updateEmployeeController,
  getEmployeeDetailsController,
} from "../controller";

const mockCreateEmployee = vi.mocked(createEmployee);
const mockUpdateEmployeeService = vi.mocked(updateEmployeeService);
const mockGetEmployeeDetailsService = vi.mocked(getEmployeeDetailsService);

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEmployeeController", () => {
  it("should return 201 with no body", async () => {
    const body = { email: "test@example.com", password: "password123" };
    const expectedResponse = { status: 201 };
    const c = {
      req: {
        valid: vi.fn().mockReturnValue(body),
      },
      body: vi.fn().mockReturnValue(expectedResponse),
      json: vi.fn(),
    } as unknown as any;

    const result = await createEmployeeController(c, vi.fn());

    expect(c.req.valid).toHaveBeenCalledWith("json");
    expect(mockCreateEmployee).toHaveBeenCalledWith(body);
    expect(c.body).toHaveBeenCalledWith(null, 201);
    expect(result).toBe(expectedResponse);
  });

  it("should return 409 when email is duplicate", async () => {
    const body = { email: "test@example.com", password: "password123" };
    mockCreateEmployee.mockRejectedValue(
      new Error("Unique constraint failed on the fields: (`email`"),
    );
    const c = {
      req: {
        valid: vi.fn().mockReturnValue(body),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 409 }),
    } as unknown as any;

    const result = await createEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith(
      { error: "メールアドレスが既に使用されています" },
      409,
    );
    expect(result).toEqual({ status: 409 });
  });
});

describe("updateEmployeeController", () => {
  it("should return 200 with no body", async () => {
    const updateBody = { name: "Updated Name" };
    const expectedResponse = { status: 200 };
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: "emp-1" }),
        valid: vi.fn().mockReturnValue(updateBody),
      },
      body: vi.fn().mockReturnValue(expectedResponse),
      json: vi.fn(),
    } as unknown as any;

    const result = await updateEmployeeController(c, vi.fn());

    expect(c.req.param).toHaveBeenCalled();
    expect(c.req.valid).toHaveBeenCalledWith("json");
    expect(mockUpdateEmployeeService).toHaveBeenCalledWith("emp-1", updateBody);
    expect(c.body).toHaveBeenCalledWith(null, 200);
    expect(result).toBe(expectedResponse);
  });

  it("should return 404 when employee is not found", async () => {
    const updateBody = { name: "Updated Name" };
    mockUpdateEmployeeService.mockRejectedValue(new Error("NotFound"));
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: "emp-1" }),
        valid: vi.fn().mockReturnValue(updateBody),
      },
      body: vi.fn(),
      json: vi.fn().mockReturnValue({ status: 404 }),
    } as unknown as any;

    const result = await updateEmployeeController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith({ error: "社員が見つかりません" }, 404);
    expect(result).toEqual({ status: 404 });
  });
});

describe("getEmployeeDetailsController", () => {
  it("should return employee details with 200", async () => {
    const serviceResult = {
      employee_id: "emp-1",
      userId: "user-1",
      name: "山田太郎",
      furigana: "ヤマダタロウ",
      email: "test@example.com",
      birthDate: new Date("1990-01-01"),
      gender: Gender.MALE,
      phone: null,
      joinDate: null,
      trainingEndDate: null,
      studiedFrameworks: [
        {
          id: "esf-1",
          employeeId: "emp-1",
          frameworkId: "fw-1",
          framework: {
            framework_id: "fw-1",
            framework_name: "React",
            isDelete: false,
            creater_id: null,
            createAt: new Date("2026-01-01"),
            updater_id: null,
            updateAt: new Date("2026-01-01"),
          },
        },
      ],
      availableFrameworks: [
        {
          id: "eaf-1",
          employeeId: "emp-1",
          frameworkId: "fw-2",
          framework: {
            framework_id: "fw-2",
            framework_name: "Vue",
            isDelete: false,
            creater_id: null,
            createAt: new Date("2026-01-01"),
            updater_id: null,
            updateAt: new Date("2026-01-01"),
          },
        },
      ],
      previousCompany1Name: null,
      previousCompany1StartDate: null,
      previousCompany1EndDate: null,
      previousCompany2Name: null,
      previousCompany2StartDate: null,
      previousCompany2EndDate: null,
      previousCompany3Name: null,
      previousCompany3StartDate: null,
      previousCompany3EndDate: null,
      weeklyWorkHours: null,
      monthlyEstimatedSalary: null,
      postalCode: null,
      prefecture: null,
      city: null,
      streetAddress: null,
      emergencyContactName: null,
      emergencyContactRelationship: null,
      emergencyContactPhone: null,
      hasSpouse: null,
      hasChildren: null,
      hasDependents: null,
      myNumber: null,
      employmentInsuranceNumber: null,
      basicPensionNumber: null,
      salaryAccount: null,
      isDelete: false,
      creater_id: null,
      createAt: new Date("2026-01-01T00:00:00.000Z"),
      updater_id: null,
      updateAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const expectedDetails = {
      employee_id: "emp-1",
      userId: "user-1",
      name: "山田太郎",
      furigana: "ヤマダタロウ",
      email: "test@example.com",
      birthDate: "1990-01-01T00:00:00.000Z",
      gender: "MALE",
      phone: null,
      joinDate: null,
      trainingEndDate: null,
      studiedFrameworkIds: ["fw-1"],
      availableFrameworkIds: ["fw-2"],
      previousCompany1Name: null,
      previousCompany1StartDate: null,
      previousCompany1EndDate: null,
      previousCompany2Name: null,
      previousCompany2StartDate: null,
      previousCompany2EndDate: null,
      previousCompany3Name: null,
      previousCompany3StartDate: null,
      previousCompany3EndDate: null,
      weeklyWorkHours: null,
      monthlyEstimatedSalary: null,
      postalCode: null,
      prefecture: null,
      city: null,
      streetAddress: null,
      emergencyContactName: null,
      emergencyContactRelationship: null,
      emergencyContactPhone: null,
      hasSpouse: null,
      hasChildren: null,
      hasDependents: null,
      myNumber: null,
      employmentInsuranceNumber: null,
      basicPensionNumber: null,
      salaryAccount: null,
      isDelete: false,
      creater_id: null,
      createAt: "2026-01-01T00:00:00.000Z",
      updater_id: null,
      updateAt: "2026-01-01T00:00:00.000Z",
    };

    mockGetEmployeeDetailsService.mockResolvedValue(serviceResult);
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: "emp-1" }),
      },
      json: vi.fn().mockReturnValue({ status: 200 }),
    } as unknown as any;

    const result = await getEmployeeDetailsController(c, vi.fn());

    expect(c.req.param).toHaveBeenCalled();
    expect(mockGetEmployeeDetailsService).toHaveBeenCalledWith("emp-1");
    expect(c.json).toHaveBeenCalledWith(expectedDetails, 200);
    expect(result).toEqual({ status: 200 });
  });

  it("should return 404 when employee is not found", async () => {
    mockGetEmployeeDetailsService.mockResolvedValue(null);
    const c = {
      req: {
        param: vi.fn().mockReturnValue({ id: "emp-1" }),
      },
      json: vi.fn().mockReturnValue({ status: 404 }),
    } as unknown as any;

    const result = await getEmployeeDetailsController(c, vi.fn());

    expect(c.json).toHaveBeenCalledWith({ error: "社員が見つかりません" }, 404);
    expect(result).toEqual({ status: 404 });
  });
});
