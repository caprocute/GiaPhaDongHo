"use client";

import { useEffect, useState } from "react";
import { Alert, EmptyState, FormField, HonorBoardCard, Input } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import { API_BASE, TREE_SLUG } from "../../src/lib/config";

type CampaignDto = {
  id?: number;
  title?: string;
  goalAmount?: number | string | null;
  raisedAmount?: number | string | null;
  status?: string | null;
};

type CampaignView = {
  campaign: CampaignDto;
  qrImageUrl?: string | null;
  transferContent?: string | null;
};

type Contribution = {
  id?: number;
  donorName?: string;
  amount?: number | string | null;
  kind?: string | null;
  note?: string | null;
};

export function CongDucClient() {
  const [campaigns, setCampaigns] = useState<CampaignView[]>([]);
  const [honor, setHonor] = useState<Contribution[]>([]);
  const [active, setActive] = useState<CampaignView | null>(null);
  const [amount, setAmount] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!API_BASE) {
      setErr("Chưa cấu hình NEXT_PUBLIC_API_BASE_URL.");
      return;
    }
    void (async () => {
      try {
        const [cRes, hRes] = await Promise.all([
          fetch(`${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/donation-campaigns`),
          fetch(`${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/honor-board`),
        ]);
        if (cRes.ok) setCampaigns((await cRes.json()) as CampaignView[]);
        if (hRes.ok) setHonor((await hRes.json()) as Contribution[]);
      } catch (e) {
        setErr(e instanceof Error ? e.message : "Không tải được quỹ công đức.");
      }
    })();
  }, []);

  useEffect(() => {
    const id = active?.campaign?.id;
    if (id == null || !API_BASE) return;
    const q = amount.trim() ? `?amount=${encodeURIComponent(amount.trim())}` : "";
    let cancelled = false;
    void (async () => {
      const res = await fetch(
        `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/donation-campaigns/${id}${q}`,
      );
      if (!cancelled && res.ok) setActive((await res.json()) as CampaignView);
    })();
    return () => {
      cancelled = true;
    };
    // chỉ refetch khi đổi chiến dịch / số tiền QR
    // eslint-disable-next-line react-hooks/exhaustive-deps -- active object identity thay đổi sau setActive
  }, [amount, active?.campaign?.id]);

  return (
    <PageShell title="Công đức dòng họ" lead="Chiến dịch quyên góp · VietQR · bảng vàng (F4).">
      {err ? (
        <Alert title="Lỗi" variant="error">
          {err}
        </Alert>
      ) : null}

      {campaigns.length === 0 && !err ? (
        <EmptyState title="Chưa có chiến dịch mở" description="Tộc trưởng sẽ mở quỹ khi có công trình." />
      ) : (
        <div style={{ display: "grid", gap: "var(--spacing-lg)" }}>
          <section>
            <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Chiến dịch đang mở</h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "var(--spacing-md) 0 0",
                display: "grid",
                gap: "var(--spacing-sm)",
              }}
            >
              {campaigns.map((c) => (
                <li key={c.campaign.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setActive(c);
                      setAmount("");
                    }}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "var(--spacing-md)",
                      border: "1px solid var(--color-border-subtle)",
                      background:
                        active?.campaign?.id === c.campaign.id
                          ? "var(--color-surface-muted, var(--color-surface-card))"
                          : "var(--color-surface-card)",
                      cursor: "pointer",
                      fontFamily: "var(--font-body)",
                    }}
                  >
                    <strong style={{ fontFamily: "var(--font-display)" }}>{c.campaign.title}</strong>
                    <div style={{ color: "var(--color-text-muted)", marginTop: "var(--spacing-xs)" }}>
                      Đã quyên: {String(c.campaign.raisedAmount ?? 0)}
                      {c.campaign.goalAmount != null ? ` / mục tiêu ${String(c.campaign.goalAmount)}` : ""}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {active ? (
            <section style={{ display: "grid", gap: "var(--spacing-md)", maxWidth: 420 }}>
              <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Chuyển khoản VietQR</h2>
              <p style={{ margin: 0, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                Nội dung CK: <code>{active.transferContent}</code>
              </p>
              <FormField label="Số tiền (tuỳ chọn, để sinh QR)">
                <Input
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  inputMode="numeric"
                  placeholder="500000"
                />
              </FormField>
              {active.qrImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={active.qrImageUrl}
                  alt={`VietQR ${active.campaign.title ?? ""}`}
                  width={320}
                  height={320}
                  style={{ maxWidth: "100%", height: "auto", border: "1px solid var(--color-border-subtle)" }}
                />
              ) : (
                <Alert title="Chưa cấu hình VietQR" variant="info">
                  Thủ quỹ cần bổ sung bankBin / accountNo trên chiến dịch.
                </Alert>
              )}
            </section>
          ) : null}

          <section>
            <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Bảng vàng công đức</h2>
            {honor.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                Chưa có đóng góp được công bố.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
                  gap: "var(--spacing-md)",
                  marginTop: "var(--spacing-md)",
                }}
              >
                {honor.slice(0, 50).map((h) => (
                  <HonorBoardCard
                    key={h.id}
                    name={h.donorName || "Ẩn danh"}
                    detail={[
                      h.amount != null ? String(h.amount) : null,
                      h.kind,
                      h.note,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                    emblem="德"
                  />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </PageShell>
  );
}
