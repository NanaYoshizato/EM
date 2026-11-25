# フロント側（employee-management-system）対応事項

作成日: 2026-11-12
対象: `employee-management-system/frontend` の開発者

バックエンド側（本リポジトリ）で5ロール体制への対応・権限マトリクスの確定・単価改定履歴の実装を進めています。本ドキュメントは、それに伴いフロント側で対応が必要な事項を明確にするためのチェックリストです。詳細な背景・設計根拠は [frontend-gap-analysis.md](./frontend-gap-analysis.md)・[employee-field-and-api-design.md](./employee-field-and-api-design.md) を参照してください。

---

## 1. 今すぐ対応が必要（最優先）

バックエンドは既に`admin`/`system_admin`/`sales`/`mentor`/`employee`の5ロールで稼働しています。フロントの以下の箇所が3ロール(`admin`/`employee`/`sales`)のままのため、`system_admin`・`mentor`としてログインしたユーザーの表示・画面遷移が壊れます。

- [ ] `frontend/src/types/Member.ts`: `RoleVariant`型に`'system_admin'`・`'mentor'`を追加（5値化）
- [ ] `frontend/src/constants/messages.ts`: `messages.role`に`system_admin: 'システム管理者'`・`mentor: 'メンター'`を追加
  - ※ログインユーザー本人のバッジ（`UserBadge.tsx`）は既にバックエンドの`GET /me`の`roleLabel`を直接表示する実装になっているため対応不要。メンバー一覧・詳細画面（`MasterUserRow.tsx`・`ProfileCard.tsx`）側はまだ`messages.role`を参照しているため、ここへの追加が必須
- [ ] `frontend/src/utils/role.ts`: `ROLE_BADGE_BG_CLASS`に`system_admin`・`mentor`用のバッジ色を追加（**配色は未定義のため、デザイン側に確認してください**）

## 2. 権限マトリクス確定に伴う対応（権限マトリクスが確定済み・詳細は下記3章）

- [ ] `frontend/src/app/(auth)/master/layout.tsx`: 現在`role !== 'admin'`でアクセス制御している。`system_admin`も管理画面にアクセスできる仕様のため、ガード条件の見直しが必要（画面自体へのアクセスは許可しつつ、マイナンバー等の機密フィールドは3章の通りサーバー側で非表示にする設計）
- [ ] `frontend/src/app/(auth)/sales/layout.tsx`: 現在`role !== 'admin' && role !== 'sales'`でアクセス制御している。`mentor`に営業系画面へのアクセスを許可するかどうかは未定義（4章参照）
- [ ] メンバー一覧・詳細画面（`PersonalInfoCard.tsx`・`EmploymentInfoCard.tsx`等）: 現状は`isRestricted`という単一フラグで表示/非表示を切り替えているが、今後はAPIレスポンスの各フィールドが権限に応じて`null`で返ってくる設計に変わる。**「フィールドが`null`なら非表示にする」という表示ロジックへの統一が必要**（`isRestricted`フラグ自体に依存する実装をやめる）

## 3. バックエンドで確定した権限マトリクス（フロントの表示制御の前提知識）

閲覧者のロールによって、他の社員の情報がどこまで見えるかは以下の通り確定しています（自分自身の情報は常に全項目閲覧可能）。

| | 閲覧できる社員の範囲 | マイナンバー/給与口座/年金番号/雇用保険番号 | 緊急連絡先/住所(最寄駅含む)/電話番号 | 担当範囲外の社員 | 案件情報 |
|---|---|---|---|---|---|
| 管理者 | 全社員 | ○ | ○ | （全員が範囲内） | 全件 |
| システム管理者 | 全社員 | ✕ | ○ | （全員が範囲内） | 全件 |
| 営業 | 担当社員のみ | ✕ | ○ | 氏名・フリガナ・スキル・入社年月のみ | 全件 |
| メンター | 自身＋担当社員 | ✕ | ✕ | 氏名・フリガナ・スキル・入社年月のみ | 自身＋担当社員分 |
| 一般社員 | 自身のみ | ○（自身の分） | ○（自身の分） | 氏名・フリガナ・スキル・入社年月のみ | 自身のみ |

**重要**: 「担当範囲外の社員」であっても氏名・フリガナ・スキル・入社年月の4項目だけは誰でも閲覧可能です（一覧画面で全社員の一覧性を保つため）。メンバー一覧画面（`/members`）は、閲覧者の権限に応じて行ごとに表示できる項目が変わる可能性があることを踏まえた実装にしてください。

## 4. 未定義・今後の要件定義待ち（現時点では対応不要）

- メンター向けの専用画面（「自分が担当する社員の一覧」等）は、デザイン・要件定義がまだ存在しません。バックエンドには`ProjectAssignment.mentorId`で担当関係のデータは既に存在しますが、画面そのものが未設計です
- メンターが営業系画面（`/sales/*`）にアクセスできるかどうかは未定義
- 一般社員が他の社員の案件履歴等を閲覧できないことに伴う、画面上の表現（現状表示されている内容が今後出なくなる可能性がある箇所）の洗い出し

## 5. API側の対応状況（フロント実装への影響タイミング）

- **単価改定履歴**: フロントの案件履歴UI（`ProjectsTab.tsx`等）は、1つの案件に対して複数の契約単価（`contracts[]`）を持てる前提で既に実装されています。バックエンドのデータモデル（`ProjectAssignmentContract`テーブル）はこれに対応できる構造を追加済みです。**ただし`GET /employees/{id}`のレスポンスに`contracts`配列として返す対応（APIの配線）はまだ行っていません**。今しばらくは現状のモックまたは単一`contractPrice`ベースの暫定対応を継続してください
- **画面ごとに必要なレスポンス項目の拡張**（[employee-field-and-api-design.md](./employee-field-and-api-design.md) 2章に記載の各画面の必要項目）は、本ドキュメント執筆時点では**後追い対応**とします。フィールド単位の追加は都度このドキュメントまたは[employee-field-and-api-design.md](./employee-field-and-api-design.md)の更新でお知らせします
- 上記以外の未実装API（companies/news/skills/hearings/mail-formats/matching/notifications/projects(募集)/salesDashboard/dashboard統計）は引き続きMSWモックでの開発を継続してください（[frontend-gap-analysis.md](./frontend-gap-analysis.md) 4章参照）
