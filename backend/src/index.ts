import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import authRoutes from "./features/auth/routes";

const app = new Hono();

// CORS設定
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

app.get("/", (c) => {
  return c.text("Backend running 🚀");
});

app.route("/api", authRoutes);

serve({
  fetch: app.fetch,
  port: 3001,
});
