"use client";

import { useEffect, useState } from "react";
import { EmployeeDetail } from "../types/employee";
import { fetchEmployeeDetail } from "../api/fetchEmployeeDetail";

export function useEmployeeDetail(id: string) {
  const [employee, setEmployee] = useState<EmployeeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    setError("");
    fetchEmployeeDetail(id)
      .then(setEmployee)
      .catch((err) => setError(err instanceof Error ? err.message : "取得に失敗しました"))
      .finally(() => setLoading(false));
  }, [id]);

  return { employee, loading, error };
}
