"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PublicFooter, PublicHeader } from "@giapha/ui";
import { convertSolarToLunar, getCanChiYear } from "@giapha/lunar";
import { AuthNav } from "../auth/AuthNav";

function lunarUtilityLabel() {
  const now = new Date();
  const lunar = convertSolarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
  const canChi = getCanChiYear(lunar.year);
  const solar = now.toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
  const day = String(lunar.day).padStart(2, "0");
  const month = String(lunar.month).padStart(2, "0");
  return (
    <>
      {solar} ·{" "}
      <b>
        {day}/{month} {canChi.label} ÂL
        {lunar.leap ? " (nhuận)" : ""}
      </b>
    </>
  );
}

export function PortalChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";

  return (
    <>
      <PublicHeader
        brand="Họ Hoàng – Huỳnh"
        subtitle="Thôn Trung Bính · Bảo Ninh · Đồng Hới"
        activeHref={pathname}
        utilityRight={
          <span style={{ opacity: 0.95 }}>
            {lunarUtilityLabel()}
          </span>
        }
        endSlot={<AuthNav />}
      />
      <main style={{ flex: 1 }}>{children}</main>
      <PublicFooter />
    </>
  );
}
