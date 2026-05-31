"use client";

import { AppShell } from "@mantine/core";
import { Header } from "../Header";
import { Sidebar } from "../Sidebar";
import { COLORS } from "@/config/theme";
type ShellProps = {
  children: React.ReactNode;
};

export default function Shell({ children }: ShellProps) {
  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{ width: 180, breakpoint: "sm" }}
      padding="xl"
    >
      <AppShell.Header bg={COLORS.main}>
        <Header />
      </AppShell.Header>

      <AppShell.Navbar p="md" bg={COLORS.main}>
        <Sidebar />
      </AppShell.Navbar>

      <AppShell.Main>{children}</AppShell.Main>
    </AppShell>
  );
}
