"use client";

import { useEffect, useId, useRef, useState } from "react";
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

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtVnd(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu đồng`;
  }
  return amount.toLocaleString("vi-VN") + "đ";
}

function ProgressBar({ raised, goal }: { raised: number; goal: number }) {
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ height: 6, background: "var(--color-border-subtle)", overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            background: "var(--color-heritage-line, var(--color-action-primary-bg))",
            transition: "width .4s",
          }}
        />
      </div>
      <div style={{ fontSize: 11.5, color: "var(--color-text-muted)", marginTop: 3, fontFamily: "var(--font-body)" }}>
        {fmtVnd(raised)} / {fmtVnd(goal)} — {pct}%
      </div>
    </div>
  );
}

/* ── Donation form (per-campaign) ── */
interface DonationFormProps {
  campaign: CampaignView;
  onSuccess: () => void;
}

function DonationForm({ campaign, onSuccess }: DonationFormProps) {
  const formId = useId();
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount]       = useState("");
  const [note, setNote]           = useState("");
  const [busy, setBusy]           = useState(false);
  const [err, setErr]             = useState<string | null>(null);
  const [done, setDone]           = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!donorName.trim()) { setErr("Vui lòng nhập họ tên."); return; }
    if (!API_BASE) { setErr("Chưa cấu hình API."); return; }
    setBusy(true);
    setErr(null);
    try {
      const cid = campaign.campaign.id;
      const body = {
        donorName: donorName.trim(),
        amount:    amount.trim() ? Number(amount.replace(/[^0-9]/g, "")) : null,
        kind:      "money_transfer",
        note:      note.trim() || null,
        isPublic:  true,
      };
      const res = await fetch(
        `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/donation-campaigns/${cid}/contributions?confirm=false`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );
      if (!res.ok) {
        const msg = await res.text();
        throw new Error(msg || `HTTP ${res.status}`);
      }
      setDone(true);
      setDonorName(""); setAmount(""); setNote("");
      onSuccess();
    } catch (ex) {
      setErr(ex instanceof Error ? ex.message : "Đăng ký thất bại, thử lại.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        style={{
          background: "var(--color-status-success-bg)",
          color: "var(--color-status-success-fg)",
          padding: "var(--spacing-md)",
          fontFamily: "var(--font-body)",
          fontSize: 14,
          lineHeight: 1.6,
        }}
      >
        <strong>Cảm ơn bạn đã đăng ký!</strong>
        <br />
        Sau khi thủ quỹ đối chiếu và xác nhận, tên bạn sẽ xuất hiện trên bảng vàng công đức.
        <br />
        <button
          type="button"
          onClick={() => setDone(false)}
          style={{
            marginTop: 8,
            background: "none",
            border: "none",
            color: "var(--color-action-primary-bg)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            fontSize: 13,
            padding: 0,
          }}
        >
          Đăng ký thêm
        </button>
      </div>
    );
  }

  return (
    <form
      id={formId}
      onSubmit={handleSubmit}
      style={{
        background: "var(--color-surface-sunken)",
        border: "1px solid var(--color-border-subtle)",
        padding: "var(--spacing-md)",
        display: "grid",
        gap: "var(--spacing-sm)",
      }}
    >
      <h3
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "0.95rem",
          margin: 0,
          color: "var(--color-text-primary)",
        }}
      >
        Đăng ký đóng góp
      </h3>

      {err ? <Alert title="Lỗi" variant="error">{err}</Alert> : null}

      <FormField label="Họ và tên" required>
        <Input
          value={donorName}
          onChange={(e) => setDonorName(e.target.value)}
          placeholder="Nguyễn Văn A"
        />
      </FormField>

      <FormField label="Số tiền (VND)" hint="Tuỳ chọn — để trống nếu chưa xác định">
        <Input
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          inputMode="numeric"
          placeholder="VD: 1000000"
        />
      </FormField>

      <FormField label="Ghi chú">
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Thay mặt chi họ Hoàng…"
        />
      </FormField>

      <p
        style={{
          fontSize: 12,
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          margin: 0,
        }}
      >
        Vui lòng chuyển khoản theo thông tin bên trên rồi đăng ký để thủ quỹ đối chiếu.
      </p>

      <button
        type="submit"
        disabled={busy || !donorName.trim()}
        style={{
          background: busy || !donorName.trim() ? "var(--color-border-strong)" : "var(--color-action-primary-bg)",
          color: "var(--color-action-primary-fg)",
          border: "none",
          padding: "10px 20px",
          fontFamily: "var(--font-body)",
          fontSize: 13.5,
          fontWeight: 700,
          cursor: busy || !donorName.trim() ? "not-allowed" : "pointer",
          width: "100%",
        }}
      >
        {busy ? "Đang gửi…" : "Đăng ký đóng góp"}
      </button>
    </form>
  );
}

/* ── Campaign card ── */
interface CampaignCardProps {
  cv: CampaignView;
  isActive: boolean;
  onSelect: () => void;
  qrAmountCv: CampaignView | null;
  onQrAmountChange: (v: string) => void;
  qrAmount: string;
  onDonationSuccess: () => void;
}

function CampaignCard({
  cv,
  isActive,
  onSelect,
  qrAmountCv,
  onQrAmountChange,
  qrAmount,
  onDonationSuccess,
}: CampaignCardProps) {
  const c      = cv.campaign;
  const raised = num(c.raisedAmount);
  const goal   = num(c.goalAmount);

  return (
    <li
      style={{
        listStyle: "none",
        border: `${isActive ? 2 : 1}px solid ${isActive ? "var(--color-action-primary-bg)" : "var(--color-border-subtle)"}`,
        background: "var(--color-surface-card)",
        padding: 0,
        overflow: "hidden",
      }}
    >
      {/* Campaign header — clickable */}
      <button
        type="button"
        onClick={onSelect}
        style={{
          display: "block",
          width: "100%",
          textAlign: "left",
          padding: "var(--spacing-md)",
          background: "none",
          border: "none",
          cursor: "pointer",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <strong
            style={{
              fontFamily: "var(--font-display)",
              fontSize: "1rem",
              color: "var(--color-text-primary)",
              lineHeight: 1.3,
            }}
          >
            {c.title}
          </strong>
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              padding: "2px 9px",
              background: "var(--color-status-success-bg)",
              color: "var(--color-status-success-fg)",
              flexShrink: 0,
              fontFamily: "var(--font-body)",
            }}
          >
            Đang mở
          </span>
        </div>
        {goal > 0 && <ProgressBar raised={raised} goal={goal} />}
      </button>

      {/* Expanded panel */}
      {isActive && (
        <div
          style={{
            borderTop: "1px solid var(--color-border-subtle)",
            display: "grid",
            gap: "var(--spacing-md)",
            padding: "var(--spacing-md)",
          }}
        >
          {/* VietQR */}
          <div>
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "0.9rem",
                margin: "0 0 var(--spacing-sm)",
              }}
            >
              Thông tin chuyển khoản
            </h3>
            <p
              style={{
                margin: "0 0 var(--spacing-sm)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
                fontSize: 13.5,
                lineHeight: 1.6,
              }}
            >
              Nội dung CK:{" "}
              <code
                style={{
                  background: "var(--color-surface-sunken)",
                  padding: "2px 6px",
                  fontFamily: "ui-monospace, monospace",
                  fontSize: 12.5,
                  border: "1px solid var(--color-border-subtle)",
                }}
              >
                {(qrAmountCv ?? cv).transferContent ?? "—"}
              </code>
            </p>
            <FormField label="Số tiền (để sinh QR chính xác)">
              <Input
                value={qrAmount}
                onChange={(e) => onQrAmountChange(e.target.value)}
                inputMode="numeric"
                placeholder="500000"
              />
            </FormField>
            {(qrAmountCv ?? cv).qrImageUrl ? (
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={(qrAmountCv ?? cv).qrImageUrl!}
                  alt={`VietQR ${c.title ?? ""}`}
                  width={240}
                  height={240}
                  style={{
                    maxWidth: "100%",
                    height: "auto",
                    border: "1px solid var(--color-border-subtle)",
                    display: "block",
                  }}
                />
              </div>
            ) : (
              <Alert title="Chưa cấu hình VietQR" variant="info">
                Thủ quỹ sẽ bổ sung thông tin tài khoản sớm.
              </Alert>
            )}
          </div>

          {/* Donation form */}
          <DonationForm campaign={cv} onSuccess={onDonationSuccess} />
        </div>
      )}
    </li>
  );
}

/* ── Main client component ── */
export function CongDucClient() {
  const [campaigns, setCampaigns]           = useState<CampaignView[]>([]);
  const [honor, setHonor]                   = useState<Contribution[]>([]);
  const [active, setActive]                 = useState<CampaignView | null>(null);
  const [qrCampaign, setQrCampaign]         = useState<CampaignView | null>(null);
  const [qrAmount, setQrAmount]             = useState("");
  const [err, setErr]                       = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!API_BASE) { setErr("Chưa cấu hình NEXT_PUBLIC_API_BASE_URL."); return; }
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

  /* Debounced QR refresh when amount changes */
  function handleQrAmountChange(v: string) {
    setQrAmount(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      if (!active?.campaign?.id || !API_BASE) return;
      const q = v.trim() ? `?amount=${encodeURIComponent(v.trim())}` : "";
      void (async () => {
        const res = await fetch(
          `${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/donation-campaigns/${active.campaign.id}${q}`,
        );
        if (res.ok) setQrCampaign((await res.json()) as CampaignView);
      })();
    }, 600);
  }

  function selectCampaign(cv: CampaignView) {
    if (active?.campaign?.id === cv.campaign?.id) {
      setActive(null);
      setQrCampaign(null);
      setQrAmount("");
    } else {
      setActive(cv);
      setQrCampaign(null);
      setQrAmount("");
    }
  }

  return (
    <PageShell title="Công đức dòng họ" lead="Chiến dịch quyên góp · VietQR · Bảng vàng công đức.">
      {err ? (
        <Alert title="Lỗi" variant="error">{err}</Alert>
      ) : null}

      {campaigns.length === 0 && !err ? (
        <EmptyState
          title="Chưa có chiến dịch mở"
          description="Tộc trưởng sẽ mở quỹ khi có công trình cần huy động."
        />
      ) : (
        <div style={{ display: "grid", gap: "var(--spacing-xl, 40px)" }}>

          {/* Active campaigns */}
          <section>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                margin: "0 0 var(--spacing-md)",
              }}
            >
              Chiến dịch đang mở
            </h2>
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "grid",
                gap: "var(--spacing-sm)",
              }}
            >
              {campaigns.map((cv) => (
                <CampaignCard
                  key={cv.campaign.id}
                  cv={cv}
                  isActive={active?.campaign?.id === cv.campaign?.id}
                  onSelect={() => selectCampaign(cv)}
                  qrAmountCv={qrCampaign?.campaign?.id === cv.campaign?.id ? qrCampaign : null}
                  qrAmount={active?.campaign?.id === cv.campaign?.id ? qrAmount : ""}
                  onQrAmountChange={handleQrAmountChange}
                  onDonationSuccess={() => {/* no-op: list refresh handled by next page load */}}
                />
              ))}
            </ul>
          </section>

          {/* Honor board */}
          <section>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "1.25rem",
                margin: "0 0 var(--spacing-md)",
              }}
            >
              Bảng vàng công đức
            </h2>
            {honor.length === 0 ? (
              <p
                style={{
                  color: "var(--color-text-muted)",
                  fontFamily: "var(--font-body)",
                  fontSize: 14,
                }}
              >
                Chưa có đóng góp được công bố.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                  gap: "var(--spacing-md)",
                }}
              >
                {honor.slice(0, 60).map((h) => (
                  <HonorBoardCard
                    key={h.id}
                    name={h.donorName || "Ẩn danh"}
                    detail={[
                      h.amount != null && num(h.amount) > 0 ? fmtVnd(num(h.amount)) : null,
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
