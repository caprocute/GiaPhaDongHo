import type { Metadata } from "next";
import type { ReactNode } from "react";
import "@giapha/tokens/tokens.css";
import { ThemeProvider, ThemeScript } from "@giapha/ui";
import { PortalAuthProvider } from "../src/auth/PortalAuthProvider";
import { PortalChrome } from "../src/chrome/PortalChrome";
import { SiteSettingsProvider } from "../src/chrome/SiteSettingsProvider";
import { fetchTreeSettings } from "../src/lib/treeSettings";

export async function generateMetadata(): Promise<Metadata> {
  const s = await fetchTreeSettings();
  const title = s.displayName ? `${s.displayName} · GiaPhaHub` : "GiaPhaHub";
  return {
    title,
    description: s.description ?? undefined,
    keywords: s.seoKeywords?.length ? s.seoKeywords : undefined,
  };
}

export default async function RootLayout({ children }: { children: ReactNode }) {
  const settings = await fetchTreeSettings();

  return (
    <html lang="vi" suppressHydrationWarning>
      <head>
        <ThemeScript />
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
        <ThemeProvider>
          <SiteSettingsProvider value={settings}>
            <PortalAuthProvider>
              <PortalChrome>{children}</PortalChrome>
            </PortalAuthProvider>
          </SiteSettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
