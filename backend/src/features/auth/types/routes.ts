import { createRoute } from "@hono/zod-openapi";
import { AuthBodySchema, MessageSchema, MeResponseSchema } from "./schemas";

export const loginRoute = createRoute({
  method: "post",
  path: "/login",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthBodySchema } },
    },
  },
  responses: {
    200: {
      content: { "application/json": { schema: MessageSchema } },
      description: "ログイン成功",
    },
    401: {
      content: { "application/json": { schema: MessageSchema } },
      description: "認証失敗",
    },
  },
});

export const registerRoute = createRoute({
  method: "post",
  path: "/register",
  tags: ["Auth"],
  request: {
    body: {
      content: { "application/json": { schema: AuthBodySchema } },
    },
  },
  responses: {
    201: {
      content: { "application/json": { schema: MessageSchema } },
      description: "登録成功",
    },
    409: {
      content: { "application/json": { schema: MessageSchema } },
      description: "メールアドレス重複",
    },
  },
});

export const meRoute = createRoute({
  method: "get",
  path: "/me",
  tags: ["Auth"],
  responses: {
    200: {
      content: { "application/json": { schema: MeResponseSchema } },
      description: "ユーザー情報",
    },
    401: {
      content: { "application/json": { schema: MessageSchema } },
      description: "未認証",
    },
  },
});
