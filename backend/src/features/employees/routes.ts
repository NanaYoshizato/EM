import { OpenAPIHono } from "@hono/zod-openapi";
import { createEmployeeRoute, updateEmployeeRoute, getEmployeeListRoute, getEmployeeDetailRoute } from "./types/routes";
import { createEmployeeController, updateEmployeeController, getEmployeeListController, getEmployeeDetailController } from "./controller";
import { requireAuth, type AuthEnv } from "@/middlewares/requireAuth";
import { validationHook } from "@/lib/validationHook";
import { bodySizeLimit } from "@/lib/bodySizeLimit";

const employeeRoutes = new OpenAPIHono<AuthEnv>({ defaultHook: validationHook });

employeeRoutes.use("/employees", bodySizeLimit(128));
employeeRoutes.use("/employees/*", bodySizeLimit(128));
employeeRoutes.use("/employees", requireAuth);
employeeRoutes.use("/employees/*", requireAuth);

employeeRoutes.openapi(createEmployeeRoute, createEmployeeController);
employeeRoutes.openapi(updateEmployeeRoute, updateEmployeeController);
employeeRoutes.openapi(getEmployeeListRoute, getEmployeeListController);
employeeRoutes.openapi(getEmployeeDetailRoute, getEmployeeDetailController);

export default employeeRoutes;
