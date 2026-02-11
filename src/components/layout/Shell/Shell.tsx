"use client";

import { AppShell } from "@mantine/core";
import { Header } from "../Header";

type ShellProps = {
    children: React.ReactNode;
};

export default function Shell({ children }: ShellProps) {
    return (
        <AppShell
            header={{ height: 60 }}
            navbar={{width: 200, breakpoint: 'sm'}}
            padding="md"
        >
            {/* ── ヘッダー ── */}
            <AppShell.Header>
                <Header userName="山田太郎" employeeId="123456789" />
            </AppShell.Header>

            {/* ── サイドバー（次のステップで作成） ── */}
            <AppShell.Navbar p="md">
                {/* 仮のプレースホルダー */}
                サイドバー
            </AppShell.Navbar>

            {/* ── メインコンテンツ ── */}
            <AppShell.Main>{children}</AppShell.Main>
        </AppShell>
    );
}