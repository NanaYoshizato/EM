# ベースイメージの設定
FROM node:22-alpine

# 環境変数の設定
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のファイルをコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係のインストール
RUN pnpm install --frozen-lockfile

# ソースコード全体のコピー
COPY . .

# Prisma Clientの生成
RUN pnpm prisma generate

# ポート開放
EXPOSE 3001
ENV PORT=3001

# アプリケーションの起動コマンド
CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm dev"]
