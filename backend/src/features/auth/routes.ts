import { OpenAPIHono } from "@hono/zod-openapi";
import { loginController, registerController, meController } from "./controller";
import { loginRoute, registerRoute, meRoute } from "./types/routes";

const authRoutes = new OpenAPIHono();

authRoutes.openapi(loginRoute, loginController);
authRoutes.openapi(registerRoute, registerController);
authRoutes.openapi(meRoute, meController);

export default authRoutes;
