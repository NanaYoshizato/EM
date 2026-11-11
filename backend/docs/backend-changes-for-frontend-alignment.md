# フロント画面に合わせて必要なバックエンド変更（API・テーブル構成）洗い出し

作成日: 2026-11-12
対象: バックエンド開発者（本リポジトリ）
前提: [employee-field-and-api-design.md](./employee-field-and-api-design.md)・[frontend-gap-analysis.md](./frontend-gap-analysis.md) の内容を、「フロントの画面・項目に合わせてバックエンドのAPI・テーブルをどう変更するか」という実装観点で再整理したもの。方針は「レイアウト＝フロント優先」（[employee-field-and-api-design.md](./employee-field-and-api-design.md) 冒頭の指示通り）。

---

## 1. 新規テーブルが必要なもの

### 1.1 スキルマスタ＋経験年数（最優先）

フロントの`skillSet`は「スキル名＋カテゴリ＋経験年数」を社員ごとに持つ構造だが、現状の`Framework`＋`EmployeeStudiedFramework`/`EmployeeAvailableFramework`は「研修中/利用可能」の2値フラグのみで経験年数・カテゴリを持てない。

新設案:
```prisma
model Skill {
  id       Int      @id @default(autoincrement())
  name     String   @unique @map("name")
  category String   @map("category") // language / library / framework / cloud / other
  // 既存Frameworkと同様の監査カラム
}

model EmployeeSkill {
  id             Int      @id @default(autoincrement())
  employeeId     Int      @map("employee_id")
  skillId        Int      @map("skill_id")
  experienceYears Int     @map("experience_years")
  // 既存の中間テーブルと同様の監査カラム
  @@unique([employeeId, skillId])
}
```
既存の`Framework`系（案件で使用する技術の管理用）はそのまま残し、社員個人のスキルセットとは別テーブルとして扱う（案件アサイン機能への影響を避けるため）。

### 1.2 スキルシート（ファイルメタ情報）

フロントの`skillSheet: { fileName, fileUrl, fileSize, updateDate }`に対応するテーブルが無い。

```prisma
model EmployeeSkillSheet {
  id         Int      @id @default(autoincrement())
  employeeId Int      @unique @map("employee_id")
  fileName   String   @map("file_name")
  fileUrl    String   @map("file_url") // GCS等のファイル格納先URL
  fileSize   String   @map("file_size")
  // 既存の監査カラム(updatedAtがそのままupdateDateに相当)
}
```
ファイル実体の格納先（GCS/S3等）は別途選定が必要。

### 1.3 「営業が担当する社員」を表す関係（権限マトリクス実装の前提・確定事項）

[employee-field-and-api-design.md](./employee-field-and-api-design.md) 5.5節で確定済み。`Project`に営業担当者を追加する:
```prisma
model Project {
  // ...既存フィールド
  salesOwnerId Int?  @map("sales_owner_id")
  salesOwner   User? @relation(fields: [salesOwnerId], references: [id])
}
```
「営業担当者が担当する社員」＝「`salesOwnerId`が自分であるProjectに、`ProjectAssignment`でアサインされている社員」として算出する。

### 1.4 その他未実装リソース（社員情報と直接関係しないため優先度は別途判断）

[frontend-gap-analysis.md](./frontend-gap-analysis.md) 4章に記載の`companies`/`news`/`hearings`/`mail_prompts`/`matching`/`notifications`/`read_states`/`projects(募集中求人)`/`sales_dashboard`系テーブルは、社員情報とは独立した機能のため、本ドキュメントでは一覧のみ記載し詳細設計は別タスクとする。

---

## 2. 既存テーブルへのカラム追加

`Employee`テーブルに以下を追加（フロントにのみ存在し、バックエンドに対応カラムが無いもの）:

| カラム名 | 型 | 用途 |
|---|---|---|
| `specialty` | `Specialty` enum (`FE`/`BE`/`UNDECIDED`) または `String?` | 専門領域。フロントのフィルタ条件（`specialtyFilter`）でも使用するためenum推奨 |
| `gitHub` | `String?` | GitHubハンドル |
| `imageUrl` | `String?` | アバター画像URL（優先度低。詳細画面では頭文字アイコンで代替中のため必須ではない） |

---

