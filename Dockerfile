# ベースイメージの設定
FROM node:22-alpine

# 環境変数の設定 (pnpmの有効化)
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

# 作業ディレクトリの設定
WORKDIR /app

# 依存関係のファイルをコピー
COPY package.json pnpm-lock.yaml ./

# 依存関係のインストール
RUN pnpm install --frozen-lockfile

# アプリケーションコードのコピー
COPY . .

# Next.jsのビルド
RUN pnpm build

# ポート開放とホスト設定
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# アプリケーションの起動コマンド (本番モード)
CMD ["pnpm", "start"]
