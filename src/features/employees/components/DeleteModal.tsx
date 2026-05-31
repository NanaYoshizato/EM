"use client";

import { Modal, Stack, Text, Group, Button } from "@mantine/core";
import { Employee } from "../types/employee";

type Props = {
  deleteTarget: Employee | null;
  onClose: () => void;
  onDelete: () => void;
};

export function DeleteModal({ deleteTarget, onClose, onDelete }: Props) {
  return (
    <Modal
      opened={!!deleteTarget}
      onClose={onClose}
      title="削除確認"
      centered
    >
      <Stack>
        <Text>
          {deleteTarget?.name}（{deleteTarget?.employeeCode}）を削除しますか？
        </Text>
        <Group justify="flex-end">
          <Button variant="default" onClick={onClose}>いいえ</Button>
          <Button color="red" onClick={onDelete}>削除</Button>
        </Group>
      </Stack>
    </Modal>
  );
}