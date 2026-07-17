import { useCallback, useEffect, useState } from "react";
import { PlusCircle, Receipt, RefreshCw, TrendingUp } from "lucide-react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  FormField,
  Input,
  Pagination,
  Select,
  Textarea,
} from "@giapha/ui";
import {
  defaultTreeSlug,
  listCampaignContributions,
  listDonationCampaignsAdmin,
  recordDonationContribution,
  upsertDonationCampaign,
  type DonationCampaignView,
  type DonationContributionDto,
} from "../api/genealogyApi";
import { apiBase, ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

const PAGE_SIZE = 20;

const TABS = [
  { key: "campaigns",     label: "Chiến dịch" },
  { key: "contributions", label: "Đóng góp" },
  { key: "new",           label: "+ Tạo chiến dịch" },
];

const statusLabel: Record<string, string> = {
  open:   "Đang mở",
  draft:  "Nháp",
  closed: "Đã đóng",
};

const statusTone: Record<string, "success" | "warning" | "default"> = {
  open:   "success",
  draft:  "warning",
  closed: "default",
};

function fmtVnd(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

function ProgressBar({ raised, goal }: { raised: number; goal: number | null }) {
  if (!goal || goal <= 0) return null;
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div className="donation-progress">
      <div className="donation-progress-bar" style={{ width: `${pct}%` }} />
      <span className="donation-progress-label">{pct}%</span>
    </div>
  );
}

export function DonationAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  const [tab, setTab] = useState("campaigns");
  const [campaignPage, setCampaignPage] = useState(0);
  const [campaigns, setCampaigns] = useState<DonationCampaignView[]>([]);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  const [contribPage, setContribPage] = useState(0);
  const [contribs, setContribs] = useState<DonationContributionDto[]>([]);
  const [contribTotal, setContribTotal] = useState(0);
  const [contribTotalPages, setContribTotalPages] = useState(1);

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // New campaign form
  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState("open");
  const [vietqr, setVietqr] = useState('{"bankBin":"970418","accountNo":"","accountName":"HOI DONG HO"}');

  // New contribution form
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState("money");
  const [note, setNote] = useState("");

  const reloadCampaigns = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      const r = await listDonationCampaignsAdmin(slug, token, campaignPage, PAGE_SIZE);
      setCampaigns(r.content);
      setCampaignTotal(r.totalElements);
      setCampaignTotalPages(r.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được chiến dịch.");
      setCampaigns([]);
    }
  }, [campaignPage, getAccessToken, slug]);

  const reloadContribs = useCallback(async () => {
    if (selectedCampaignId == null) { setContribs([]); return; }
    setError(null);
    try {
      const token = await getAccessToken();
      const r = await listCampaignContributions(slug, selectedCampaignId, token, contribPage, PAGE_SIZE);
      setContribs(r.content);
      setContribTotal(r.totalElements);
      setContribTotalPages(r.totalPages);
    } catch { setContribs([]); }
  }, [contribPage, getAccessToken, selectedCampaignId, slug]);

  useEffect(() => { void reloadCampaigns(); }, [reloadCampaigns]);
  useEffect(() => { void reloadContribs(); }, [reloadContribs]);
  useEffect(() => { setContribPage(0); }, [selectedCampaignId]);

  async function saveCampaign(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      await upsertDonationCampaign(slug, {
        title: title.trim(),
        goalAmount: goal.trim() ? Number(goal) : null,
        status,
        vietqrPayload: vietqr.trim(),
      }, token);
      setMsg("Đã lưu chiến dịch.");
      setTitle(""); setGoal("");
      setTab("campaigns");
      await reloadCampaigns();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function saveContrib(e: React.FormEvent) {
    e.preventDefault();
    if (selectedCampaignId == null) { setError("Chọn chiến dịch trước."); return; }
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const created = await recordDonationContribution(slug, selectedCampaignId, {
        donorName: donorName.trim(),
        amount: amount.trim() ? Number(amount) : 0,
        kind,
        note: note.trim() || null,
      }, token, true);
      setMsg(`Đã ghi nhận #${created.id ?? "?"}.`);
      setDonorName(""); setAmount(""); setNote("");
      await reloadContribs();
      await reloadCampaigns();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ghi nhận thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function openReceipt(id: number) {
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${apiBase()}/api/v1/trees/${encodeURIComponent(slug)}/donation-contributions/${id}/receipt`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (!res.ok) throw new Error(await res.text());
      const blob = new Blob([await res.text()], { type: "text/html;charset=utf-8" });
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không mở được biên nhận.");
    }
  }

  const campaignOptions = [
    { value: "", label: "— Chọn chiến dịch —" },
    ...campaigns.map((c) => ({
      value: String(c.campaign?.id ?? ""),
      label: c.campaign?.title ?? `#${c.campaign?.id}`,
    })),
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Quỹ công đức"
        description="Tạo chiến dịch gây quỹ, ghi nhận đóng góp và in biên nhận cho thành viên dòng họ."
      />

      {error ? <Alert title="Lỗi" variant="error">{error}</Alert> : null}
      {msg   ? <Alert title="Thành công" variant="success">{msg}</Alert> : null}

      {/* Tab strip */}
      <div className="mod-tabs" role="tablist">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            type="button"
            aria-selected={tab === t.key}
            className={`mod-tab${tab === t.key ? " mod-tab-on" : ""}`}
            onClick={() => setTab(t.key)}
          >
            {t.key === "new" ? <PlusCircle size={14} /> : t.key === "contributions" ? <Receipt size={14} /> : <TrendingUp size={14} />}
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Chiến dịch ── */}
      {tab === "campaigns" ? (
        <>
          {campaigns.length === 0 ? (
            <EmptyState
              title="Chưa có chiến dịch"
              description="Tạo chiến dịch đầu tiên để bắt đầu thu quỹ công đức."
            />
          ) : (
            <>
              <div className="donation-cards">
                {campaigns.map((cv) => {
                  const c = cv.campaign;
                  const raised = Number(c?.raisedAmount ?? 0);
                  const goal = Number(c?.goalAmount ?? 0);
                  const st = (c?.status ?? "open").toLowerCase();
                  return (
                    <div
                      key={c?.id}
                      className={`donation-card${selectedCampaignId === c?.id ? " donation-card-selected" : ""}`}
                      onClick={() => {
                        setSelectedCampaignId(c?.id ?? null);
                        setTab("contributions");
                      }}
                    >
                      <div className="donation-card-head">
                        <h3>{c?.title}</h3>
                        <Badge tone={statusTone[st] ?? "default"}>{statusLabel[st] ?? st}</Badge>
                      </div>
                      <div className="donation-amounts">
                        <span className="donation-raised">{fmtVnd(raised)}</span>
                        {goal > 0 ? <span className="donation-goal"> / {fmtVnd(goal)}</span> : null}
                      </div>
                      <ProgressBar raised={raised} goal={goal || null} />
                    </div>
                  );
                })}
              </div>
              <Pagination
                page={campaignPage + 1}
                totalPages={campaignTotalPages}
                totalItems={campaignTotal}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setCampaignPage(p - 1)}
              />
            </>
          )}
        </>
      ) : null}

      {/* ── Tab: Đóng góp ── */}
      {tab === "contributions" ? (
        <>
          <div className="admin-filter-bar">
            <Select
              aria-label="Chọn chiến dịch"
              value={selectedCampaignId != null ? String(selectedCampaignId) : ""}
              onChange={(e) => setSelectedCampaignId(e.target.value ? Number(e.target.value) : null)}
              options={campaignOptions}
            />
            <Button type="button" variant="secondary" onClick={() => void reloadContribs()}>
              <RefreshCw size={14} />
            </Button>
          </div>

          {selectedCampaignId == null ? (
            <p className="admin-help-text">Chọn chiến dịch để xem đóng góp.</p>
          ) : (
            <>
              {/* Add contribution form */}
              <form onSubmit={saveContrib} className="contrib-form">
                <strong style={{ fontFamily: "var(--font-display)", gridColumn: "1/-1" }}>
                  Ghi nhận đóng góp mới
                </strong>
                <FormField label="Người công đức" required>
                  <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} />
                </FormField>
                <FormField label="Số tiền (VND)">
                  <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" />
                </FormField>
                <FormField label="Loại">
                  <Select
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                    options={[
                      { value: "money",   label: "Tiền mặt" },
                      { value: "goods",   label: "Hiện vật" },
                      { value: "labor",   label: "Công sức" },
                      { value: "pending", label: "Chờ đối soát" },
                    ]}
                  />
                </FormField>
                <FormField label="Ghi chú">
                  <Input value={note} onChange={(e) => setNote(e.target.value)} />
                </FormField>
                <Button type="submit" disabled={busy || !donorName.trim()}>
                  Ghi nhận & cộng quỹ
                </Button>
              </form>

              {/* Contribution list */}
              {contribs.length === 0 ? (
                <EmptyState title="Chưa có đóng góp" description="Ghi nhận đóng góp đầu tiên ở form trên." />
              ) : (
                <>
                  <div className="contrib-list">
                    {contribs.map((c) => (
                      <div key={c.id} className="contrib-row">
                        <div className="contrib-row-left">
                          <div className="contrib-donor">{c.donorName}</div>
                          <div className="contrib-meta">
                            {c.kind === "money" ? "Tiền" : c.kind === "goods" ? "Hiện vật" : c.kind}
                            {c.note ? ` · ${c.note}` : ""}
                          </div>
                        </div>
                        <div className="contrib-amount">{fmtVnd(Number(c.amount ?? 0))}</div>
                        {c.id != null ? (
                          <button
                            type="button"
                            className="contrib-receipt-btn"
                            onClick={() => void openReceipt(c.id!)}
                          >
                            <Receipt size={14} /> Biên nhận
                          </button>
                        ) : null}
                      </div>
                    ))}
                  </div>
                  <Pagination
                    page={contribPage + 1}
                    totalPages={contribTotalPages}
                    totalItems={contribTotal}
                    pageSize={PAGE_SIZE}
                    onPageChange={(p) => setContribPage(p - 1)}
                  />
                </>
              )}
            </>
          )}
        </>
      ) : null}

      {/* ── Tab: Tạo chiến dịch ── */}
      {tab === "new" ? (
        <form onSubmit={saveCampaign} className="admin-form">
          <FormField label="Tiêu đề chiến dịch" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </FormField>
          <FormField label="Mục tiêu (VND)">
            <Input value={goal} onChange={(e) => setGoal(e.target.value)} inputMode="numeric" />
          </FormField>
          <FormField label="Trạng thái">
            <Select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={[
                { value: "open",   label: "Đang mở" },
                { value: "draft",  label: "Nháp" },
                { value: "closed", label: "Đóng" },
              ]}
            />
          </FormField>
          <FormField
            label="Thông tin chuyển khoản (JSON)"
            hint='Định dạng: {"bankBin":"970418","accountNo":"...","accountName":"..."}'
          >
            <Textarea rows={3} value={vietqr} onChange={(e) => setVietqr(e.target.value)} />
          </FormField>
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="submit" disabled={busy || !title.trim()}>
              {busy ? "Đang lưu…" : "Tạo chiến dịch"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setTab("campaigns")}>
              Hủy
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
