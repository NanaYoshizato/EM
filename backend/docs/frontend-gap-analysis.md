# フロント設計 vs バックエンド実装 ギャップ分析

調査日: 2026-10-09
対象:
- フロント設計書: `employee-management-system/docs/README.md`（正本と明記されているドキュメント）
- フロントデザインモック: `employee-management-system/docs/design/SES社員管理システム.html`
- フロント実装: `employee-management-system/frontend/`
- バックエンド実装: `employee-management/backend/`（`develop`ブランチ + `feature/Role追加`相当）

## 1. 結論サマリ

- フロントが呼び出そうとしているAPIリソースのうち、**実装済みはauth・employees(members)の2つのみ**。companies/news/skills/hearings/mail-formats/matching/notifications/projects/sales-dashboard/dashboardの統計系は**すべて未実装**（フロントはMSWモックで代替中）。
- `GET /me`・`GET/PATCH /employees`系には**認可ミドルウェアが一切ない**。誰でも全フィールド（マイナンバー・緊急連絡先・給与口座等）を取得できてしまう。
- ロールの体系が**3箇所でバラバラ**（設計書=3ロール、デザインモック=別の3ロール、バックエンド実装=5ロール）。フロントのアクセス制御コードは3ロール前提のまま5ロールに追従できていない。
- バックエンドの`Employee`テーブルには設計書に存在しない個人情報項目（マイナンバー・住所・家族構成・給与口座等）が既に実装されており、閲覧制限の仕組みが一切ない状態でAPIから生で返っている。

---

## 2. ロール体系の不整合（最優先で合意が必要）

| 定義元 | ロール | 備考 |
|---|---|---|
| `employee-management-system/docs/README.md`（フロント設計の正本） | `admin` / `employee` / `sales`（3種） | A3に「要件定義書では4段階（一般社員／本人／役員／管理者）を想定していたが実装は3値に統合」という注記あり |
| `docs/design/SES社員管理システム.html`（デザインモック） | `employee` / `sales` / `manager`（3種、admin相当が`manager`） | `roleLabelMap: { employee: '一般社員', sales: '営業担当', manager: 'マネージャー' }` |
| 本バックエンド（`prisma/schema.prisma`・`src/constants/roles.ts`） | `admin` / `system_admin` / `sales` / `mentor` / `employee`（5種、権限の強い順） | 今回のRole追加作業で導入。`ProjectAssignment.mentorId`という既存の関連も「メンター」ロールの実在を裏付けている |
| フロント実装（`types/Member.ts`の`RoleVariant`、`master/layout.tsx`・`sales/layout.tsx`のガード） | `admin` / `employee` / `sales`（3種、未更新） | `role !== 'admin'`のような判定のみ。`system_admin`・`mentor`は一切ハンドリングされていない |

**具体的に起きる不具合**: バックエンドで`system_admin`または`mentor`としてログインしたユーザーは、フロントの`master/layout.tsx`（`role !== 'admin'`で弾く）や`sales/layout.tsx`（`role !== 'admin' && role !== 'sales'`で弾く）に引っかかり、意図しない権限（一般社員相当）としてしか画面を使えない。

**対応が必要な論点**:
1. 「管理者」と「システム管理者」を分離する意図（マイナンバー等の機密情報は管理者のみ閲覧可、システム管理者＝保守担当は不可）を、設計書（`docs/README.md`）側にも正式に反映するか
2. デザインモックの`manager`という呼称と、バックエンドの`admin`（管理者）の対応関係の整理
3. 「メンター」ロールの業務上の役割を明文化する（`ProjectAssignment.mentorId`との関係、メンターが閲覧・編集できる範囲）
4. フロントの`RoleVariant`型・`master/layout.tsx`・`sales/layout.tsx`等のガードロジックを5ロールに対応させる（別タスクで対応予定）

---

## 3. 権限まわりで考慮すべき点（詳細）

### 3.1 サーバー側でのフィールドレベル制御が未実装（重大）

