"use client";

import { Group, Text } from "@mantine/core";
import classes from "./header.module.css";

type HeaderProps = {
    userName: string;
    employeeId: string;
};

export default function Header({ userName, employeeId }: HeaderProps) {
    return (
        <Group h="100%" px="xl" justify="flex-end" className={classes.header}>
            <div>
                <Text size="sm" fw={600} ta="right">
                    {userName}
                </Text>
                <Text size="sm" fw={600} ta="right">
                    社員番号：{employeeId}
                </Text>
            </div>
        </Group>
    );
}