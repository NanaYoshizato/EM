# 社員情報フィールド統合・API設計・5権限対応 検討資料

調査日: 2026-10-09
前提: [frontend-gap-analysis.md](./frontend-gap-analysis.md) の続き。今回は「フロント・バックエンドどちらの項目も採用する」「レイアウトはフロント優先」「権限はバックエンドの5権限を採用」という方針に基づき、具体的なフィールド一覧・API設計・フロント対応事項を洗い出す。

---

## 1. 社員情報 統合フィールド一覧

フロント（`memberBasicInfoSchema.ts`・`MemberDetail.ts`・各画面コンポーネント）とバックエンド（`prisma/schema.prisma`の`Employee`モデル）の両方の項目を採用する前提で統合。

凡例: ✅=双方に存在（そのまま採用）／🆕F=フロントのみ（バックエンドに追加が必要）／🆕B=バックエンドのみ（フロント画面に追加が必要）／⚠️=双方にあるが型・構造が不一致（要調整）

### 1.1 基本情報

| フィールド | 日本語ラベル | フロント | バックエンド(`Employee`) | 状態 | 備考 |
|---|---|---|---|---|---|
| employeeCode | 社員コード | ✓ | `employeeCode` | ✅ | |
| name | 氏名 | ✓ | `name` | ✅ | |
| furigana | フリガナ | ✓ | `furigana` | ✅ | |
| imageUrl | — | ✓(一覧のみ) | なし | 🆕F | アバター画像。backendにファイル格納先が無い。詳細画面では頭文字アイコンで代替しているため**優先度低** |
| specialty | 専門領域(fe/be/undecided) | ✓ | なし | 🆕F | backendに対応カラムが無い。新規追加が必要（enumまたはString） |
| status | 稼働状況(WORKING等) | ✓（社員の属性として扱っている） | `ProjectAssignment.status` | ⚠️ | backendでは**案件アサイン単位**のステータス。フロントは社員の属性として1つだけ表示している＝「現在の（最新の）アサインのstatus」をAPI側で算出して返す必要がある |
| joinDate | 入社年月 | ✓ | `joinDate` | ✅ | |
| gender | 性別 | ✓(`male/female/other`) | `gender`(`MALE/FEMALE/OTHER`) | ⚠️ | 値の大文字小文字のみ差異。API側で変換 |
| gitHub | GitHub | ✓ | なし | 🆕F | 新規カラム追加が必要 |
| pastProjectCount | 参画案件数 | ✓(表示のみ) | なし(算出可能) | 🆕F | `ProjectAssignment`件数から算出して返す。カラム追加不要 |
| frameworks（一覧カードのタグ） | 主要スキル | ✓(一覧のみ) | `EmployeeAvailableFramework`等 | ⚠️ | 下記1.5「スキル」参照。構造自体が不一致 |
| contractPrice（一覧カードの単価表示） | — | ✓(一覧のみ) | `ProjectAssignment.contractPrice` | ⚠️ | 案件アサイン単位。「現在の」アサインの値を返す想定 |
| role | 権限 | ✓ | `User.roleId`→`Role` | ⚠️ | `Employee`ではなく`User`側の項目。5値化により`RoleVariant`の値が食い違う（4章参照） |
| （新規）nearestStation | 最寄駅 | なし | `nearestStation` | 🆕B | フロントの住所セクションに項目追加が必要 |

### 1.2 就業情報

| フィールド | 日本語ラベル | フロント | バックエンド | 状態 |
|---|---|---|---|---|
| trainingEndDate | 研修終了日 | ✓ | `trainingEndDate` | ✅ |
| weeklyWorkHours | 週あたり稼働時間 | ✓ | `weeklyWorkHours` | ✅ |
| monthlyEstimatedSalary | 月額想定給与 | ✓ | `monthlyEstimatedSalary` | ✅ |

### 1.3 個人情報（連絡先・住所・緊急連絡先・家族）

