import { type RoleName } from "./roles";

export type Actor = {
    userId: number;
    role: RoleName;
    /** 本人かどうかの判定に使う（社員が紐づいていなければnull） */
    employeeId: number | null;
};

/**
 * 権限の範囲
 * all=○ 全員分 ／ assigned=△ 担当者のみ ／ own=自 自分のみ ／ none=× 不可
 */
export type Scope = "all" | "assigned" | "own" | "none";

// 社員情報の権限表を写したもの（1行＝表の1行）。「要確認」のマスは、決まるまで none にしている
const PERMISSION_TABLE = {
    "employee.create": { admin: "all", system_admin: "all", sales: "none", mentor: "none", employee: "none" },
    "employee.delete": { admin: "all", system_admin: "all", sales: "none", mentor: "none", employee: "none" },
    // 公開（一覧に出る項目）
    "employee.public.read": { admin: "all", system_admin: "all", sales: "none", mentor: "all", employee: "all" },
    "employee.public.write": { admin: "all", system_admin: "all", sales: "none", mentor: "none", employee: "none" },
    "employee.basic.read": { admin: "all", system_admin: "all", sales: "assigned", mentor: "assigned", employee: "own" },
    "employee.basic.write": { admin: "all", system_admin: "all", sales: "none", mentor: "none", employee: "none" },
    "employee.projects.read": { admin: "all", system_admin: "all", sales: "assigned", mentor: "assigned", employee: "own" },
    "employee.projects.write": { admin: "all", system_admin: "all", sales: "none", mentor: "none", employee: "none" },
    "employee.contact.read": { admin: "all", system_admin: "all", sales: "assigned", mentor: "none", employee: "own" },
    "employee.contact.write": { admin: "all", system_admin: "all", sales: "none", mentor: "none", employee: "none" },
    "employee.confidential.read": { admin: "all", system_admin: "none", sales: "none", mentor: "none", employee: "none" },
    "employee.confidential.write": { admin: "all", system_admin: "none", sales: "none", mentor: "none", employee: "none" },
} as const satisfies Record<string, Record<RoleName, Scope>>;

// 権限の一覧は、表の行（キー）から作る
export type Permission = keyof typeof PERMISSION_TABLE;

/** そのロールが、その権限をどの範囲で持っているか */
export const scopeOf = (role: RoleName, permission: Permission): Scope => PERMISSION_TABLE[permission][role];