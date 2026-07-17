"use client";

import type { ReactNode } from "react";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { PublicFooter, PublicHeader } from "@giapha/ui";
import { AuthNav } from "../auth/AuthNav";
import { footerContactLines } from "../lib/treeSettings";
import { useSiteSettings } from "./SiteSettingsProvider";
import styles from "./PortalChrome.module.css";

export function PortalChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isLogin = pathname === "/login";
  const isTree = pathname === "/tree" || pathname.startsWith("/tree/");
  const settings = useSiteSettings();

  useEffect(() => {
    const pal = settings.brandPalette;
    if (pal === "bang-vang" || pal === "co") {
      document.documentElement.setAttribute("data-palette", pal);
      try {
        const raw = localStorage.getItem("giapha.appearance");
        const cur = raw ? JSON.parse(raw) : {};
        localStorage.setItem("giapha.appearance", JSON.stringify({ ...cur, palette: pal }));
      } catch {
        /* ignore */
      }
    }
  }, [settings.brandPalette]);

  useEffect(() => {
    if (settings.faviconUrl) {
      let link = document.querySelector<HTMLLinkElement>("link[rel='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = settings.faviconUrl;
    }
  }, [settings.faviconUrl]);

  if (isLogin) {
    return <main className={styles.mainGrow}>{children}</main>;
  }

  const brand = settings.displayName ?? "Họ Hoàng Trung Bính";
  const subtitle = settings.address ?? settings.shortName ?? undefined;

  return (
    <>
      <PublicHeader brand={brand} subtitle={subtitle} activeHref={pathname} endSlot={<AuthNav />} />
      <main className={isTree ? `${styles.mainGrow} ${styles.mainFill}` : styles.mainGrow}>
        {children}
      </main>
      <PublicFooter title={`Trang thông tin ${brand}`} contact={footerContactLines(settings)} />
    </>
  );
}
