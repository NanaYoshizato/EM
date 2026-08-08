# EM
社員管理システム


# EM　初期セットアップ

Next.js プロジェクト（パッケージマネージャ: pnpm）

## セットアップ

### 1. pnpm のインストール（未導入の場合）

```bash
npm install -g pnpm
```

### 2. 依存関係のインストール

```bash
cd /Users/ユーザー名/Desktop/EM
pnpm install
```

### 3. 開発サーバーの起動

```bash
pnpm dev
```

http://localhost:3000 が立ち上がります。

---

## Dockerでのセットアップ手順（PostgreSQL環境）

### 1. 環境変数ファイル（.env）の作成

```bash
cd backend
cp .env.example .env
```

### 2. コンテナのビルドと起動
- 2-1. Docker DeskTop起動

- 2-2. Dockerをビルドする
```bash
docker compose up --build
```
* **起動するサービス**:
  * フロントエンド (Next.js): [http://localhost:3010](http://localhost:3010)
  * バックエンド (Hono): [http://localhost:3001](http://localhost:3001)
  * データベース (PostgreSQL): `localhost:5432`

### 3. 初期データの登録（初回起動時のみ）

コンテナが正常に起動したら、別のターミナルタブを開き、プロジェクトのルートディレクトリで以下のコマンドを実行してテストデータを登録。

```bash
docker compose exec backend pnpm prisma db seed
```

### 4. テーブル構造を変えたとき、DBに変更を反映する(毎回必要)
```bash
pnpm db:migrate --name "適当な名前"
```

#### ※※SQLLiteで使用していた以下のコマンドはDocker側で自動的に実行されるので不要
schema.prismaを生成するコマンド

 `cd backend`

 `pnpm prisma generate`

DB作成するコマンド

 `pnpm prisma db push`

### 5. 新しいSQLファイルをローカルPCにコピー
```bash
pnpm db:copy-migrations
```

---

## Firebase Auth エミュレータの起動手順

### 1. 前提条件（Java Runtime Environment）
エミュレータの実行には **Java (JRE/JDK 11以上)** が必要です。

```bash
# Ubuntu / Debian の場合
sudo apt update && sudo apt install -y default-jre

# Javaがインストールされたか確認（11以上）
java -version
```

### 2. エミュレータの起動
```bash
pnpm emulator
```

* **Auth エミュレータ**: `http://127.0.0.1:9099`
* **Emulator UI**: `http://127.0.0.1:4000/auth`

