"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PublicFooter, PublicHeader } from "@giapha/ui";
import { AuthNav } from "../auth/AuthNav";
import styles from "./PortalChrome.module.css";

export function PortalChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const isLogin = pathname === "/login";
  const isTree = pathname === "/tree" || pathname.startsWith("/tree/");

  if (isLogin) {
    return <main className={styles.mainGrow}>{children}</main>;
  }

  return (
    <>
      <PublicHeader activeHref={pathname} endSlot={<AuthNav />} />
      <main className={isTree ? `${styles.mainGrow} ${styles.mainFill}` : styles.mainGrow}>
        {children}
      </main>
      <PublicFooter />
    </>
  );
}
