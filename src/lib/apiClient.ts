const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

/** サーバーがJSON以外(プレーンテキストのエラーページ等)を返した場合でも安全にパースする */
const parseBody = (text: string) => {
  if (!text) return undefined;
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
};

export const apiClient = {
  get: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const text = await res.text();
    const body = parseBody(text);
    if (!res.ok) {
      throw new Error(body?.message || "エラーが発生しました");
    }
    return body;
  },

  post: async (path: string, body: unknown) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const text = await res.text();
    const parsed = parseBody(text);
    if (!res.ok) {
      throw new Error(parsed?.message || "エラーが発生しました");
    }
    return parsed;
  },

  delete: async (path: string) => {
    const res = await fetch(`${BASE_URL}${path}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const text = await res.text();
    const body = parseBody(text);
    if (!res.ok) {
      throw new Error(body?.message || "エラーが発生しました");
    }
    return body;
  },
};
