import { createEmployeeWithUser } from "./repository";
import type { CreateEmployeeInput } from "./types/createEmployee.schema";

export const createEmployee = async (data: CreateEmployeeInput) => {
  return createEmployeeWithUser(data);
};
