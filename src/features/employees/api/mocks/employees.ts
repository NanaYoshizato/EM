import { Employee } from "../../types/employee";

export const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", employeeNumber: "000001", name: "山田 太郎", frameWork: "Next.js", projectValue: 680000, condition: "稼働中" },
  { id: "2", employeeNumber: "000002", name: "田中 花子", frameWork: "Python",  projectValue: 650000, condition: "稼働中" },
  { id: "3", employeeNumber: "000003", name: "鈴木 一郎", frameWork: "React",   projectValue: 600000, condition: "待機中" },
  { id: "4", employeeNumber: "000004", name: "佐藤 次郎", frameWork: "Vue.js",  projectValue: 620000, condition: "研修中" },
  { id: "5", employeeNumber: "000005", name: "高橋 三郎", frameWork: "Java",    projectValue: 700000, condition: "入社前" },
];