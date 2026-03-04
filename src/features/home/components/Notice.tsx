"use client";

import { Paper, Text, Title } from "@mantine/core";

const notices = [
    "A現場今月で終了・・・〇〇さん",
  ];
  
  export default function NoticeSection() {
    return (
      <>
        <Title order={5} mb={-25}>
          お知らせ
        </Title>
        <Paper p="4rem" radius="md" withBorder>
          {notices.length > 0 ? (
            notices.map((notice, index) => (
              <Text key={index} size="sm" mt={0}>
                {notice}
              </Text>
            ))
          ) : (
            <Text size="sm" c="dimmed">
              お知らせはありません
            </Text>
          )}
        </Paper>
      </>
    );
  }