import { useCallback, useEffect, useRef, useState } from "react";
import { CheckCircle, PlusCircle, Receipt, RefreshCw, TrendingUp, XCircle } from "lucide-react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
  Button,
  Dialog,
  EmptyState,
  FormField,
  Input,
  Pagination,
  Select,
  StatCard,
  Switch,
} from "@giapha/ui";
import {
  confirmContribution,
  defaultTreeSlug,
  listCampaignContributions,
  listDonationCampaignsAdmin,
  recordDonationContribution,
  rejectContribution,
  upsertDonationCampaign,
  type DonationCampaignDto,
  type DonationCampaignView,
  type DonationContributionDto,
} from "../api/genealogyApi";
import { apiBase, ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

const PAGE_SIZE = 20;

const STATUS_LABEL: Record<string, string> = {
  open:   "Đang mở",
  draft:  "Nháp",
  closed: "Đã đóng",
};

type BadgeTone = "success" | "warning" | "error" | "accent" | "default";

const STATUS_TONE: Record<string, BadgeTone> = {
  open:   "success",
  draft:  "warning",
  closed: "default",
};

const CONTRIB_STATUS_LABEL: Record<string, string> = {
  confirmed:         "Đã xác nhận",
  pending_portal:    "Chờ xác nhận",
  pending_reconcile: "Chờ đối soát",
  rejected:          "Từ chối",
};

const CONTRIB_STATUS_TONE: Record<string, BadgeTone> = {
  confirmed:         "success",
  pending_portal:    "warning",
  pending_reconcile: "accent",
  rejected:          "error",
};

const KIND_LABEL: Record<string, string> = {
  money_cash:     "Tiền mặt",
  cash:           "Tiền mặt",
  money_transfer: "Chuyển khoản",
  transfer:       "Chuyển khoản",
  goods:          "Hiện vật",
  labor:          "Công sức",
  pending:        "Chờ đối soát",
};

/** Mục đích quỹ — khớp DonationStatuses.PURPOSE_* (BE). */
const PURPOSE_OPTIONS = [
  { value: "general", label: "Công đức / công trình chung" },
  { value: "scholarship", label: "Quỹ khuyến học (trao học bổng)" },
  { value: "tomb", label: "Tôn tạo lăng mộ / mộ phần" },
  { value: "ancestral_house", label: "Nhà thờ họ / từ đường" },
  { value: "genealogy", label: "Biên soạn / in ấn gia phả" },
  { value: "event", label: "Sự kiện / giỗ tổ / lễ hội" },
  { value: "relief", label: "Cứu trợ / hỗ trợ thành viên" },
  { value: "other", label: "Mục đích khác" },
] as const;

const PURPOSE_LABEL: Record<string, string> = Object.fromEntries(
  PURPOSE_OPTIONS.map((o) => [o.value, o.label]),
);

const PURPOSE_BADGE: Record<string, string> = {
  general: "Chung",
  scholarship: "Khuyến học",
  tomb: "Lăng mộ",
  ancestral_house: "Nhà thờ",
  genealogy: "Gia phả",
  event: "Sự kiện",
  relief: "Cứu trợ",
  other: "Khác",
};

const PURPOSE_TONE: Record<string, BadgeTone> = {
  general: "default",
  scholarship: "warning",
  tomb: "accent",
  ancestral_house: "accent",
  genealogy: "success",
  event: "success",
  relief: "error",
  other: "default",
};

const BANK_OPTIONS = [
  { value: "",       label: "— Chọn ngân hàng —" },
  { value: "970436", label: "Vietcombank (970436)" },
  { value: "970418", label: "BIDV (970418)" },
  { value: "970405", label: "Agribank (970405)" },
  { value: "970407", label: "Techcombank (970407)" },
  { value: "970403", label: "Sacombank (970403)" },
  { value: "970422", label: "MB Bank (970422)" },
  { value: "970432", label: "VPBank (970432)" },
];

const KIND_OPTIONS = [
  { value: "money_cash",     label: "Tiền mặt" },
  { value: "money_transfer", label: "Chuyển khoản" },
  { value: "goods",          label: "Hiện vật" },
  { value: "labor",          label: "Công sức" },
];

type VietQrConfig = { bankBin?: string; accountNo?: string; accountName?: string };

function parseVietQr(payload: string | null | undefined): VietQrConfig {
  if (!payload) return {};
  try {
    return JSON.parse(payload) as VietQrConfig;
  } catch {
    return {};
  }
}

function num(v: number | string | null | undefined): number {
  if (v == null) return 0;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function fmtVnd(amount: number): string {
  return amount.toLocaleString("vi-VN") + "đ";
}

function fmtMillions(amount: number): string {
  if (amount >= 1_000_000_000) {
    return `${(amount / 1_000_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} tỷ`;
  }
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toLocaleString("vi-VN", { maximumFractionDigits: 1 })} triệu`;
  }
  return fmtVnd(amount);
}

function fmtDate(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}

/* ── Mini progress bar (sidebar) ── */
function MiniProgress({ raised, goal }: { raised: number; goal: number | null }) {
  if (!goal || goal <= 0) return null;
  const pct = Math.min(100, Math.round((raised / goal) * 100));
  return (
    <div className="fund-mini-progress-wrap">
      <div className="fund-mini-progress-bar" style={{ width: `${pct}%` }} />
    </div>
  );
}

/* ── Full progress section (detail) ── */
function ProgressSection({ cv }: { cv: DonationCampaignView }) {
  const raised = num(cv.campaign.raisedAmount);
  const goal   = num(cv.campaign.goalAmount);
  const pct    = goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : null;

  return (
    <div className="fund-progress-section">
      <div className="fund-raised-row">
        <span className="fund-raised-amount">{fmtVnd(raised)}</span>
        {goal > 0 && (
          <span className="fund-goal-text">đã thu / Mục tiêu: {fmtMillions(goal)}</span>
        )}
      </div>
      {pct != null && (
        <>
          <div className="fund-progress-wrap">
            <div className="fund-progress-bar" style={{ width: `${pct}%` }} />
          </div>
          <div className="fund-progress-pct">{pct}% hoàn thành</div>
        </>
      )}
    </div>
  );
}

/* ── VietQR section ── */
function VietQrSection({ cv }: { cv: DonationCampaignView }) {
  const qr        = parseVietQr(cv.campaign.vietqrPayload);
  const hasConfig = !!(qr.bankBin && qr.accountNo);
  const bankLabel = BANK_OPTIONS.find((b) => b.value === qr.bankBin)?.label?.split(" (")[0];

  return (
    <div className="fund-qr-section">
      <div className="fund-qr-label">Thông tin chuyển khoản</div>
      <div className="fund-qr-box">
        {cv.qrImageUrl ? (
          <img src={cv.qrImageUrl} alt="VietQR" className="fund-qr-img" width={80} height={80} />
        ) : (
          <div className="fund-qr-img-placeholder">
            {hasConfig ? "Đang tạo QR…" : "Chưa cấu hình"}
          </div>
        )}
        <div className="fund-qr-info">
          {hasConfig ? (
            <>
              <div>
                <strong>{bankLabel ?? qr.bankBin}</strong>
                {" — "}
                <strong>{qr.accountNo}</strong>
              </div>
              {qr.accountName && <div>{qr.accountName}</div>}
              {cv.transferContent && (
                <div style={{ marginTop: 4 }}>
                  Nội dung:{" "}
                  <span className="fund-qr-content-code">{cv.transferContent}</span>
                </div>
              )}
            </>
          ) : (
            <em style={{ color: "var(--color-text-muted)" }}>
              Chưa cấu hình thông tin ngân hàng — bấm Sửa để thêm.
            </em>
          )}
        </div>
        {cv.qrImageUrl && (
          <a
            href={cv.qrImageUrl}
            download="vietqr.png"
            style={{
              fontSize: 12,
              padding: "5px 12px",
              border: "1px solid var(--color-border-strong)",
              color: "var(--color-text-muted)",
              textDecoration: "none",
              fontFamily: "var(--font-body)",
              flexShrink: 0,
              display: "inline-flex",
              alignItems: "center",
            }}
          >
            Tải QR
          </a>
        )}
      </div>
    </div>
  );
}

/* ── Campaign dialog (create / edit) ── */
type CampaignForm = {
  id?: number;
  title: string;
  goal: string;
  status: string;
  purpose: string;
  bankBin: string;
  accountNo: string;
  accountName: string;
};

function initForm(c?: DonationCampaignDto): CampaignForm {
  const qr = parseVietQr(c?.vietqrPayload);
  return {
    id:          c?.id,
    title:       c?.title ?? "",
    goal:        c?.goalAmount != null ? String(c.goalAmount) : "",
    status:      c?.status ?? "open",
    purpose:     PURPOSE_LABEL[c?.purpose ?? ""] ? (c!.purpose as string) : "general",
    bankBin:     qr.bankBin ?? "",
    accountNo:   qr.accountNo ?? "",
    accountName: qr.accountName ?? "",
  };
}

interface CampaignDialogProps {
  open: boolean;
  initial?: DonationCampaignDto;
  slug: string;
  onClose: () => void;
  onSaved: () => Promise<void>;
  getToken: () => Promise<string | null>;
}

function CampaignDialog({ open, initial, slug, onClose, onSaved, getToken }: CampaignDialogProps) {
  const [form, setForm] = useState<CampaignForm>(initForm(initial));
  const [busy, setBusy] = useState(false);
  const [err, setErr]   = useState<string | null>(null);

  useEffect(() => {
    if (open) { setForm(initForm(initial)); setErr(null); }
  }, [open, initial]);

  function patch(key: keyof CampaignForm, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setErr("Nhập tiêu đề chiến dịch."); return; }
    setBusy(true);
    setErr(null);
    try {
      const vqr: VietQrConfig = {};
      if (form.bankBin)    vqr.bankBin    = form.bankBin;
      if (form.accountNo)  vqr.accountNo  = form.accountNo;
      if (form.accountName) vqr.accountName = form.accountName;

      const token = await getToken();
      await upsertDonationCampaign(slug, {
        id:           form.id,
        title:        form.title.trim(),
        goalAmount:   form.goal.trim() ? Number(form.goal.replace(/[^0-9]/g, "")) : null,
        status:       form.status,
        purpose:      form.purpose,
        vietqrPayload: Object.keys(vqr).length > 0 ? JSON.stringify(vqr) : null,
      }, token);
      await onSaved();
      onClose();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Lưu thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog
      open={open}
      title={form.id ? "Sửa chiến dịch" : "Tạo chiến dịch mới"}
      onClose={onClose}
      size="md"
      footer={
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <Button type="submit" form="campaign-dlg-form" disabled={busy}>
            {busy ? "Đang lưu…" : form.id ? "Cập nhật" : "Tạo chiến dịch"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
        </div>
      }
    >
      <form id="campaign-dlg-form" onSubmit={handleSubmit} className="admin-form">
        {err ? <Alert title="Lỗi" variant="error">{err}</Alert> : null}

        <FormField label="Tiêu đề chiến dịch" required>
          <Input value={form.title} onChange={(e) => patch("title", e.target.value)} autoFocus />
        </FormField>

        <FormField label="Mục đích quỹ" required>
          <Select
            value={form.purpose}
            onChange={(e) => patch("purpose", e.target.value)}
            options={[...PURPOSE_OPTIONS]}
          />
        </FormField>

        <div className="admin-form-grid">
          <FormField label="Mục tiêu (VND)">
            <Input
              value={form.goal}
              onChange={(e) => patch("goal", e.target.value)}
              inputMode="numeric"
              placeholder="VD: 200000000"
            />
          </FormField>
          <FormField label="Trạng thái">
            <Select
              value={form.status}
              onChange={(e) => patch("status", e.target.value)}
              options={[
                { value: "open",   label: "Đang mở" },
                { value: "draft",  label: "Nháp" },
                { value: "closed", label: "Đã đóng" },
              ]}
            />
          </FormField>
        </div>

        <div className="fund-dlg-section-label">Thông tin chuyển khoản VietQR</div>

        <FormField label="Ngân hàng">
          <Select
            value={form.bankBin}
            onChange={(e) => patch("bankBin", e.target.value)}
            options={BANK_OPTIONS}
          />
        </FormField>

        <div className="admin-form-grid">
          <FormField label="Số tài khoản">
            <Input value={form.accountNo} onChange={(e) => patch("accountNo", e.target.value)} placeholder="VD: 1234567890" />
          </FormField>
          <FormField label="Tên tài khoản">
            <Input value={form.accountName} onChange={(e) => patch("accountName", e.target.value)} placeholder="HỘI ĐỒNG HỌ..." />
          </FormField>
        </div>
      </form>
    </Dialog>
  );
}

/* ── Add contribution inline form ── */
interface AddFormProps {
  campaignId: number;
  slug: string;
  getToken: () => Promise<string | null>;
  onSaved: () => Promise<void>;
  onClose: () => void;
}

function AddContribForm({ campaignId, slug, getToken, onSaved, onClose }: AddFormProps) {
  const [donorName, setDonorName] = useState("");
  const [amount, setAmount]       = useState("");
  const [kind, setKind]           = useState("money_cash");
  const [note, setNote]           = useState("");
  const [isPublic, setIsPublic]   = useState(true);
  const [busy, setBusy]           = useState(false);
  const [err, setErr]             = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!donorName.trim()) { setErr("Nhập tên người công đức."); return; }
    setBusy(true);
    setErr(null);
    try {
      const token = await getToken();
      await recordDonationContribution(
        slug,
        campaignId,
        {
          donorName: donorName.trim(),
          amount:    amount.trim() ? Number(amount.replace(/[^0-9]/g, "")) : 0,
          kind,
          note:      note.trim() || null,
          isPublic,
        },
        token,
        true,
      );
      setDonorName(""); setAmount(""); setNote(""); setIsPublic(true);
      await onSaved();
    } catch (ex) {
      setErr(ex instanceof ApiError ? ex.message : "Ghi nhận thất bại.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fund-add-form">
      <div className="fund-add-form-title">Ghi nhận đóng góp mới</div>
      {err ? (
        <div style={{ marginBottom: "var(--spacing-sm)" }}>
          <Alert title="Lỗi" variant="error">{err}</Alert>
        </div>
      ) : null}
      <form onSubmit={handleSubmit}>
        <div className="fund-add-form-grid">
          <FormField label="Người công đức" required>
            <Input
              value={donorName}
              onChange={(e) => setDonorName(e.target.value)}
              placeholder="Họ tên hoặc mã thành viên…"
              autoFocus
            />
          </FormField>
          <FormField label="Số tiền (VND)">
            <Input
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="numeric"
              placeholder="VD: 1000000"
            />
          </FormField>
          <FormField label="Loại">
            <Select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              options={KIND_OPTIONS}
            />
          </FormField>
          <FormField label="Ghi chú">
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Thay mặt chi họ…"
            />
          </FormField>
        </div>
        <div style={{ marginBottom: "var(--spacing-sm)" }}>
          <Switch
            label="Hiển thị trên bảng vàng công đức (portal)"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
          />
        </div>
        <div className="fund-add-form-actions">
          <Button type="submit" disabled={busy || !donorName.trim()}>
            {busy ? "Đang lưu…" : "Ghi nhận & cộng quỹ"}
          </Button>
          <Button type="button" variant="secondary" onClick={onClose}>Hủy</Button>
        </div>
      </form>
    </div>
  );
}

/* ── Contribution table ── */
interface ContribTableProps {
  contribs: DonationContributionDto[];
  busyId: number | null;
  onConfirm: (id: number) => void;
  onReject:  (id: number) => void;
  onReceipt: (id: number) => void;
}

function ContribTable({ contribs, busyId, onConfirm, onReject, onReceipt }: ContribTableProps) {
  if (contribs.length === 0) {
    return (
      <EmptyState
        title="Chưa có đóng góp"
        description="Ghi nhận đóng góp bằng nút phía trên, hoặc thành viên đăng ký qua portal."
      />
    );
  }

  return (
    <div className="fund-contrib-table">
      <div className="fund-contrib-thead" aria-hidden>
        <span>Người công đức</span>
        <span>Số tiền</span>
        <span>Loại</span>
        <span>Trạng thái</span>
        <span>Ngày</span>
        <span>Thao tác</span>
      </div>
      {contribs.map((c) => {
        const st = c.status ?? "confirmed";
        const isPending   = st === "pending_portal" || st === "pending_reconcile";
        const isConfirmed = st === "confirmed";

        return (
          <div key={c.id} className="fund-contrib-row">
            <div>
              <div className="fund-contrib-donor">{c.donorName}</div>
              {c.note ? <div className="fund-contrib-note">{c.note}</div> : null}
            </div>
            <div className="fund-contrib-amount">
              {num(c.amount) > 0 ? fmtVnd(num(c.amount)) : "—"}
            </div>
            <div>
              <span style={{
                fontSize: 10.5,
                fontWeight: 600,
                padding: "2px 7px",
                background: "var(--color-surface-sunken)",
                color: "var(--color-text-muted)",
                fontFamily: "var(--font-body)",
                display: "inline-block",
              }}>
                {KIND_LABEL[c.kind ?? ""] ?? c.kind ?? "—"}
              </span>
            </div>
            <div>
              <Badge tone={CONTRIB_STATUS_TONE[st] ?? "default"}>
                {CONTRIB_STATUS_LABEL[st] ?? st}
              </Badge>
            </div>
            <div style={{ fontSize: 12, color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              {fmtDate(c.createdAt)}
            </div>
            <div className="fund-contrib-acts">
              {isPending && c.id != null && (
                <>
                  <button
                    type="button"
                    className="fund-action-btn fund-action-btn-confirm"
                    disabled={busyId === c.id}
                    onClick={() => c.id != null && onConfirm(c.id)}
                    title="Xác nhận đóng góp"
                  >
                    <CheckCircle size={12} /> Xác nhận
                  </button>
                  <button
                    type="button"
                    className="fund-action-btn fund-action-btn-reject"
                    disabled={busyId === c.id}
                    onClick={() => c.id != null && onReject(c.id)}
                    title="Từ chối"
                  >
                    <XCircle size={12} />
                  </button>
                </>
              )}
              {isConfirmed && c.id != null && (
                <button
                  type="button"
                  className="fund-action-btn fund-action-btn-receipt"
                  onClick={() => c.id != null && onReceipt(c.id)}
                  title="In biên nhận"
                >
                  <Receipt size={12} /> Biên nhận
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

/* ── Campaign sidebar item ── */
function CampaignItem({ cv, selected, onClick }: {
  cv: DonationCampaignView;
  selected: boolean;
  onClick: () => void;
}) {
  const c      = cv.campaign;
  const raised = num(c.raisedAmount);
  const goal   = num(c.goalAmount);
  const st     = (c.status ?? "draft").toLowerCase();

  return (
    <button
      type="button"
      className={`fund-campaign-item${selected ? " fund-campaign-item-on" : ""}`}
      onClick={onClick}
    >
      <div className="fund-campaign-item-top">
        <span className="fund-campaign-name">{c.title}</span>
        <span style={{ flexShrink: 0, display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
          {c.purpose && c.purpose !== "general" ? (
            <Badge tone={PURPOSE_TONE[c.purpose] ?? "default"}>
              {PURPOSE_BADGE[c.purpose] ?? PURPOSE_LABEL[c.purpose] ?? c.purpose}
            </Badge>
          ) : null}
          <Badge tone={STATUS_TONE[st] ?? "default"}>
            {STATUS_LABEL[st] ?? st}
          </Badge>
        </span>
      </div>
      <div className="fund-campaign-raised-mini">
        {fmtVnd(raised)}{goal > 0 ? ` / ${fmtMillions(goal)}` : ""}
      </div>
      <MiniProgress raised={raised} goal={goal > 0 ? goal : null} />
    </button>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════ */
export function DonationAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  /* Campaign state */
  const [campaigns, setCampaigns]     = useState<DonationCampaignView[]>([]);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [campaignPage, setCampaignPage]   = useState(0);
  const [selectedCv, setSelectedCv]       = useState<DonationCampaignView | null>(null);

  /* Contribution state */
  const [contribs, setContribs]           = useState<DonationContributionDto[]>([]);
  const [contribTotal, setContribTotal]   = useState(0);
  const [contribTotalPages, setContribTotalPages] = useState(1);
  const [contribPage, setContribPage]     = useState(0);
  const [contribStatus, setContribStatus] = useState("");
  const [contribKind, setContribKind]     = useState("");
  const [contribSearch, setContribSearch] = useState("");

  /* Pending count for tab badge */
  const [pendingCount, setPendingCount]   = useState(0);

  /* UI state */
  const [showAddForm, setShowAddForm]     = useState(false);
  const [showDlg, setShowDlg]             = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<DonationCampaignDto | undefined>();

  /* Messages */
  const [pageError, setPageError]         = useState<string | null>(null);
  const [pageMsg, setPageMsg]             = useState<string | null>(null);
  const [busyId, setBusyId]               = useState<number | null>(null);

  /* Derived totals */
  const totalRaised = campaigns.reduce((s, cv) => s + num(cv.campaign.raisedAmount), 0);
  const openCount   = campaigns.filter((cv) => cv.campaign.status === "open").length;

  /* Load campaigns */
  const reloadCampaigns = useCallback(async () => {
    setPageError(null);
    try {
      const token = await getAccessToken();
      const r = await listDonationCampaignsAdmin(slug, token, campaignPage, PAGE_SIZE);
      setCampaigns(r.content);
      setCampaignTotal(r.totalElements);
      /* Keep selected in sync */
      setSelectedCv((prev) => {
        if (!prev) return prev;
        return r.content.find((cv) => cv.campaign.id === prev.campaign.id) ?? prev;
      });
    } catch (e) {
      setPageError(e instanceof ApiError ? e.message : "Không tải được chiến dịch.");
    }
  }, [campaignPage, getAccessToken, slug]);

  /* Load contributions */
  const reloadContribs = useCallback(async () => {
    const cid = selectedCv?.campaign?.id;
    if (cid == null) { setContribs([]); return; }
    try {
      const token  = await getAccessToken();
      const filter = {
        status: contribStatus || undefined,
        kind:   contribKind   || undefined,
        search: contribSearch || undefined,
      };
      const r = await listCampaignContributions(slug, cid, token, contribPage, PAGE_SIZE, filter);
      setContribs(r.content);
      setContribTotal(r.totalElements);
      setContribTotalPages(r.totalPages);
      /* Count pending for badge (only meaningful when showing all) */
      if (!contribStatus) {
        const p = r.content.filter(
          (c) => c.status === "pending_portal" || c.status === "pending_reconcile",
        ).length;
        setPendingCount(p);
      }
    } catch {
      setContribs([]);
    }
  }, [selectedCv, slug, getAccessToken, contribPage, contribStatus, contribKind, contribSearch]);

  useEffect(() => { void reloadCampaigns(); }, [reloadCampaigns]);
  useEffect(() => { setContribPage(0); }, [selectedCv, contribStatus, contribKind, contribSearch]);
  useEffect(() => { void reloadContribs(); }, [reloadContribs]);

  /* Debounced search */
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  function handleSearchChange(v: string) {
    setContribSearch(v);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setContribPage(0); }, 350);
  }

  /* Open receipt */
  async function openReceipt(contribId: number) {
    const cid = selectedCv?.campaign?.id;
    if (cid == null) return;
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${apiBase()}/api/v1/trees/${encodeURIComponent(slug)}/donation-campaigns/${cid}/contributions/${contribId}/receipt`,
        { headers: token ? { Authorization: `Bearer ${token}` } : {} },
      );
      if (!res.ok) throw new Error(await res.text());
      const blob = new Blob([await res.text()], { type: "text/html;charset=utf-8" });
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
    } catch (e) {
      setPageError(e instanceof Error ? e.message : "Không mở được biên nhận.");
    }
  }

  /* Confirm */
  async function handleConfirm(contribId: number) {
    const cid = selectedCv?.campaign?.id;
    if (cid == null) return;
    setBusyId(contribId);
    setPageError(null);
    try {
      const token = await getAccessToken();
      await confirmContribution(slug, cid, contribId, token);
      setPageMsg("Đã xác nhận đóng góp.");
      await Promise.all([reloadContribs(), reloadCampaigns()]);
    } catch (e) {
      setPageError(e instanceof ApiError ? e.message : "Xác nhận thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  /* Reject */
  async function handleReject(contribId: number) {
    const cid = selectedCv?.campaign?.id;
    if (cid == null) return;
    setBusyId(contribId);
    setPageError(null);
    try {
      const token = await getAccessToken();
      await rejectContribution(slug, cid, contribId, token);
      setPageMsg("Đã từ chối đóng góp.");
      await reloadContribs();
    } catch (e) {
      setPageError(e instanceof ApiError ? e.message : "Từ chối thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  /* Toggle campaign open/closed */
  async function toggleStatus() {
    const c = selectedCv?.campaign;
    if (!c?.id) return;
    try {
      const token     = await getAccessToken();
      const newStatus = c.status === "open" ? "closed" : "open";
      await upsertDonationCampaign(slug, { ...c, status: newStatus }, token);
      await reloadCampaigns();
    } catch (e) {
      setPageError(e instanceof ApiError ? e.message : "Cập nhật trạng thái thất bại.");
    }
  }

  const campaignTotalPages = Math.max(1, Math.ceil(campaignTotal / PAGE_SIZE));
  const stCurrent = (selectedCv?.campaign?.status ?? "draft").toLowerCase();

  const CONTRIB_TABS = [
    { key: "",                label: "Tất cả" },
    { key: "pending_portal",  label: "Chờ xác nhận", count: pendingCount },
    { key: "confirmed",       label: "Đã xác nhận" },
    { key: "rejected",        label: "Từ chối" },
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Quỹ công đức"
        description="Quản lý chiến dịch gây quỹ, ghi nhận đóng góp và in biên nhận cho thành viên dòng họ."
        actions={
          <Button onClick={() => { setEditingCampaign(undefined); setShowDlg(true); }}>
            <PlusCircle size={14} />
            Tạo chiến dịch
          </Button>
        }
      />

      {pageError ? (
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          <Alert title="Lỗi" variant="error">{pageError}</Alert>
          <button
            type="button"
            onClick={() => setPageError(null)}
            aria-label="Đóng"
            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0 10px", color: "var(--color-text-muted)", fontSize: 18, lineHeight: 1 }}
          >×</button>
        </div>
      ) : null}
      {pageMsg ? (
        <div style={{ display: "flex", alignItems: "stretch", gap: 0 }}>
          <Alert title="Thành công" variant="success">{pageMsg}</Alert>
          <button
            type="button"
            onClick={() => setPageMsg(null)}
            aria-label="Đóng"
            style={{ border: "none", background: "transparent", cursor: "pointer", padding: "0 10px", color: "var(--color-text-muted)", fontSize: 18, lineHeight: 1 }}
          >×</button>
        </div>
      ) : null}

      {/* Stats */}
      <div className="fund-stats">
        <StatCard label="Tổng quỹ đã thu" value={fmtMillions(totalRaised)} />
        <StatCard label="Chiến dịch đang mở" value={openCount > 0 ? String(openCount) : "—"} />
        <StatCard label="Bản ghi đóng góp" value={contribTotal > 0 ? String(contribTotal) : "—"} />
        <StatCard label="Chờ xác nhận" value={String(pendingCount)} />
      </div>

      {/* Master-detail */}
      <div className="fund-layout">

        {/* Campaign sidebar */}
        <aside className="fund-sidebar">
          <div className="fund-sidebar-head">
            <span className="fund-sidebar-label">Chiến dịch ({campaignTotal})</span>
            <button
              type="button"
              className="fund-action-btn"
              style={{ border: "none" }}
              onClick={() => void reloadCampaigns()}
              title="Tải lại"
            >
              <RefreshCw size={13} />
            </button>
          </div>

          <div className="fund-campaign-list">
            {campaigns.length === 0 ? (
              <div className="fund-sidebar-empty">
                Chưa có chiến dịch.<br />
                <button
                  type="button"
                  style={{ marginTop: 8, fontSize: 12, color: "var(--color-action-primary-bg)", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-body)" }}
                  onClick={() => { setEditingCampaign(undefined); setShowDlg(true); }}
                >
                  + Tạo chiến dịch đầu tiên
                </button>
              </div>
            ) : (
              campaigns.map((cv) => (
                <CampaignItem
                  key={cv.campaign.id}
                  cv={cv}
                  selected={selectedCv?.campaign?.id === cv.campaign.id}
                  onClick={() => {
                    setSelectedCv(cv);
                    setShowAddForm(false);
                    setContribStatus("");
                    setContribKind("");
                    setContribSearch("");
                    setPendingCount(0);
                  }}
                />
              ))
            )}
          </div>

          {campaignTotal > PAGE_SIZE && (
            <div style={{ padding: "8px 10px", borderTop: "1px solid var(--color-border-subtle)" }}>
              <Pagination
                page={campaignPage + 1}
                totalPages={campaignTotalPages}
                totalItems={campaignTotal}
                pageSize={PAGE_SIZE}
                onPageChange={(p) => setCampaignPage(p - 1)}
              />
            </div>
          )}
        </aside>

        {/* Detail main area */}
        <div className="fund-main">
          {selectedCv == null ? (
            <div className="fund-detail-empty">
              <div className="fund-detail-empty-icon">
                <TrendingUp size={40} strokeWidth={1.2} />
              </div>
              <div>Chọn chiến dịch từ danh sách bên trái</div>
              <div style={{ fontSize: 12 }}>để xem chi tiết và quản lý đóng góp</div>
            </div>
          ) : (
            <>
              {/* Campaign header */}
              <div className="fund-detail-head">
                <h2 className="fund-detail-title">{selectedCv.campaign.title}</h2>
                {selectedCv.campaign.purpose ? (
                  <Badge tone={PURPOSE_TONE[selectedCv.campaign.purpose] ?? "default"}>
                    {PURPOSE_BADGE[selectedCv.campaign.purpose] ??
                      PURPOSE_LABEL[selectedCv.campaign.purpose] ??
                      selectedCv.campaign.purpose}
                  </Badge>
                ) : null}
                <Badge tone={STATUS_TONE[stCurrent] ?? "default"}>
                  {STATUS_LABEL[stCurrent] ?? stCurrent}
                </Badge>
                <div className="fund-detail-acts">
                  <Button
                    variant="secondary"
                    onClick={() => { setEditingCampaign(selectedCv.campaign); setShowDlg(true); }}
                  >
                    Sửa
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() => void toggleStatus()}
                  >
                    {selectedCv.campaign.status === "open" ? "Đóng chiến dịch" : "Mở lại"}
                  </Button>
                </div>
              </div>

              {/* Progress */}
              <ProgressSection cv={selectedCv} />

              {/* VietQR */}
              <VietQrSection cv={selectedCv} />

              {/* Contributions */}
              <div className="fund-contribs">
                {/* Tab strip */}
                <div className="mod-tabs" role="tablist">
                  {CONTRIB_TABS.map((t) => (
                    <button
                      key={t.key}
                      role="tab"
                      type="button"
                      aria-selected={contribStatus === t.key}
                      className={`mod-tab${contribStatus === t.key ? " mod-tab-on" : ""}`}
                      onClick={() => setContribStatus(t.key)}
                    >
                      {t.label}
                      {(t.count ?? 0) > 0 && (
                        <span className="mod-tab-badge mod-tab-badge-warning">{t.count}</span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Filter + add button */}
                <div className="fund-contribs-filter">
                  <Input
                    placeholder="Tìm người đóng góp…"
                    value={contribSearch}
                    onChange={(e) => handleSearchChange(e.target.value)}
                    style={{ minWidth: 160, flex: "1 1 160px", maxWidth: 240 }}
                  />
                  <Select
                    aria-label="Lọc loại đóng góp"
                    value={contribKind}
                    onChange={(e) => setContribKind(e.target.value)}
                    options={[{ value: "", label: "Tất cả loại" }, ...KIND_OPTIONS]}
                    style={{ width: 145 }}
                  />
                  <div style={{ marginLeft: "auto" }}>
                    <Button
                      variant={showAddForm ? "secondary" : "primary"}
                      onClick={() => setShowAddForm((v) => !v)}
                      disabled={stCurrent === "closed"}
                      title={stCurrent === "closed" ? "Chiến dịch đã đóng" : undefined}
                    >
                      <PlusCircle size={13} />
                      {showAddForm ? "Ẩn form" : "Ghi nhận mới"}
                    </Button>
                  </div>
                </div>

                {/* Add form */}
                {showAddForm && selectedCv.campaign.id != null ? (
                  <AddContribForm
                    campaignId={selectedCv.campaign.id}
                    slug={slug}
                    getToken={getAccessToken}
                    onSaved={async () => {
                      setPageMsg("Đã ghi nhận đóng góp.");
                      setShowAddForm(false);
                      await Promise.all([reloadContribs(), reloadCampaigns()]);
                    }}
                    onClose={() => setShowAddForm(false)}
                  />
                ) : null}

                {/* Contribution table */}
                <ContribTable
                  contribs={contribs}
                  busyId={busyId}
                  onConfirm={(id) => void handleConfirm(id)}
                  onReject={(id)  => void handleReject(id)}
                  onReceipt={(id) => void openReceipt(id)}
                />

                {contribTotalPages > 1 && (
                  <div style={{ paddingTop: "var(--spacing-sm)" }}>
                    <Pagination
                      page={contribPage + 1}
                      totalPages={contribTotalPages}
                      totalItems={contribTotal}
                      pageSize={PAGE_SIZE}
                      onPageChange={(p) => setContribPage(p - 1)}
                    />
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Campaign create/edit dialog */}
      <CampaignDialog
        open={showDlg}
        initial={editingCampaign}
        slug={slug}
        getToken={getAccessToken}
        onClose={() => setShowDlg(false)}
        onSaved={reloadCampaigns}
      />
    </div>
  );
}
