import { OpenAPIHono } from "@hono/zod-openapi";
import { swaggerUI } from "@hono/swagger-ui";
import { serve } from "@hono/node-server";
import { cors } from "hono/cors";
import authRoutes from "./features/auth/routes";
import employeeRoutes from "./features/employees/routes";

const app = new OpenAPIHono();

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
app.route("/api", employeeRoutes);

app.doc("/doc", {
  openapi: "3.0.0",
  info: { title: "Employee Management API", version: "1.0.0" },
});

app.get("/ui", swaggerUI({ url: "/doc" }));

serve({
  fetch: app.fetch,
  port: 3001,
});
