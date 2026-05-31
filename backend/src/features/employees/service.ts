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
  employeeId: number,
  data: UpdateEmployeeInput,
) => {
  return updateEmployee(employeeId, data);
};

export const getEmployeeListService = async (filters?: {
  employeeCode?: string;
  name?: string;
}) => {
  return getEmployeeList(filters);
};

export const getEmployeeDetailsService = async (employeeId: number) => {
  return getEmployeeDetails(employeeId);
};
