import { useState, useCallback, useEffect } from "react";
import {
  Employee,
  EmployeeSearchParams,
  SortKey,
  SortOrder,
  STATUS_LABEL,
} from "../types/employee";
import { fetchEmployees, deleteEmployee } from "../api/employees";
import { downloadCsv } from "@/utils/csv";

export function useEmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const search = useCallback(async (params: EmployeeSearchParams) => {
    setLoading(true);
    try {
      const data = await fetchEmployees(params);
      setEmployees(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search({ employeeNameForm: "", employeeNumberForm: "" });
  }, [search]);

  const handleSort = useCallback((key: SortKey) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortOrder((order) => (order === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortOrder("asc");
      return key;
    });
  }, []);

  const sortedEmployees = sortKey
    ? [...employees].sort((a, b) => {
        const aRaw = a[sortKey];
        const bRaw = b[sortKey];
        const aVal = Array.isArray(aRaw) ? aRaw.join(",") : (aRaw ?? "");
        const bVal = Array.isArray(bRaw) ? bRaw.join(",") : (bRaw ?? "");
        const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === "asc" ? cmp : -cmp;
      })
    : employees;

  const openDeleteModal = useCallback((employee: Employee) => {
    setDeleteTarget(employee);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteEmployee(deleteTarget.employeeId);
    setEmployees((prev) =>
      prev.filter((e) => e.employeeId !== deleteTarget.employeeId),
    );
    setDeleteTarget(null);
  }, [deleteTarget]);

  const handleDownloadCsv = useCallback(() => {
    const headers = ["社員番号", "氏名", "言語", "単価", "状態"];
    const rows = sortedEmployees.map((e) => [
      e.employeeCode,
      e.name,
      e.frameworks.join("/"),
      e.contractPrice != null ? String(e.contractPrice) : "",
      e.status ? STATUS_LABEL[e.status] : "",
    ]);
    downloadCsv(headers, rows, "employees.csv");
  }, [sortedEmployees]);

  return {
    employees: sortedEmployees,
    loading,
    sortKey,
    sortOrder,
    deleteTarget,
    search,
    handleSort,
    openDeleteModal,
    closeDeleteModal,
    handleDelete,
    downloadCsv: handleDownloadCsv,
  };
}
