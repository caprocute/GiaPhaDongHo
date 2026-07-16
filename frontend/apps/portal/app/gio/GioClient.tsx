"use client";

import { useEffect, useMemo, useState } from "react";
import { convertSolarToLunar } from "@giapha/lunar";
import { Badge, EmptyState, FormField, GioCard, Select } from "@giapha/ui";
import { fetchAnniversaries } from "../../src/lib/api";
import { demoAnniversaries } from "../../src/lib/demoContent";
import type { ApiAnniversary } from "../../src/lib/types";

export function GioClient() {
  const current = useMemo(() => {
    const n = new Date();
    return convertSolarToLunar(n.getDate(), n.getMonth() + 1, n.getFullYear());
  }, []);
  const [month, setMonth] = useState(current.month);
  const [rows, setRows] = useState<ApiAnniversary[]>([]);
  const [source, setSource] = useState<"api" | "demo">("demo");

  useEffect(() => {
    let cancelled = false;
    void fetchAnniversaries(month).then((list) => {
      if (cancelled) return;
      if (list.length) {
        setRows(list);
        setSource("api");
      } else {
        setRows(demoAnniversaries(month));
        setSource("demo");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [month]);

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Tháng ${i + 1} âm`,
  }));

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Ngày giỗ</h1>
        {source === "demo" ? <Badge>Demo</Badge> : <Badge tone="success">API</Badge>}
      </div>
      <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
        Lọc theo tháng âm — hiện tại lịch: tháng {current.month}/{current.year} âm
        {current.leap ? " (nhuận)" : ""}.
      </p>
      <FormField label="Tháng âm">
        <Select
          value={String(month)}
          options={monthOptions}
          onChange={(e) => setMonth(Number(e.target.value))}
        />
      </FormField>
      {rows.length === 0 ? (
        <EmptyState title="Không có giỗ" description="Chưa có bản ghi anniversary cho tháng này." />
      ) : (
        <div style={{ display: "flex", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
          {rows.map((g) => (
            <GioCard
              key={g.id}
              day={String(g.lunarDay).padStart(2, "0")}
              month={`Tháng ${g.lunarMonth} âm`}
              name={g.person?.fullName ?? "—"}
              tag={g.person?.code}
            />
          ))}
        </div>
      )}
    </div>
  );
}
