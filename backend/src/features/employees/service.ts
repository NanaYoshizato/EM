import {
  createEmployeeWithUser,
  updateEmployee,
  getEmployeeList,
  getEmployeeDetails,
} from "./repository";
import type {
  CreateEmployeeInput,
  UpdateEmployeeInput,
} from "./types/employee.schema";

export const createEmployee = async (data: CreateEmployeeInput) => {
  return createEmployeeWithUser(data);
};

export const updateEmployeeService = async (
  employeeId: string,
  data: UpdateEmployeeInput,
) => {
  return updateEmployee(employeeId, data);
};

export const getEmployeeListService = async (filters?: {
  employeeId?: string;
  name?: string;
}) => {
  return getEmployeeList(filters);
};

export const getEmployeeDetailsService = async (employeeId: string) => {
  return getEmployeeDetails(employeeId);
};
