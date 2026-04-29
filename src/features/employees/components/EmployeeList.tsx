"use client";

import { useRouter } from "next/navigation";
import { Title, Stack, Group, Button } from "@mantine/core";
import { useEmployeeList } from "../hooks/useEmployeeList";
import { EmployeeSearch } from "./EmployeeSearch";
import { EmployeeTable } from "./EmployeeTable";
import { DeleteModal } from "./DeleteModal";

export default function EmployeeList() {
  const router = useRouter();
  const {
    employees, loading,
    sortKey, sortOrder,
    deleteTarget,
    search, handleSort,
    openDeleteModal, closeDeleteModal, handleDelete,
    downloadCsv,
  } = useEmployeeList();

  return (
    <>
      <DeleteModal
        deleteTarget={deleteTarget}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
      />

      <Stack style={{ gap: 30 }} px={80}>
        <Title order={2}>社員一覧</Title>

        <EmployeeSearch loading={loading} onSearch={search} />

        <EmployeeTable
          employees={employees}
          loading={loading}
          sortKey={sortKey}
          sortOrder={sortOrder}
          onSort={handleSort}
          onDeleteClick={openDeleteModal}
        />

        <Group justify="center" gap="md">
          <Button onClick={downloadCsv}>CSV出力</Button>
          {/* 管理者のみ表示（権限実装時に条件追加） */}
          <Button>CSV登録</Button>
          <Button onClick={() => router.push("/employees/new")}>登録</Button>
        </Group>
      </Stack>
    </>
  );
}