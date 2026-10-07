-- Seed additional role master data (システム管理者: 保守側の権限で、管理者とは異なりマイナンバー等の機密情報は閲覧不可とする想定 / メンター)
INSERT INTO "role" ("id", "name", "label", "updated_at") VALUES
  (4, 'system_admin', 'システム管理者', CURRENT_TIMESTAMP),
  (5, 'mentor', 'メンター', CURRENT_TIMESTAMP);
