// 権限の唯一の定義元。名称・ラベルを変更する場合はここだけを書き換える（idは配列の並び順＝権限の強い順）
export const ROLE_NAMES = [
  "admin",
  "system_admin",
  "sales",
  "mentor",
  "employee",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

export const ROLE_LABELS: Record<RoleName, string> = {
  admin: "管理者",
  system_admin: "システム管理者",
  sales: "営業担当",
  mentor: "メンター",
  employee: "一般社員",
};

// Roleマスタテーブルの行データ（idは1始まりで配列の並び順）
export const ROLES = ROLE_NAMES.map((name, index) => ({
  id: index + 1,
  name,
  label: ROLE_LABELS[name],
}));

// ロール名からRoleマスタのidを引くためのマップ（seed等でのマジックナンバー利用を避ける）
export const ROLE_ID: Record<RoleName, number> = Object.fromEntries(
  ROLES.map((role) => [role.name, role.id]),
) as Record<RoleName, number>;
