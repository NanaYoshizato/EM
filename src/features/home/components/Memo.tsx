"use client";

import { Button, Textarea, Title } from "@mantine/core";
import useMemo from "@/features/home/hooks/useMemo";

export default function Memo() {
  const { memo, handleChange, handleSave } = useMemo();

  return (
    <>
        <Title order={5} mb={-25}>
            メモ
        </Title>
        <Textarea
            value={memo}
            onChange={handleChange}
            minRows={10}
            autosize
        />
        <Button onClick={handleSave} maw={80} mt={-10}>
            保存
        </Button>
    </>
  );
}