| フィールド | 日本語ラベル | フロント | バックエンド | 状態 |
|---|---|---|---|---|
| email | メールアドレス | ✓ | `email` | ✅ |
| phone | 電話番号 | ✓ | `phone` | ✅ |
| birthDate | 生年月日 | ✓ | `birthDate` | ✅ |
| postalCode | 郵便番号 | ✓ | `postalCode` | ✅ |
| prefecture | 都道府県 | ✓ | `prefecture` | ✅ |
| city | 市区町村 | ✓ | `city` | ✅ |
| streetAddress | 番地以降の住所 | ✓ | `streetAddress` | ✅ |
| nearestStation | 最寄駅 | — | `nearestStation` | 🆕B（1.1参照） |
| emergencyContactName | 緊急連絡先氏名 | ✓ | `emergencyContactName` | ✅ |
| emergencyContactRelationship | 続柄 | ✓ | `emergencyContactRelationship` | ✅ |
| emergencyContactPhone | 緊急連絡先電話番号 | ✓ | `emergencyContactPhone` | ✅ |
| hasSpouse | 配偶者の有無 | ✓(bool/'有'無') | `hasSpouse`(Boolean) | ⚠️ | GET時bool・POST/PATCH時'有'/'無'文字列というフロント側の非対称仕様。API側で変換するか、フロントをbooleanに統一するか要調整 |
| hasChildren | 子の有無 | ✓ | `hasChildren` | ⚠️ | 同上 |
| hasDependents | 扶養家族の有無 | ✓ | `hasDependents` | ⚠️ | 同上 |

### 1.4 行政・支払情報（機密・要権限制御）

| フィールド | 日本語ラベル | フロント | バックエンド | 状態 |
|---|---|---|---|---|
| myNumber | マイナンバー | ✓(マスク表示+開閉) | `myNumber`(unique) | ✅ |
| employmentInsuranceNumber | 雇用保険番号 | ✓ | `employmentInsuranceNumber` | ✅ |
| basicPensionNumber | 基礎年金番号 | ✓ | `basicPensionNumber` | ✅ |
| salaryAccount | 給与振込口座 | ✓ | `salaryAccount` | ✅ |

→ これら4項目が、今回の権限整理（システム管理者は閲覧不可）の対象候補。詳細は3章。

### 1.5 前職情報

| フィールド | フロント | バックエンド | 状態 |
|---|---|---|---|
| previousCompany{1,2,3}Name / StartDate / EndDate（計9項目） | ✓ | ✓（同じ3枠固定構成） | ✅ **完全一致** |

フロントのコメントに「バックエンドのDBカラム構成に合わせ最大3社固定」とある通り、既に設計が揃っている。変更不要。

### 1.6 スキル（⚠️要設計：構造自体が不一致）

| 項目 | フロントの構造 | バックエンドの構造 |
|---|---|---|
| スキル名 | スキルマスタ(`Skill.label`)参照 | `Framework.frameworkName` |
| カテゴリ | `language/library/framework/cloud/other` | なし |
| 経験年数 | `skillSet.skills[].value`(0〜50) | なし（`EmployeeStudiedFramework`/`EmployeeAvailableFramework`は研修中/利用可能の2値フラグのみ） |

**対応方針の検討が必要**: バックエンドの`Framework`マスタ＋2つの中間テーブルは、フロントが要求する「スキルごとの経験年数」を表現できない。以下のいずれかの対応が必要:
- (a) `EmployeeAvailableFramework`に`experienceYears`カラムを追加し、`Framework`に`category`カラムを追加して、フロントの`skillSet`仕様に合わせる
- (b) 全く新しい`Skill`マスタ＋`EmployeeSkill`中間テーブル（experienceYears付き）を新設し、既存の`Framework`系は案件（Project）の使用技術管理専用として残す（案件アサイン側の`ProjectFramework`/`ProjectAssignmentFramework`は現状のままでも案件管理としては機能するため）

どちらを取るかは設計判断が必要。（b）の方が既存の案件アサイン機能に影響を与えず安全。

### 1.7 案件履歴（契約単価の履歴構造 ✅ 対応済み）

| フロント | バックエンド | 状態 |
|---|---|---|
| `projects[].projectName` | `Project.name` | ✅ |
| `projects[].factory`(会社名) | `Project.clientCompanyName` | ✅ |
| `projects[].skills[]` | `ProjectAssignmentFramework`→`Framework` | ⚠️（1.6のスキル構造不一致を引き継ぐ） |
| `projects[].startDate` | `ProjectAssignment.startDate` | ✅ |
| `projects[].contracts[].startDate`/`unitPrice`（**配列＝単価改定履歴を持てる構造**） | `ProjectAssignmentContract`（`projectAssignmentId`/`startDate`/`unitPrice`の子テーブル。新設・マイグレーション適用済み） | ✅ **データモデルは対応済み**。既存の`ProjectAssignment.contractPrice`（単一値、最新単価のデノーマライズ用途として存続）は後方互換のため残している。**ただしAPIレスポンス（`GET /employees/{id}`）に`contracts`配列として返す配線は未実装**（2章の通り後追い対応） |
| — | `ProjectAssignment.excessUnitPrice` / `deductionUnitPrice` / `remarks` / `mentorId` | 🆕B | 現状どのフロント画面にも表示されていない。社員の案件履歴表示には不要そうだが、営業側の案件詳細画面等で使う想定か確認が必要 |

### 1.8 スキルシート

| フィールド | フロント | バックエンド | 状態 |
|---|---|---|---|
| fileName / fileUrl / fileSize / updateDate | ✓ | なし | 🆕F | ファイルアップロード先（GCS等）とそのメタ情報を持つテーブルが必要。新規実装 |

---

## 2. レイアウト＝フロント優先で、画面ごとに必要なAPIレスポンス項目

> **ステータス（2026-11-12時点）**: 本章の内容は洗い出しのみ完了しており、実際のAPIレスポンス拡張（コントローラー・リポジトリの実装）は**後追い対応**とする。今回実装したのは1.7節の契約単価履歴のデータモデル（`ProjectAssignmentContract`）のみ。フロント側に今すぐ対応してほしい事項は [frontend-action-items.md](./frontend-action-items.md) にまとめている。

フロントの画面構成（`frontend/src/app/`）を正として、各画面が必要とするレスポンス項目を洗い出す。

### 2.1 メンバー一覧（`/members`）・ユーザーマスタ一覧（`/master/user`）→ `GET /employees`

一覧カード（`types/Member.ts`）に必要な項目:
```
employeeCode, name, furigana, imageUrl, role, specialty, status,
joinDate, frameworks[], contractPrice
```
検索・絞り込み用クエリパラメータ（現状の実装に不足。`frontend/src/lib/api/members/getMembers.ts`が送っている想定のパラメータ）:
```
employeeCode, name（既存）, specialtyFilter, workStatusFilter, skillsFilter, sort, page/limit（未実装）
```

### 2.2 メンバー詳細（`/members/{employeeCode}`）・マイプロフィール（`/profile`）・ユーザーマスタ詳細（`/master/user/{employeeCode}`）→ `GET /employees/{id}`

共通のレスポンス形（権限によって一部が`null`になる想定。3章参照）:
```
basicInformation: {
  employeeCode, name, furigana, role, specialty, status, joinDate, gitHub, pastProjectCount,
  // 就業情報
  trainingEndDate, weeklyWorkHours, monthlyEstimatedSalary,
  // 個人情報
  email, phone, birthDate, gender,
  postalCode, prefecture, city, streetAddress, nearestStation,
  emergencyContactName, emergencyContactRelationship, emergencyContactPhone,
  hasSpouse, hasChildren, hasDependents,
  // 行政・支払情報（機密。3章の権限制御対象）
  myNumber, employmentInsuranceNumber, basicPensionNumber, salaryAccount,
  // 前職情報
  previousCompany1Name, previousCompany1StartDate, previousCompany1EndDate,
  previousCompany2Name, previousCompany2StartDate, previousCompany2EndDate,
  previousCompany3Name, previousCompany3StartDate, previousCompany3EndDate,
},
skillSet: { maxValue, skills: [{ skillId, name, value }] },
projects: [{ id, active, projectName, factory, skills[], startDate, contracts: [{ startDate, unitPrice }] }] | null,
skillSheet: { fileName, fileUrl, fileSize, updateDate } | null,
isRestricted: boolean,
```

### 2.3 ユーザーマスタ新規作成（`/master/user/create`）→ `POST /employees`

現状フロントのcreate画面はgitHub・前職情報を送っていないが、1章の統合方針に従うならcreate画面にもこれらの入力欄を追加できるようにしておくのが望ましい（必須ではなく任意項目として）。リクエストボディは基本的に2.2のbasicInformation相当（id・算出項目を除く）。

### 2.4 ユーザーマスタ編集・プロフィール編集 → `PATCH /employees/{id}`

2.2と同じ項目を部分更新。`hasSpouse`等は前述の bool/'有''無' 変換に注意。

### 2.5 ユーザーマスタ削除 → `DELETE /employees/{id}`

現状ルート未登録（要確認・実装）。

### 2.6 スキルシートアップロード → 新規API（例: `POST /employees/{id}/skill-sheet`）

ファイルアップロード＋メタデータ保存。新規実装（1.8参照）。

---

## 3. 必要なAPI一覧（まとめ）

| # | メソッド/パス | 用途 | 現状 |
|---|---|---|---|
| 1 | `GET /employees` | 一覧取得（検索・絞り込み・ページネーション） | 実装済みだが検索条件が不足 |
| 2 | `GET /employees/{id}` | 詳細取得（権限によりフィールドをnull化） | 実装済みだが権限制御が無い（4章） |
| 3 | `POST /employees` | 新規作成 | 実装済み（項目拡張の余地あり） |
| 4 | `PATCH /employees/{id}` | 更新 | 実装済み（項目拡張の余地あり） |
| 5 | `DELETE /employees/{id}` | 削除 | 未確認・おそらく未実装 |
| 6 | `POST /employees/{id}/skill-sheet` | スキルシートアップロード | 未実装（新規） |
| 7 | `GET /skills`（他、スキルマスタCRUD） | スキルマスタ取得（プルダウン用） | 未実装（[frontend-gap-analysis.md](./frontend-gap-analysis.md)で既出） |

社員情報まわりは **既存4API（1〜4）の項目拡張＋削除API（5）の実装確認＋スキルシート用の新規API（6）＋スキルマスタ（7、別件）** で対応可能。新規リソース追加というより、既存`employees`機能の拡張が中心になる見込み。

---

## 4. 権限（バックエンドの5権限を採用）に伴う、フロント側の対応事項

バックエンドの`src/constants/roles.ts`（`admin` / `system_admin` / `sales` / `mentor` / `employee`）を正とする前提で、フロントが対応すべき変更点を洗い出す。

### 4.1 型定義

- `frontend/src/types/Member.ts`: `RoleVariant = 'admin' | 'employee' | 'sales'` に `'system_admin' | 'mentor'` を追加（5値化）

### 4.2 表示ラベル・バッジ色

- `frontend/src/constants/messages.ts`: `messages.role`（現状`admin`/`employee`/`sales`の3つ）に`system_admin: 'システム管理者'`, `mentor: 'メンター'`を追加
  - ※ログインユーザー本人のバッジ（`UserBadge.tsx`）は既にバックエンドの`roleLabel`を直接使うよう対応済みだが、メンバー一覧・詳細（`MasterUserRow.tsx`・`ProfileCard.tsx`）は`messages.role`をまだ使っているため、ここに追加しないと`system_admin`/`mentor`のメンバーの行・詳細表示が崩れる
- `frontend/src/utils/role.ts`: `ROLE_BADGE_BG_CLASS`（現状3色のみ定義）に`system_admin`・`mentor`用の色を追加（**デザイン未定義のため要デザイン確認**）

### 4.3 画面アクセス制御（ガード）の見直し

- `frontend/src/app/(auth)/master/layout.tsx`: 現在`role !== 'admin'`で弾いている。システム管理者に管理画面へのアクセスを許可するかどうか要決定（許可する場合は`role !== 'admin' && role !== 'system_admin'`に変更。許可した上でマイナンバー等だけサーバー側でnull化する設計が[frontend-gap-analysis.md](./frontend-gap-analysis.md)3章の方針と整合）
- `frontend/src/app/(auth)/sales/layout.tsx`: 現在`role !== 'admin' && role !== 'sales'`で弾いている。メンターに営業系画面へのアクセスを許可するか要決定

### 4.4 メンター向け画面の要件定義（未着手）

- デザイン・設計書（`docs/README.md`・HTMLモック）のどちらにもメンター向け画面が存在しない。バックエンドには`ProjectAssignment.mentorId`が既に実装されているため、「自分がメンターを担当している社員の一覧」のような画面が今後必要になる可能性が高いが、現時点では画面要件そのものが未定義。別途要件定義が必要

### 4.5 フィールドレベルの表示制御ロジックの見直し

- `PersonalInfoCard.tsx`・`EmploymentInfoCard.tsx`: 現状は`isRestricted`（本人/営業/管理者以外を制限）のみで出し分けているが、今後は「システム管理者はadmin相当のisRestricted判定を通過しても、マイナンバー等の特定フィールドだけ見れない」という**ロールとフィールドの組み合わせ**によるきめ細かい制御が必要になる。現状の`isRestricted`という単一フラグでは表現できないため、レスポンス側で該当フィールドを`null`で返す設計（3章参照）に合わせて、フロントも「フィールドが`null`なら非表示」という表示ロジックへの統一が必要
- `MasterUserCreateScreen.tsx`・編集画面: システム管理者が社員を新規作成・編集する際、マイナンバー等の入力欄をどう扱うか（非表示にする／入力不可にする等）を決める必要がある

### 4.6 優先度の提案

1. まず4.1〜4.2（型・ラベル追加）を対応しないと、`system_admin`/`mentor`ユーザーの表示が壊れる（最優先・影響範囲小）
2. 4.3（画面ガード）はバックエンドの権限マトリクス確定後に対応
3. 4.4（メンター画面要件）・4.5（フィールド単位の表示制御）は設計検討が先に必要なため、要件定義フェーズを別途設ける

---

## 5. 権限マトリクス（確定仕様 v2）

[frontend-gap-analysis.md](./frontend-gap-analysis.md) 3.3節で「？」としていた部分について指示を受け、以下の通り確定した（v1からの変更点: 雇用保険番号の扱い・システム管理者の案件情報・メンターの住所範囲・「担当外」社員への最低限の公開範囲を確定）。

### 5.1 大前提（既存ドキュメントから変更なし）

「本人かどうか」はロールと独立した軸であり、**どのロールであっても自分自身の情報は常に全項目閲覧可能**（以下の制限は「他人の情報を見るとき」の制限であり、自分自身には適用されない）。

### 5.2 「担当外」の社員に対する最低限の公開範囲（全ロール共通の新ルール）

一般社員・メンター・営業は、自身の担当範囲外の社員について「一切閲覧不可」ではなく、**以下の4項目のみ閲覧可能**（それ以外は非表示）:

- `name`（氏名）
- `furigana`（フリガナ）
- `skillSet`（スキル）
- `joinDate`（入社年月）

これは一覧画面で「誰がどんなスキルを持つ社員か」を全社員が把握できるようにするための最低限の公開情報であり、管理者・システム管理者（常に全社員が対象範囲）には影響しない。

### 5.3 ロール別ポリシー

#### 管理者（＝社長）
- 全社員の全情報を閲覧可能。制限なし。
- 案件情報も全件閲覧可能。

#### システム管理者（システム保守担当者）
- 全社員を閲覧可能（範囲は管理者と同じ＝絞り込みなし）
- ただし以下の社員情報フィールドは閲覧不可:
  - `myNumber`（マイナンバー）
  - `salaryAccount`（給与口座）
  - `basicPensionNumber`（年金番号）
  - `employmentInsuranceNumber`（雇用保険番号）
- 案件情報は**全件**閲覧可能

#### 営業（SESの案件営業）
- **自身が担当する社員**は全項目閲覧可能（下記機密4項目を除く）
- 担当外の社員は5.2の4項目のみ閲覧可能
- 担当社員について、以下のフィールドは閲覧不可:
  - `myNumber`（マイナンバー）
  - `salaryAccount`（給与口座）
  - `basicPensionNumber`（年金番号）
  - `employmentInsuranceNumber`（雇用保険番号）
- 案件情報（`Project`/`ProjectAssignment`）は**全件**閲覧可能（社員情報と異なり、案件側は担当スコープの制限を受けない）

#### メンター
- 自身の情報は全て閲覧可能（5.1の原則通り）
- **自身が担当する社員**（＝`ProjectAssignment.mentorId`が自分であるアサインの社員）は、下記の制限フィールドを除き閲覧可能
- 担当外の社員は5.2の4項目のみ閲覧可能
- 担当社員について、以下のフィールドは閲覧不可（営業より制限対象が広い）:
  - `myNumber`（マイナンバー）
  - `salaryAccount`（給与口座）
  - `basicPensionNumber`（年金番号）
  - `employmentInsuranceNumber`（雇用保険番号）
  - `emergencyContactName` / `emergencyContactRelationship` / `emergencyContactPhone`（緊急連絡先）
  - `postalCode` / `prefecture` / `city` / `streetAddress` / `nearestStation`（住所。最寄駅も含む）
  - `phone`（電話番号）
- 案件情報は「自身の案件」＋「自身が担当する社員の案件」のみ閲覧可能（営業と異なり全件ではない）

#### 一般社員
- 自身の情報は全て閲覧可能
- 自身の案件情報は全て閲覧可能
- 自分以外の社員（＝担当範囲という概念を持たないロールのため、実質「全員が担当外」）は5.2の4項目のみ閲覧可能
- 他の社員の案件情報は閲覧不可

### 5.4 まとめ表

| | 担当範囲内の社員情報 | 機密4項目(マイナンバー/給与口座/年金番号/雇用保険番号) | 緊急連絡先/住所(最寄駅含む)/電話番号 | 担当範囲外の社員情報 | 案件情報の閲覧範囲 |
|---|---|---|---|---|---|
| 管理者 | 全社員・制限なし | ○ | ○ | （該当なし＝全員が範囲内） | 全件 |
| システム管理者 | 全社員 | ✕ | ○ | （該当なし＝全員が範囲内） | 全件 |
| 営業 | 担当社員 | ✕ | ○ | 氏名・フリガナ・スキル・入社年月のみ | 全件 |
| メンター | 自身＋担当社員 | ✕ | ✕ | 氏名・フリガナ・スキル・入社年月のみ | 自身＋担当社員分 |
| 一般社員 | 自身のみ | ○（自身の分） | ○（自身の分） | 氏名・フリガナ・スキル・入社年月のみ | 自身のみ |

### 5.5 この仕様を実現するために必要なデータモデル・実装上の対応

1. **「営業が担当する社員」を表す関係はテーブル新設が必要（確定）** — メンターは`ProjectAssignment.mentorId`で担当関係を表現できるが、営業担当者と社員・案件を紐付けるカラム・テーブルが現状どこにも無い。`Project`に営業担当者（例: `salesOwnerId`、`User`への外部キー）を追加し、「そのProjectにアサインされている社員＝その営業担当者が担当する社員」として算出する設計を想定（詳細な実装設計は別タスクとする）
2. **認可ミドルウェアの実装**が前提（[frontend-gap-analysis.md](./frontend-gap-analysis.md) 3.2節）。ログインユーザーの`role`・`id`を元に、上記マトリクスに従って「閲覧対象社員の範囲フィルタ」「担当内/担当外に応じたレスポンスのフィールド出し分け（機密4項目null化・担当外は4項目のみ返却）」の両方を行う共通ロジックが必要
3. 一般社員が「他の社員の基本情報・スキルセットを閲覧できる」という`docs/README.md` B2の既存記載は、5.2により「氏名・フリガナ・スキル・入社年月のみ」に**範囲が縮小される**形で確定。`docs/README.md`側の該当記載も合わせて更新が必要
