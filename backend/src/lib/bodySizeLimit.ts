import { bodyLimit } from "hono/body-limit";

/** 送信データの大きさの上限（KB）。超えたら、ほかのエラーと同じ { error } の形で413を返す */
export const bodySizeLimit = (maxKb: number) =>
  bodyLimit({
    maxSize: maxKb * 1024,
    onError: (c) => c.json({ error: "送信データが大きすぎます" }, 413),
  });
