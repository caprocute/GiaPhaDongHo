import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@giapha/tokens/tokens.css";
import { PublicFooter } from "@giapha/ui/PublicFooter";
import { PublicHeader } from "@giapha/ui/PublicHeader";
import { AuthNav } from "../src/auth/AuthNav";
import { PortalAuthProvider } from "../src/auth/PortalAuthProvider";

export const metadata: Metadata = {
  title: "GiaPhaHub",
  description: "Nền tảng gia phả số dòng họ Việt Nam",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-surface-page)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
        }}
      >
        <PortalAuthProvider>
          <PublicHeader endSlot={<AuthNav />} />
          <main style={{ flex: 1, padding: "var(--spacing-lg)" }}>{children}</main>
          <PublicFooter />
        </PortalAuthProvider>
      </body>
    </html>
  );
}
