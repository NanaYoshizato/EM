import type { ReactNode } from "react";
import { Providers } from "./providers";
import "@mantine/core/styles.css";
import "./globals.css";

export default function RootLayout({children,}: {children: ReactNode;}) {
  return (
    <html lang="ja">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}