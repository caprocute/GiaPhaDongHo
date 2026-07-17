"use client";

import { useState } from "react";
import { Alert, Button, FormField, Input } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { API_BASE, TREE_SLUG } from "../../src/lib/config";

type Kinship = {
  fromCode?: string;
  fromName?: string;
  toCode?: string;
  toName?: string;
  lcaCode?: string | null;
  relationLabel?: string;
  addressToThem?: string;
  addressFromThem?: string;
  pathCodes?: string[];
};

export function XungHoClient() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [result, setResult] = useState<Kinship | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function calc() {
    if (!API_BASE) {
      setErr("Chưa cấu hình API");
      return;
    }
    setBusy(true);
    setErr(null);
    try {
      const q = new URLSearchParams({ from: from.trim(), to: to.trim() });
      const res = await fetch(
        `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/kinship?${q}`,
      );
      if (!res.ok) {
        setErr((await res.text()).slice(0, 280));
        setResult(null);
        return;
      }
      setResult((await res.json()) as Kinship);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setBusy(false);
    }
  }

  return (
    <PageShell title="Xưng hô dòng họ" lead="Máy tính quan hệ & cách gọi — F2 / R2.5.">
      {err ? (
        <Alert title="Lỗi" variant="error">
          {err}
        </Alert>
      ) : null}
      <div style={{ display: "grid", gap: "var(--spacing-md)", maxWidth: 480 }}>
        <FormField label="Từ (mã hiệu)" required>
          <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="A1" />
        </FormField>
        <FormField label="Đến (mã hiệu)" required>
          <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder="A7" />
        </FormField>
        <Button type="button" disabled={busy || !from.trim() || !to.trim()} onClick={() => void calc()}>
          {busy ? "Đang tính…" : "Tính quan hệ"}
        </Button>
      </div>
      {result ? (
        <div style={{ marginTop: "var(--spacing-lg)", fontFamily: "var(--font-body)" }}>
          <p>
            <strong>{result.fromName}</strong> ({result.fromCode}) → <strong>{result.toName}</strong> (
            {result.toCode})
          </p>
          <p>Quan hệ: {result.relationLabel}</p>
          <p>
            Xưng hô với họ: <strong>{result.addressToThem}</strong> · họ gọi lại:{" "}
            <strong>{result.addressFromThem}</strong>
          </p>
          {result.lcaCode ? <p>Tổ tiên chung (LCA): {result.lcaCode}</p> : null}
          {result.pathCodes?.length ? <p>Đường: {result.pathCodes.join(" → ")}</p> : null}
        </div>
      ) : null}
    </PageShell>
  );
}
