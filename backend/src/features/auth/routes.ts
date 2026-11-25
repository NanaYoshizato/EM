import { OpenAPIHono } from "@hono/zod-openapi";
import { loginController, registerController, logoutController, meController } from "./controller";
import { loginRoute, registerRoute, logoutRoute, meRoute } from "./types/routes";
import { bodySizeLimit } from "@/lib/bodySizeLimit";

const authRoutes = new OpenAPIHono();

authRoutes.use("/login", bodySizeLimit(8));
authRoutes.use("/register", bodySizeLimit(8));

authRoutes.openapi(loginRoute, loginController);
authRoutes.openapi(registerRoute, registerController);
authRoutes.openapi(logoutRoute, logoutController);
authRoutes.openapi(meRoute, meController);

export default authRoutes;