## 3. 既存カラムのAPI層での変換が必要なもの

`hasSpouse` / `hasChildren` / `hasDependents`（`Employee`テーブルは`Boolean?`）について、フロントは次の非対称な契約で実装済み:
- `GET`時: `boolean`
- `POST`/`PATCH`時: `'有'` / `'無'`の文字列リテラル

**バックエンド側のコントローラー層で変換を吸収する**（フロントを変更させない）:
- レスポンス生成時: `Boolean` → そのまま返す
- リクエスト受信時: `'有'` → `true`、`'無'` → `false`に変換してからDBに保存

---

## 4. 既存APIの拡張

### 4.1 `GET /employees`（一覧）

現状`employeeCode`/`name`の部分一致検索のみ。フロントの`getMembers.ts`が送る想定のパラメータに合わせて追加が必要:

| パラメータ | 用途 |
|---|---|
| `specialtyFilter` | 専門領域での絞り込み（2章のenum追加が前提） |
| `workStatusFilter` | 稼働ステータスでの絞り込み |
| `skillsFilter` | スキルでの絞り込み（1.1のSkillモデル追加が前提） |
| `sort` | 入社年月でのソート |
| `page` / `limit`（または`cursor`） | ページネーション |

また、5章の権限マトリクスに基づき、閲覧者のロール・担当範囲によって返す社員の範囲・項目が変わる点は5章参照。

### 4.2 `GET /employees/{id}`（詳細）

1章・2章で追加したテーブル・カラムを踏まえ、レスポンスに以下を追加:
- `basicInformation.specialty` / `.gitHub` / `.pastProjectCount`（`ProjectAssignment`件数から算出）
- `basicInformation.role`（`Employee.userId`→`User.roleId`→`Role.name`をjoinして取得。現状`Employee`の取得クエリに`User`/`Role`のjoinが含まれていない）
- `skillSet`: 新設の`EmployeeSkill`→`Skill`から構築（`maxValue`は運用上の固定値か、スキルマスタ側に持たせるか要検討）
- `projects[]`: `ProjectAssignment`→`Project`をjoinし、`contracts[]`は新設済みの`ProjectAssignmentContract`から構築（データモデルは実装済み。本APIへの配線は本対応に含める）
- `skillSheet`: 新設の`EmployeeSkillSheet`から構築（無ければ`null`）
- `isRestricted`・各フィールドのnull化: 5章の権限マトリクスに従う（要認可ミドルウェア）

### 4.3 `POST /employees` / `PATCH /employees/{id}`

- 2章で追加したカラム（`specialty`/`gitHub`）の受け入れ
- 3章の`hasSpouse`等の変換
- `skillSet`（`EmployeeSkill`のcreate/update/delete）の受け入れ
- `previousCompany1-3`は既存のまま変更不要（[employee-field-and-api-design.md](./employee-field-and-api-design.md) 1.5節で完全一致を確認済み）

### 4.4 `DELETE /employees/{id}`

フロント（`deleteMember.ts`）は呼び出しているが、`routes.ts`にルート登録が見当たらない。実装有無を確認し、未実装なら追加する。

### 4.5 新規: スキルシートアップロード

`POST /employees/{id}/skill-sheet`（仮）。ファイルを受け取り、1.2の`EmployeeSkillSheet`に保存する。ファイルストレージの選定が前提。

### 4.6 新規: スキルマスタCRUD

`GET /skills`（最低限、プルダウン用の一覧取得）。管理者がスキルマスタを編集できる画面（`/master/skills`）向けに、作成・更新・削除も必要になる見込み。

---

## 5. 優先順位の提案

1. **最優先**: 1.1（スキルマスタ＋経験年数）・2章（specialty/gitHub）・3章（hasSpouse等の変換）— これらが無いと社員情報のフィールド統合自体が完了しない
2. **次点**: 4.2（詳細APIへの配線。既に1.3/1.1/1.2のテーブルが揃えば実装可能）・4.6（スキルマスタCRUD、スキル選択UIに必須）
3. **権限実装とセット**: 1.3（営業担当テーブル）・5章の認可ミドルウェア・各APIでのスコープ/フィールド制御
4. **後回し可**: 1.2（スキルシート。ファイルストレージ選定が別途必要）・2章の`imageUrl`・4.5
