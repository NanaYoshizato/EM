"use client";

import { Group, Stack, Text } from "@mantine/core";

const summaryData = [
    { label: "社員数", value: "30人" },
    { label: "稼働中案件", value: "18件" },
    { label: "研修生", value: "10人" },
    { label: "今月入社", value: "5人" },
  ];
  
  export default function SummarySection() {
    return (
      <Stack gap="sm">
        {summaryData.map((item) => (
          <Group key={item.label} gap="xl">
            <Text size="md" fw={550} w={100}>
              {item.label}
            </Text>
            <Text size="md" fw={550} >{item.value}</Text>
          </Group>
        ))}
      </Stack>
    );
  }