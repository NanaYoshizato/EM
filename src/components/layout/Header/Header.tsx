"use client";

import { useRouter } from "next/navigation";
import { Group, Text, ActionIcon } from "@mantine/core";
import { IconLogout } from "@tabler/icons-react";
import { useMe } from "@/features/auth/hooks/useMe";
import { logout } from "@/features/auth/api/logout";

export default function Header() {
  const { me, loading } = useMe();
  const router = useRouter();

  const displayName = loading
    ? ""
    : (me?.employee?.name ?? me?.email ?? "未ログイン");
  const employeeCode = loading ? "" : (me?.employee?.employeeCode ?? "-");

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <Group h="100%" px="xl" justify="flex-end">
      <div>
        <Text size="sm" fw={600} ta="right">
          {displayName}
        </Text>
        <Text size="sm" fw={600} ta="right">
          社員番号：{employeeCode}
        </Text>
      </div>
      <ActionIcon variant="subtle" color="gray" onClick={handleLogout} title="ログアウト">
        <IconLogout size={20} />
      </ActionIcon>
    </Group>
  );
}
