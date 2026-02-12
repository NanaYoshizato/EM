"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavLink } from "@mantine/core";

const navItems = [
    {label: "ホーム", href: "/"},
    {label: "社員一覧", href: "/employees"},
    {label: "案件一覧", href: "#TODO"},
    {label: "履歴一覧", href: "#TODO"},
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <>
        {navItems.map((item) => (
            <NavLink
                key={item.href}
                component={Link}
                label={item.label}
                href={item.href}
                active={pathname === item.href}
                variant="light" 
            />
        ))}
        </>
    );
}