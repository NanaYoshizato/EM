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
            navbar={{width: 180, breakpoint: 'sm'}}
            padding="xl"
        >
            {/* ── ヘッダー ── */}
            <AppShell.Header bg={COLORS.main}>
                <Header userName="山田太郎" employeeId="123456789" />
            </AppShell.Header>

            {/* ── サイドバー（次のステップで作成） ── */}
            <AppShell.Navbar p="md" bg={COLORS.main}>
                <Sidebar />
            </AppShell.Navbar>

            {/* ── メインコンテンツ ── */}
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}