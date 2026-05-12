import { OpenAPIHono } from "@hono/zod-openapi";
import { createEmployeeRoute, updateEmployeeRoute, getEmployeeListRoute, getEmployeeDetailsRoute } from "./types/routes";
import { createEmployeeController, updateEmployeeController, getEmployeeListController, getEmployeeDetailsController } from "./controller";

const employeeRoutes = new OpenAPIHono();

employeeRoutes.openapi(createEmployeeRoute, createEmployeeController);
employeeRoutes.openapi(updateEmployeeRoute, updateEmployeeController);
employeeRoutes.openapi(getEmployeeListRoute, getEmployeeListController);
employeeRoutes.openapi(getEmployeeDetailsRoute, getEmployeeDetailsController);

export default employeeRoutes;
