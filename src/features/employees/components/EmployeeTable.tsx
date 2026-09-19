"use client";

import { useRouter } from "next/navigation";
import {
  Table,
  Badge,
  Button,
  Group,
  Center,
  Loader,
  Text,
} from "@mantine/core";
import {
  IconChevronUp,
  IconChevronDown,
  IconSelector,
} from "@tabler/icons-react";
import {
  Employee,
  EmployeeStatus,
  SortKey,
  SortOrder,
  STATUS_LABEL,
} from "../types/employee";

const FIXED_ROW_COUNT = 7;

const STATUS_COLOR: Record<EmployeeStatus, string> = {
  WORKING: "blue",
  WAITING: "gray",
  TRAINING: "green",
  BEFORE_JOIN: "orange",
  LEAVE: "red",
};

function SortIcon({
  colKey,
  sortKey,
  sortOrder,
}: {
  colKey: SortKey;
  sortKey: SortKey | null;
  sortOrder: SortOrder;
}) {
  if (sortKey !== colKey) return <IconSelector size={14} />;
  return sortOrder === "asc" ? (
    <IconChevronUp size={14} />
  ) : (
    <IconChevronDown size={14} />
  );
}

type Props = {
  employees: Employee[];
  loading: boolean;
  sortKey: SortKey | null;
  sortOrder: SortOrder;
  onSort: (key: SortKey) => void;
  onDeleteClick: (employee: Employee) => void;
};

export function EmployeeTable({
  employees,
  loading,
  sortKey,
  sortOrder,
  onSort,
  onDeleteClick,
}: Props) {
  const router = useRouter();

  const sortableHeader = (label: string, key: SortKey) => (
    <Group
      gap={4}
      style={{ cursor: "pointer", userSelect: "none" }}
      onClick={() => onSort(key)}
    >
      {label}
      <SortIcon colKey={key} sortKey={sortKey} sortOrder={sortOrder} />
    </Group>
  );

  const emptyRowCount = Math.max(0, FIXED_ROW_COUNT - employees.length);

  if (loading)
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );

  return (
    <>
      <Text size="sm">{employees.length}件</Text>
      <Table withTableBorder withColumnBorders highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>{sortableHeader("社員番号", "employeeCode")}</Table.Th>
            <Table.Th>氏名</Table.Th>
            <Table.Th>{sortableHeader("言語", "frameworks")}</Table.Th>
            <Table.Th>{sortableHeader("単価", "contractPrice")}</Table.Th>
            <Table.Th>状態</Table.Th>
            <Table.Th ta="center">詳細</Table.Th>
            <Table.Th ta="center">編集</Table.Th>
            <Table.Th ta="center">削除</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {employees.map((emp) => (
            <Table.Tr key={emp.employeeId}>
              <Table.Td>{emp.employeeCode}</Table.Td>
              <Table.Td>{emp.name}</Table.Td>
              <Table.Td>{emp.frameworks.join(" / ")}</Table.Td>
              <Table.Td ta="right">
                {emp.contractPrice != null
                  ? emp.contractPrice.toLocaleString()
                  : "-"}
              </Table.Td>
              <Table.Td>
                {emp.status ? (
                  <Badge color={STATUS_COLOR[emp.status]} variant="light">
                    {STATUS_LABEL[emp.status]}
                  </Badge>
                ) : (
                  "-"
                )}
              </Table.Td>
              <Table.Td ta="center">
                <Button
                  size="xs"
                  onClick={() => router.push(`/employees/${emp.employeeId}`)}
                >
                  詳細
                </Button>
              </Table.Td>
              <Table.Td ta="center">
                <Button
                  size="xs"
                  color="blue"
                  onClick={() =>
                    router.push(`/employees/${emp.employeeId}/edit`)
                  }
                >
                  編集
                </Button>
              </Table.Td>
              <Table.Td ta="center">
                <Button
                  size="xs"
                  color="red"
                  onClick={() => onDeleteClick(emp)}
                >
                  削除
                </Button>
              </Table.Td>
            </Table.Tr>
          ))}
          {Array.from({ length: emptyRowCount }).map((_, i) => (
            <Table.Tr key={`empty-${i}`}>
              {Array.from({ length: 8 }).map((_, j) => (
                <Table.Td key={j} style={{ height: 48 }}>
                  &nbsp;
                </Table.Td>
              ))}
            </Table.Tr>
          ))}
        </Table.Tbody>
      </Table>
    </>
  );
}
