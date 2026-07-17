"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { convertSolarToLunar } from "@giapha/lunar";
import { EmptyState, FormField, GioCard, Pagination, Select } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import styles from "../../src/chrome/portal.module.css";
import { fetchAnniversariesPage } from "../../src/lib/api";
import type { PageResult } from "../../src/lib/api";
import { demoAnniversaries } from "../../src/lib/demoContent";
import type { ApiAnniversary } from "../../src/lib/types";

const PAGE_SIZE = 20;

function demoResult(month: number, page: number): PageResult<ApiAnniversary> {
  const all = demoAnniversaries(month);
  const start = (page - 1) * PAGE_SIZE;
  return {
    content: all.slice(start, start + PAGE_SIZE),
    totalElements: all.length,
    totalPages: Math.max(1, Math.ceil(all.length / PAGE_SIZE)),
    number: page - 1,
    size: PAGE_SIZE,
  };
}

export function GioClient() {
  const current = useMemo(() => {
    const n = new Date();
    return convertSolarToLunar(n.getDate(), n.getMonth() + 1, n.getFullYear());
  }, []);
  const [month, setMonth] = useState(current.month);
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<PageResult<ApiAnniversary>>(demoResult(current.month, 1));
  const [source, setSource] = useState<"api" | "demo">("demo");

  useEffect(() => {
    setPage(1);
  }, [month]);

  useEffect(() => {
    let cancelled = false;
    void fetchAnniversariesPage(month, page - 1, PAGE_SIZE).then((res) => {
      if (cancelled) return;
      if (res.totalElements > 0) {
        setResult(res);
        setSource("api");
      } else {
        setResult(demoResult(month, page));
        setSource("demo");
      }
    });
    return () => {
      cancelled = true;
    };
  }, [month, page]);

  const { content: rows, totalElements, totalPages } = result;

  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: String(i + 1),
    label: `Tháng ${i + 1} âm`,
  }));

  return (
    <PageShell
      label="Hương hỏa"
      title="Ngày giỗ"
      lead="Tra cứu ngày giỗ theo tháng âm lịch."
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Ngày giỗ" },
      ]}
      toolbarRight={
        <Link href="/persons" className={styles.tool}>Thành viên</Link>
      }
    >
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
        <EmptyState title="Không có giỗ" description="Chưa có bản ghi cho tháng này." />
      ) : (
        <>
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

          <Pagination
            page={page}
            totalPages={totalPages}
            totalItems={source === "api" ? totalElements : undefined}
            pageSize={PAGE_SIZE}
            onPageChange={setPage}
          />
        </>
      )}
    </PageShell>
  );
}
