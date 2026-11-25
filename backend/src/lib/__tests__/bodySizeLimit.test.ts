import { describe, it, expect } from "vitest";
import { Hono } from "hono";
import { bodySizeLimit } from "../bodySizeLimit";

/** 上限1KBのAPIを1つだけ持つアプリ */
const app = new Hono();
app.post("/", bodySizeLimit(1), async (c) => c.text(await c.req.text()));

const post = (size: number) =>
  app.request("/", { method: "POST", body: "a".repeat(size) });

describe("bodySizeLimit", () => {
  it("上限ちょうどまでは受け付ける", async () => {
    const res = await post(1024);

    expect(res.status).toBe(200);
  });

  it("上限を超えたら、{ error }の形で413を返す", async () => {
    const res = await post(1025);

    expect(res.status).toBe(413);
    expect(await res.json()).toEqual({ error: "送信データが大きすぎます" });
  });
});
