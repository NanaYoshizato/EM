import { OpenAPIHono } from "@hono/zod-openapi";
import { createEmployeeRoute } from "./types/routes";
import { createEmployeeController } from "./controller";

const employeeRoutes = new OpenAPIHono();

employeeRoutes.openapi(createEmployeeRoute, createEmployeeController);

export default employeeRoutes;
