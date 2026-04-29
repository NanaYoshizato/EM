import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("@/lib/prisma", () => ({
  prisma: {
    $transaction: vi.fn(),
  },
}));

vi.mock("bcrypt", () => ({
  default: {
    hash: vi.fn().mockResolvedValue("hashed_password"),
  },
}));

import { createEmployeeWithUser } from "../repository";
import { prisma } from "@/lib/prisma";

const mockTransaction = vi.mocked(prisma.$transaction);

const baseInput = {
  email: "test@example.com",
  password: "password123",
  birthday: "1990-01-01",
  gender: "male",
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("createEmployeeWithUser", () => {
  it("トランザクション内でUser+Employeeを作成する", async () => {
    const expected = { userId: "user-1", employeeId: "emp-1" };
    mockTransaction.mockResolvedValue(expected);

    const result = await createEmployeeWithUser(baseInput);

    expect(mockTransaction).toHaveBeenCalledOnce();
    expect(result).toEqual(expected);
  });

  it("トランザクションが失敗した場合エラーを投げる", async () => {
    mockTransaction.mockRejectedValue(new Error("DB error"));

    await expect(createEmployeeWithUser(baseInput)).rejects.toThrow("DB error");
  });
});
