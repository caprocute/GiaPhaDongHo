import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@giapha/tokens/tokens.css";
import { PortalAuthProvider } from "../src/auth/PortalAuthProvider";
import { PortalChrome } from "../src/chrome/PortalChrome";

export const metadata: Metadata = {
  title: "Họ Hoàng – Huỳnh · GiaPhaHub",
  description: "Trang thông tin họ Hoàng thôn Trung Bính — gia phả, ngày giỗ, di sản dòng tộc",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Noto+Serif:wght@600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        style={{
          margin: 0,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "var(--color-surface-page)",
          color: "var(--color-text-primary)",
          fontFamily: "var(--font-body)",
          WebkitFontSmoothing: "antialiased",
        }}
      >
        <PortalAuthProvider>
          <PortalChrome>{children}</PortalChrome>
        </PortalAuthProvider>
      </body>
    </html>
  );
}
