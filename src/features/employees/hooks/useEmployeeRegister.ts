"use client";

import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { z } from "zod";
import { employeeSchema, EmployeeFormValues } from "../schemas/employeeSchema";
import { createEmployee } from "../api/createEmployee";

export function useEmployeeRegister() {
  const router = useRouter();
  const [error, setError] = useState("");

  const form = useForm<EmployeeFormValues>({
    initialValues: {
      // 基本情報
      name: "",
      furigana: "",
      birthDate: "",
      gender: "男性",
      phone: "",
      email: "",
      joinDate: "",
      trainingEndDate: "",
      trainingLanguages: ["", "", ""],
      availableLanguages: ["", "", ""],
      previousCompany1Name: "",
      previousCompany1StartDate: "",
      previousCompany1EndDate: "",
      previousCompany2Name: "",
      previousCompany2StartDate: "",
      previousCompany2EndDate: "",
      previousCompany3Name: "",
      previousCompany3StartDate: "",
      previousCompany3EndDate: "",
      weeklyWorkHours: "",
      monthlyEstimatedSalary: "",
      // 住所
      postalCode: "",
      prefecture: "",
      city: "",
      streetAddress: "",
      // 緊急連絡先
      emergencyContactName: "",
      emergencyContactRelationship: "",
      emergencyContactPhone: "",
      hasSpouse: undefined,
      hasChildren: undefined,
      hasDependents: undefined,
      // 機密情報
      myNumber: "",
      employmentInsuranceNumber: "",
      basicPensionNumber: "",
      salaryAccount: "",
    },
    validate: (values) => {
      const result = employeeSchema.safeParse(values);
      if (result.success) return {};
      return z.flattenError(result.error).fieldErrors;
    },
  });

  const onSubmit = async (values: EmployeeFormValues) => {
    setError("");
    try {
      await createEmployee(values);
      router.push("/employees");
    } catch (err) {
      setError(err instanceof Error ? err.message : "登録に失敗しました");
    }
  };

  return { form, onSubmit, error };
}
