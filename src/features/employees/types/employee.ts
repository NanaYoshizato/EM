export type { EmployeeFormValues } from "../schemas/employeeSchema";

export type Employee = {
    id: string;
    employeeNumber: string;
    name: string;
    frameWork: string;
    projectValue: number;
    condition: "稼働中" | "待機中" | "研修中" | "入社前";
};

export type EmployeeSearchParams = {
    employeeNameForm: string;
    employeeNumberForm: string;
};

export type SortKey = "employeeNumber" | "frameWork" | "projectValue";
export type SortOrder = "asc" | "desc";