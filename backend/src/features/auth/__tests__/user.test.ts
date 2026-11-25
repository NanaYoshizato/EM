import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("../repository", () => ({ findUserByFirebaseUid: vi.fn() }));

import { User } from "../domain/user";
import { findUserByFirebaseUid } from "../repository";

const mockFind = vi.mocked(findUserByFirebaseUid);

const row = {
  id: 1,
  email: "test@example.com",
  firebaseUid: "uid-1",
  isDelete: false,
  roleId: 5,
  role: { id: 5, name: "employee", label: "一般社員" },
};

beforeEach(() => {
  vi.clearAllMocks();
});

describe("User.findByFirebaseUid — 紐づく社員のid", () => {
  it("社員が紐づいていれば、そのidを持つ", async () => {
    mockFind.mockResolvedValue({ ...row, employee: { id: 7, isDelete: false } } as never);

    expect((await User.findByFirebaseUid("uid-1"))?.employeeId).toBe(7);
  });

  it.each([
    ["社員が紐づいていない", null],
    ["社員が論理削除済み", { id: 7, isDelete: true }],
  ])("%s場合はnull", async (_, employee) => {
    mockFind.mockResolvedValue({ ...row, employee } as never);

    expect((await User.findByFirebaseUid("uid-1"))?.employeeId).toBeNull();
  });
});
