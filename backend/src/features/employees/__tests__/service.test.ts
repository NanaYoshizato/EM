import { describe, it, expect, vi, beforeEach } from "vitest";
import { createEmployee } from "../service";

vi.mock("../repository", () => ({
  createEmployeeWithUser: vi.fn(),
}));

import { createEmployeeWithUser } from "../repository";

const mockCreateEmployeeWithUser = vi.mocked(createEmployeeWithUser);

const baseInput = {
  email: "test@example.com",
  password: "password123",
  birthday: "1990-01-01",
  gender: "male",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEmployee", () => {
  it("正常に社員とユーザーを作成する", async () => {
    const expected = { userId: "user-1", employeeId: "emp-1" };
    mockCreateEmployeeWithUser.mockResolvedValue(expected);

    const result = await createEmployee(baseInput);

    expect(mockCreateEmployeeWithUser).toHaveBeenCalledWith(baseInput);
    expect(result).toEqual(expected);
  });

  it("メールアドレス重複時にエラーを投げる", async () => {
    mockCreateEmployeeWithUser.mockRejectedValue(
      new Error("Unique constraint failed on the fields: (`email`)"),
    );

    await expect(createEmployee(baseInput)).rejects.toThrow("Unique constraint");
  });

  it("フレームワーク情報を含めて登録できる", async () => {
    const input = {
      ...baseInput,
      studiedFrameworkIds: ["fw-1", "fw-2"],
      availableFrameworkIds: ["fw-3"],
    };
    const expected = { userId: "user-2", employeeId: "emp-2" };
    mockCreateEmployeeWithUser.mockResolvedValue(expected);

    const result = await createEmployee(input);

    expect(mockCreateEmployeeWithUser).toHaveBeenCalledWith(input);
    expect(result).toEqual(expected);
  });

  it("オプションフィールドなしで登録できる", async () => {
    const expected = { userId: "user-3", employeeId: "emp-3" };
    mockCreateEmployeeWithUser.mockResolvedValue(expected);

    const result = await createEmployee(baseInput);

    expect(result).toEqual(expected);
  });
});
