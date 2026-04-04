import { useState, useCallback, useEffect } from "react";
import { Employee, EmployeeSearchParams, SortKey, SortOrder } from "../types/employee";
import { fetchEmployees, deleteEmployee } from "../api/employees";

export function useEmployeeList() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading]     = useState(false);
  const [sortKey, setSortKey]     = useState<SortKey | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // 削除モーダル用
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

  // 初期表示時に全件取得
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
        const aVal = a[sortKey];
        const bVal = b[sortKey];
        const cmp  = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
        return sortOrder === "asc" ? cmp : -cmp;
      })
    : employees;

  // モーダルを開く
  const openDeleteModal = useCallback((employee: Employee) => {
    setDeleteTarget(employee);
  }, []);

  // モーダルを閉じる（いいえ）
  const closeDeleteModal = useCallback(() => {
    setDeleteTarget(null);
  }, []);

  // 削除実行（モーダルの削除ボタン）
  const handleDelete = useCallback(async () => {
    if (!deleteTarget) return;
    await deleteEmployee(deleteTarget.id);
    setEmployees((prev) => prev.filter((e) => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  }, [deleteTarget]);

  const downloadCsv = useCallback(() => {
    const header = "社員番号,氏名,言語,単価,状態\n";
    const rows = sortedEmployees
      .map((e) => `${e.employeeNumber},${e.name},${e.frameWork},${e.projectValue},${e.condition}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = "employees.csv";
    a.click();
    URL.revokeObjectURL(url);
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
    downloadCsv,
  };
}