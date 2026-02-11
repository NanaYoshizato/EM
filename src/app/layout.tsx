"use client";

import { MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { Shell } from "@/components/layout/Shell";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body>
        <MantineProvider>
          <Shell>
            {children}
          </Shell>
        </MantineProvider>
      </body>
    </html>
  );
}
