"use client";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <MantineProvider>{children}</MantineProvider>
      </body>
    </html>
  );
}
