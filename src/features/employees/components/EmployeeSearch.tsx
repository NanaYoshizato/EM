"use client";

import { useState } from "react";
import { Group, TextInput, Button, Stack } from "@mantine/core";
import { EmployeeSearchParams } from "../types/employee";

type Props = {
  loading: boolean;
  onSearch: (params: EmployeeSearchParams) => void;
};

export function EmployeeSearch({ loading, onSearch }: Props) {
  const [employeeNameForm, setName]     = useState("");
  const [employeeNumberForm, setNumber] = useState("");

  const handleSearch = () => onSearch({ employeeNameForm, employeeNumberForm });

  return (
    <Stack align="center" gap="md">
      <Group style={{ gap: 100 }} justify="center">
        <Group gap="xs" align="center">
          <label style={{ whiteSpace: "nowrap", fontSize: 14 }}>社員名</label>
          <TextInput
            placeholder=""
            value={employeeNameForm}
            onChange={(e) => setName(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            w={180}
          />
        </Group>
        <Group gap="xs" align="center">
          <label style={{ whiteSpace: "nowrap", fontSize: 14 }}>社員番号</label>
          <TextInput
            placeholder=""
            value={employeeNumberForm}
            onChange={(e) => setNumber(e.currentTarget.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            w={180}
          />
        </Group>
      </Group>
      <Button onClick={handleSearch} loading={loading} w={120}>
        検索
      </Button>
    </Stack>
  );
}