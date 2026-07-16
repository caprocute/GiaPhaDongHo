"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { convertSolarToLunar } from "@giapha/lunar";
import { EmptyState, FormField, GioCard, Select } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import styles from "../../src/chrome/portal.module.css";
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
    <PageShell
      label="Hương hỏa"
      title="Ngày giỗ"
      lead={`Lọc theo tháng âm — hiện tại lịch: tháng ${current.month}/${current.year} âm${current.leap ? " (nhuận)" : ""}.`}
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Ngày giỗ" },
      ]}
      toolbarRight={
        <Link href="/persons" className={styles.tool}>
          Danh sách thành viên
        </Link>
      }
    >
      <p className={styles.note}>
        {source === "demo" ? "Dữ liệu demo · " : "Nguồn API · "}
        {rows.length} ngày trong tháng {month} âm
      </p>

      <div className={styles.filterBar}>
        <FormField label="Tháng âm">
          <Select
            value={String(month)}
            options={monthOptions}
            onChange={(e) => setMonth(Number(e.target.value))}
          />
        </FormField>
      </div>

      {rows.length === 0 ? (
        <EmptyState title="Không có giỗ" description="Chưa có bản ghi anniversary cho tháng này." />
      ) : (
        <div className={styles.gioGrid}>
          {rows.map((g) => (
            <GioCard
              key={g.id}
              day={String(g.lunarDay).padStart(2, "0")}
              month={`Tháng ${g.lunarMonth} ÂL`}
              name={g.person?.fullName ?? "—"}
              tag={g.note ?? g.person?.code}
            />
          ))}
        </div>
      )}
    </PageShell>
  );
}