`docs/README.md`（C2 `GET /members/{id}`、A5 F2）には以下が明記されている:

> 基本情報・スキルセットは全社員閲覧可、案件履歴詳細・スキルシート・単価等の制限情報は本人・管理者・営業のみ閲覧可。制限対象時はAPIレスポンス自体で`null`を返し、画面側の表示制御だけに頼らない

しかし現在のバックエンド（`features/employees/controller.ts`の`mapEmployeeDetailsResponse`）は、認証・認可を一切行わず、呼び出し元が誰であっても以下を含む全フィールドをそのまま返している:

- `myNumber`（マイナンバー）
- `emergencyContactName` / `emergencyContactRelationship` / `emergencyContactPhone`（緊急連絡先）
- `monthlyEstimatedSalary`（月額想定給与）
- `salaryAccount`（給与振込口座）
- `basicPensionNumber`（基礎年金番号）
- `employmentInsuranceNumber`（雇用保険番号）

これらの項目は`docs/README.md`のデータモデルには存在しないが、デザインモックの「個人情報」「行政・支払情報」タブには存在する。**つまり設計書側がこの機密データの扱いについて何も規定していない**状態で、バックエンドには既に無制限にAPIから取得できる形で実装されている。5ロール化を機に、最低限以下を決める必要がある:

- マイナンバー等の機密情報を閲覧できるロールはどれか（管理者のみ？ 管理者+本人のみ？）
- システム管理者（保守側）が明示的に除外されることの実装方法（`role !== 'system_admin'`のような除外ロジックか、「閲覧可能ロールのホワイトリスト」方式か）
- 営業・メンターは案件アサインに必要な範囲（氏名・スキル・稼働状況等）のみ見えればよいのか、個人情報タブは一切見せないのか

### 3.2 認証・認可ミドルウェアが存在しない

`backend/src/index.ts`で`employeeRoutes`を含む全ルートがミドルウェアなしで`/api`にマウントされている。`GET /me`以外のエンドポイント（`/employees`系）には、

- ログイン必須かどうかのチェック
- ロールによるアクセス可否チェック（`/master/*`相当はadminのみ、等）
- 「本人かどうか」の判定（`docs/README.md` B2が要求する「ロールとは独立した本人判定軸」）

が一切ない。5ロール対応のアクセス制御を実装する前提として、まず共通の認証ミドルウェア（Firebaseセッションの検証＋`req`へのユーザー情報付与）を導入する必要がある。

### 3.3 「本人かどうか」の判定軸

`docs/README.md`は「ロール」と「本人かどうか」を独立した2軸として扱うよう明記している（一般社員でも自分自身の情報は全項目閲覧・編集可）。5ロール化後もこの軸は維持する。

**→ ロール別の閲覧範囲・制限フィールドは確定した。[employee-field-and-api-design.md](./employee-field-and-api-design.md) 5章「権限マトリクス（確定仕様）」を参照。** 概要:
- 管理者・システム管理者は全社員が対象範囲、営業・メンターは「自身が担当する社員」のみが対象範囲（一般社員は自身のみ）
- マイナンバー・給与口座・年金番号は管理者以外（システム管理者・営業・メンター）には非表示
- メンターはさらに緊急連絡先・住所・電話番号も対象外（担当社員について）
- 「営業が担当する社員」を算出するためのデータモデル（案件への営業担当者の紐付け）が現状存在しないため、新規追加が必要

### 3.4 メンターロールの業務要件

バックエンドの`ProjectAssignment.mentorId`（`User`への外部キー）は既に存在するが、

- メンターは自分が担当する案件アサインのメンバー情報をどこまで見られるか
- メンターは営業画面（`/sales/*`）にアクセスできるべきか、専用画面が必要か
- フロントのデザイン・画面一覧（`docs/README.md` A4/A5）にメンター向け画面が一切存在しない

という点が未整理。デザイン・設計書側にメンター向けの画面要件が存在しないため、今回のロール追加に合わせて新規に要件定義が必要。

