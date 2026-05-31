import { OpenAPIHono } from "@hono/zod-openapi";
import { loginController, registerController, logoutController, meController } from "./controller";
import { loginRoute, registerRoute, logoutRoute, meRoute } from "./types/routes";

const authRoutes = new OpenAPIHono();

authRoutes.openapi(loginRoute, loginController);
authRoutes.openapi(registerRoute, registerController);
authRoutes.openapi(logoutRoute, logoutController);
authRoutes.openapi(meRoute, meController);

export default authRoutes;
