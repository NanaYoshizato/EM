"use client";

import { useForm } from "@mantine/form";
import { Group, TextInput, Button, Stack } from "@mantine/core";
import { EmployeeSearchParams } from "../types/employee";

type Props = {
  loading: boolean;
  onSearch: (params: EmployeeSearchParams) => void;
};

export function EmployeeSearch({ loading, onSearch }: Props) {
  const form = useForm<EmployeeSearchParams>({
    initialValues: {
      employeeNameForm: "",
      employeeNumberForm: "",
    },
  });

  const handleSearch = () => onSearch(form.values);

  return (
    <Stack align="center" gap="md">
      <Group style={{ gap: 100 }} justify="center">
        <Group gap="xs" align="center">
          <label style={{ whiteSpace: "nowrap", fontSize: 14 }}>社員名</label>
          <TextInput
            placeholder=""
            {...form.getInputProps("employeeNameForm")}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            w={180}
          />
        </Group>
        <Group gap="xs" align="center">
          <label style={{ whiteSpace: "nowrap", fontSize: 14 }}>社員番号</label>
          <TextInput
            placeholder=""
            {...form.getInputProps("employeeNumberForm")}
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