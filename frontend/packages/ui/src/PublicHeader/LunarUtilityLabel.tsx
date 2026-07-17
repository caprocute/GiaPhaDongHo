"use client";

import { convertSolarToLunar, getCanChiYear } from "@giapha/lunar";

/** Ngày dương + âm lịch cho thanh utility header (portal & admin). */
export function LunarUtilityLabel() {
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
    <span style={{ opacity: 0.95 }}>
      {solar} ·{" "}
      <b>
        {day}/{month} {canChi.label} ÂL
        {lunar.leap ? " (nhuận)" : ""}
      </b>
    </span>
  );
}