---

## 4. 未実装のAPIリソース一覧

フロントの`lib/api/`配下に存在するが、バックエンドに対応する実装がないもの（MSWモックで代替中）:

| リソース | フロントのモックファイル | 状態 |
|---|---|---|
| companies | `CompaniesHandlers.ts` | 未実装 |
| dashboard（月次統計・稼働ステータス集計） | `DashboardHandlers.ts` | 未実装（設計書は「実装済み」と記載しているが実体なし） |
| news | `NewsHandlers.ts` | 未実装 |
| skills | `SkillsHandlers.ts` | 未実装（設計書は`GET /skills`のみ「実装済み」と記載しているが実体なし） |
| hearings | `HearingsHandlers.ts` | 未実装 |
| mailFormats | `MailFormatsHandlers.ts` | 未実装 |
| matching | `MatchingHandlers.ts` | 未実装 |
| notifications | `NotificationsHandlers.ts` | 未実装 |
| projects（案件・募集） | `ProjectsHandlers.ts` | 未実装（※バックエンドの`Project`モデルは存在するが、設計書の「募集中の求人」とは別概念＝実際は常駐契約のアサイン管理用で、流用できない） |
| salesDashboard | `SalesDashboardHandlers.ts` | 未実装 |

実装済み（モックから実APIに切り替え済み）: `auth`（login/logout/me）、`members`→`employees`（list/detail/create/update。**delete未実装の可能性あり、要確認**）。

---

## 5. データモデルの不整合

設計書（`docs/README.md` B5/C1）が想定するテーブル構成（`members`/`skills`/`member_skills`/`member_project_histories`/`member_project_contracts`/`member_skill_sheets`/`news`/`companies`/`projects`/`hearing_sessions`/`mail_prompts`/`market_talents`/`notifications`/`read_states`）と、実際のバックエンドのPrismaスキーマ（`User`/`Employee`/`Role`/`Framework`/`Project`/`ProjectAssignment`等）は、ほぼ別物の設計になっている。特に:

- 設計書の`projects`＝「募集中の求人」、バックエンドの`Project`＝「常駐契約・アサイン管理」で概念が異なる
- `skills`/`news`/`companies`/`hearing_sessions`/`mail_prompts`/`notifications`系のテーブルがバックエンドに一切存在しない
- バックエンドの`Employee`にのみ存在する機密項目（マイナンバー等、3.1節参照）が設計書に記載がない

この差分は「後から追加実装すれば済む」範囲と、「設計そのものをどちらに合わせるか意思決定が必要」な範囲（特に`projects`の概念）が混在しているため、機能追加に着手する前に設計書とバックエンドどちらを正とするか、または両者をすり合わせて更新するかを決める必要がある。

---

## 6. 推奨する次のステップ（提案）

1. **ロール体系の正式合意**: 5ロール（管理者/システム管理者/営業/メンター/一般社員）を正式仕様とし、`docs/README.md`を更新する（デザインモックの`manager`呼称も合わせて整理）
2. **権限マトリクスの確定**: 3.3節の表を埋め、特にシステム管理者・メンターの閲覧範囲を決定する
3. **認証・認可ミドルウェアの実装**: Firebaseセッション検証＋ロールベースのアクセス制御を共通化し、`/employees`系から適用する
4. **機密フィールドのサーバー側マスキング実装**: `docs/README.md`が要求する`isRestricted`相当の仕組みを、新しい権限マトリクスに合わせて実装する
5. **フロントのロール対応**: `RoleVariant`型・`master/layout.tsx`・`sales/layout.tsx`等を5ロールに追従させる
6. **未実装リソースの優先順位付け**: 4節の一覧から、どの機能を次に実装するか（ユーザー数・ビジネスインパクトの観点で）優先順位を決める
7. **データモデルのすり合わせ**: 5節の差分について、設計書とバックエンドのどちらを正とするか意思決定する
