import { Hono } from "hono";
import { loginController } from "./controller";

const authRoutes = new Hono();

authRoutes.post("/login", loginController);

export default authRoutes;
