import { useCallback, useEffect, useId, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BookOpenCheck, CheckCircle, Download, PlusCircle, XCircle } from "lucide-react";
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
} from "@giapha/ui";
import {
  confirmFundExpense,
  createFundExpense,
  defaultTreeSlug,
  getFundSummary,
  listDonationCampaignsAdmin,
  listFundExpenses,
  listFundLedger,
  rejectFundExpense,
  type DonationCampaignDto,
  type FundExpenseDto,
  type FundLedgerEntryDto,
  type FundSummaryDto,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { fmtCurrency, fmtDateShort } from "../lib/formatters";

const PAGE_SIZE = 20;

type BadgeTone = "success" | "warning" | "error" | "accent" | "default";

const SOURCE_LABEL: Record<string, string> = {
  contribution: "Đóng góp",
  scholarship_award: "Học bổng",
  event_expense: "Chi sự kiện",
  fund_expense: "Chi khác",
};

const SOURCE_TONE: Record<string, BadgeTone> = {
  contribution: "success",
  scholarship_award: "accent",
  event_expense: "warning",
  fund_expense: "default",
};

const CATEGORY_OPTIONS = [
  { value: "construction", label: "Xây dựng" },
  { value: "maintenance", label: "Bảo trì" },
  { value: "printing", label: "In ấn" },
  { value: "admin", label: "Hành chính" },
  { value: "catering", label: "Ẩm thực" },
  { value: "transport", label: "Đi lại" },
  { value: "other", label: "Khác" },
];

const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  CATEGORY_OPTIONS.map((o) => [o.value, o.label]),
);

type ExpenseForm = {
  campaignId: string;
  description: string;
  amount: string;
  category: string;
  expenseDate: string;
  paidByName: string;
  receiptRef: string;
  note: string;
};

function emptyExpenseForm(campaignId?: string): ExpenseForm {
  return {
    campaignId: campaignId ?? "",
    description: "",
    amount: "",
    category: "other",
    expenseDate: new Date().toISOString().slice(0, 10),
    paidByName: "",
    receiptRef: "",
    note: "",
  };
}

export function FundLedgerPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [searchParams] = useSearchParams();
  const dlgFormId = useId().replace(/:/g, "");

  const [tab, setTab] = useState<"ledger" | "pending">("ledger");

  const [summary, setSummary] = useState<FundSummaryDto | null>(null);
  const [campaigns, setCampaigns] = useState<DonationCampaignDto[]>([]);

  /* Bộ lọc sổ quỹ */
  const [filterCampaign, setFilterCampaign] = useState(() => searchParams.get("campaign") ?? "");
  const [filterDirection, setFilterDirection] = useState("");
  const [filterFrom, setFilterFrom] = useState("");
  const [filterTo, setFilterTo] = useState("");

  const [entries, setEntries] = useState<FundLedgerEntryDto[]>([]);
  const [ledgerPage, setLedgerPage] = useState(0);
  const [ledgerTotal, setLedgerTotal] = useState(0);
  const [ledgerTotalPages, setLedgerTotalPages] = useState(1);

  const [pendingExpenses, setPendingExpenses] = useState<FundExpenseDto[]>([]);
  const [pendingPage, setPendingPage] = useState(0);
  const [pendingTotal, setPendingTotal] = useState(0);
  const [pendingTotalPages, setPendingTotalPages] = useState(1);
  const [busyId, setBusyId] = useState<number | null>(null);

  const [dlgOpen, setDlgOpen] = useState(false);
  const [form, setForm] = useState<ExpenseForm>(() => emptyExpenseForm());
  const [formBusy, setFormBusy] = useState(false);
  const [formErr, setFormErr] = useState<string | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);

  const reloadSummary = useCallback(async () => {
    try {
      const token = await getAccessToken();
      setSummary(await getFundSummary(slug, token));
    } catch {
      setSummary(null);
    }
  }, [getAccessToken, slug]);

  const reloadCampaigns = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const r = await listDonationCampaignsAdmin(slug, token, 0, 100);
      setCampaigns(r.content.map((v) => v.campaign));
    } catch {
      setCampaigns([]);
    }
  }, [getAccessToken, slug]);

  const reloadLedger = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      const r = await listFundLedger(slug, token, {
        campaignId: filterCampaign ? Number(filterCampaign) : undefined,
        direction: filterDirection === "credit" || filterDirection === "debit" ? filterDirection : undefined,
        from: filterFrom || undefined,
        to: filterTo || undefined,
        page: ledgerPage,
        size: PAGE_SIZE,
      });
      setEntries(r.content);
      setLedgerTotal(r.totalElements);
      setLedgerTotalPages(r.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được sổ quỹ.");
      setEntries([]);
    }
  }, [filterCampaign, filterDirection, filterFrom, filterTo, getAccessToken, ledgerPage, slug]);

  const reloadPending = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const r = await listFundExpenses(slug, token, {
        status: "pending",
        page: pendingPage,
        size: PAGE_SIZE,
      });
      setPendingExpenses(r.content);
      setPendingTotal(r.totalElements);
      setPendingTotalPages(r.totalPages);
    } catch {
      setPendingExpenses([]);
    }
  }, [getAccessToken, pendingPage, slug]);

  useEffect(() => { void reloadSummary(); }, [reloadSummary]);
  useEffect(() => { void reloadCampaigns(); }, [reloadCampaigns]);
  useEffect(() => { void reloadLedger(); }, [reloadLedger]);
  useEffect(() => { void reloadPending(); }, [reloadPending]);
  useEffect(() => { setLedgerPage(0); }, [filterCampaign, filterDirection, filterFrom, filterTo]);

  const campaignTitle = useMemo(() => {
    const map = new Map(campaigns.map((c) => [c.id, c.title]));
    return (id: number | null | undefined) => (id != null ? map.get(id) ?? `#${id}` : "—");
  }, [campaigns]);

  const pendingCount = summary?.pendingExpenseCount ?? pendingTotal;

  function openExpenseDialog() {
    setForm(emptyExpenseForm(filterCampaign || (campaigns[0]?.id != null ? String(campaigns[0].id) : "")));
    setFormErr(null);
    setDlgOpen(true);
  }

  async function saveExpense(e: React.FormEvent) {
    e.preventDefault();
    const cid = Number(form.campaignId);
    if (!Number.isFinite(cid) || cid <= 0) { setFormErr("Chọn chiến dịch nguồn."); return; }
    if (!form.description.trim()) { setFormErr("Nhập mô tả khoản chi."); return; }
    const amountNum = Number(form.amount.replace(/[^0-9]/g, ""));
    if (!Number.isFinite(amountNum) || amountNum <= 0) { setFormErr("Nhập số tiền hợp lệ."); return; }
    if (!form.expenseDate) { setFormErr("Chọn ngày chi."); return; }
    if (!form.paidByName.trim()) { setFormErr("Nhập người thực hiện."); return; }
    setFormBusy(true);
    setFormErr(null);
    try {
      const token = await getAccessToken();
      await createFundExpense(
        slug,
        {
          campaignId: cid,
          description: form.description.trim(),
          amount: amountNum,
          category: form.category,
          expenseDate: form.expenseDate,
          paidByName: form.paidByName.trim(),
          receiptRef: form.receiptRef.trim() || null,
          note: form.note.trim() || null,
        },
        token,
      );
      setDlgOpen(false);
      setMsg("Đã ghi khoản chi — chờ xác nhận.");
      await Promise.all([reloadPending(), reloadSummary(), reloadLedger()]);
    } catch (ex) {
      setFormErr(ex instanceof ApiError ? ex.message : "Ghi khoản chi thất bại.");
    } finally {
      setFormBusy(false);
    }
  }

  async function handleExpenseAction(expenseId: number, action: "confirm" | "reject") {
    setBusyId(expenseId);
    setError(null);
    try {
      const token = await getAccessToken();
      if (action === "confirm") await confirmFundExpense(slug, expenseId, token);
      else await rejectFundExpense(slug, expenseId, token);
      setMsg(action === "confirm" ? "Đã xác nhận khoản chi." : "Đã từ chối khoản chi.");
      await Promise.all([reloadPending(), reloadSummary(), reloadLedger()]);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Thao tác thất bại.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Sổ quỹ dòng họ"
        description="Sổ thu–chi thống nhất: đóng góp, học bổng, chi sự kiện và các khoản chi khác của mọi chiến dịch."
        actions={
          <Button onClick={openExpenseDialog}>
            <PlusCircle size={14} /> Ghi khoản chi
          </Button>
        }
      />

      {error ? (
        <Alert title="Lỗi" variant="error">{error}</Alert>
      ) : null}
      {msg ? (
        <Alert title="Thành công" variant="success">{msg}</Alert>
      ) : null}

      {/* KPI */}
      <div className="fund-stats">
        <StatCard label="Tổng đã thu" value={fmtCurrency(summary?.totalIncome ?? 0)} />
        <StatCard label="Tổng đã chi" value={fmtCurrency(summary?.totalExpense ?? 0)} />
        <StatCard label="Số dư tổng" value={fmtCurrency(summary?.balance ?? 0)} />
        <StatCard label="Khoản chi chờ duyệt" value={String(pendingCount)} />
      </div>

      {/* Tabs */}
      <div className="mod-tabs" role="tablist">
        <button
          role="tab"
          type="button"
          aria-selected={tab === "ledger"}
          className={`mod-tab${tab === "ledger" ? " mod-tab-on" : ""}`}
          onClick={() => setTab("ledger")}
        >
          <BookOpenCheck size={14} /> Sổ quỹ
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === "pending"}
          className={`mod-tab${tab === "pending" ? " mod-tab-on" : ""}`}
          onClick={() => setTab("pending")}
        >
          Khoản chi chờ duyệt
          {pendingCount > 0 ? (
            <span className="mod-tab-badge mod-tab-badge-warning">{pendingCount}</span>
          ) : null}
        </button>
      </div>

      {tab === "ledger" ? (
        <>
          {/* Filter bar */}
          <div className="admin-filter-bar">
            <Select
              aria-label="Lọc theo chiến dịch"
              value={filterCampaign}
              onChange={(e) => setFilterCampaign(e.target.value)}
              options={[
                { value: "", label: "Tất cả chiến dịch" },
                ...campaigns
                  .filter((c) => c.id != null)
                  .map((c) => ({ value: String(c.id), label: c.title })),
              ]}
            />
            <Select
              aria-label="Lọc thu chi"
              value={filterDirection}
              onChange={(e) => setFilterDirection(e.target.value)}
              options={[
                { value: "", label: "Thu + Chi" },
                { value: "credit", label: "Thu" },
                { value: "debit", label: "Chi" },
              ]}
            />
            <FormField label="Từ ngày">
              <Input
                type="date"
                value={filterFrom}
                onChange={(e) => setFilterFrom(e.target.value)}
              />
            </FormField>
            <FormField label="Đến ngày">
              <Input type="date" value={filterTo} onChange={(e) => setFilterTo(e.target.value)} />
            </FormField>
            <div className="fl-filter-end">
              <Button variant="secondary" disabled title="Sắp có">
                <Download size={13} /> Xuất Excel
              </Button>
            </div>
          </div>

          {entries.length === 0 ? (
            <EmptyState
              title="Chưa có giao dịch"
              description="Sổ quỹ tổng hợp đóng góp đã xác nhận, suất học bổng và các khoản chi đã duyệt."
            />
          ) : (
            <>
              <div className="fl-table">
                <div className="fl-thead fl-thead-full" aria-hidden>
                  <span>Ngày</span>
                  <span>Loại</span>
                  <span>Mô tả</span>
                  <span>Số tiền</span>
                  <span>Nguồn</span>
                </div>
                {entries.map((en, i) => (
                  <div key={`${en.sourceType}-${en.sourceId ?? i}`} className="fl-row fl-row-full">
                    <div className="fl-row-sub">{fmtDateShort(en.txDate)}</div>
                    <div className="fl-row-sub">{en.direction === "credit" ? "Thu" : "Chi"}</div>
                    <div>
                      <div className="fl-row-label">{en.label}</div>
                      {en.campaignTitle || en.campaignId != null ? (
                        <div className="fl-row-sub">
                          {en.campaignTitle ?? campaignTitle(en.campaignId)}
                        </div>
                      ) : null}
                    </div>
                    <div
                      className={`fl-amount ${en.direction === "credit" ? "fl-amount-credit" : "fl-amount-debit"}`}
                    >
                      {en.direction === "credit" ? "+" : "−"}{fmtCurrency(en.amount)}
                    </div>
                    <div>
                      <Badge tone={SOURCE_TONE[en.sourceType] ?? "default"}>
                        {SOURCE_LABEL[en.sourceType] ?? en.sourceType}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
              {ledgerTotalPages > 1 ? (
                <Pagination
                  page={ledgerPage + 1}
                  totalPages={ledgerTotalPages}
                  totalItems={ledgerTotal}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => setLedgerPage(p - 1)}
                />
              ) : null}
            </>
          )}
        </>
      ) : null}

      {tab === "pending" ? (
        <>
          {pendingExpenses.length === 0 ? (
            <EmptyState
              title="Không có khoản chi chờ duyệt"
              description="Khoản chi mới ghi sẽ nằm ở đây cho tới khi được xác nhận."
            />
          ) : (
            <>
              <div className="fl-table">
                <div className="fl-thead fl-thead-expense" aria-hidden>
                  <span>Mô tả</span>
                  <span>Số tiền</span>
                  <span>Hạng mục</span>
                  <span>Ngày</span>
                  <span>Người chi</span>
                  <span>Chiến dịch</span>
                  <span>Thao tác</span>
                </div>
                {pendingExpenses.map((x) => (
                  <div key={x.id} className="fl-row fl-row-expense">
                    <div>
                      <div className="fl-row-label">{x.description}</div>
                      {x.receiptRef ? (
                        <div className="fl-row-sub">Biên lai: {x.receiptRef}</div>
                      ) : null}
                      {x.note ? <div className="fl-row-sub">{x.note}</div> : null}
                    </div>
                    <div className="fl-amount fl-amount-debit">{fmtCurrency(x.amount)}</div>
                    <div className="fl-row-sub">{CATEGORY_LABEL[x.category] ?? x.category}</div>
                    <div className="fl-row-sub">{fmtDateShort(x.expenseDate)}</div>
                    <div className="fl-row-sub">{x.paidByName}</div>
                    <div className="fl-row-sub">{campaignTitle(x.campaignId)}</div>
                    <div className="fl-row-acts">
                      {x.id != null ? (
                        <>
                          <button
                            type="button"
                            className="fl-action-btn fl-action-btn-confirm"
                            disabled={busyId === x.id}
                            onClick={() => void handleExpenseAction(x.id!, "confirm")}
                            title="Xác nhận khoản chi"
                          >
                            <CheckCircle size={12} /> Xác nhận
                          </button>
                          <button
                            type="button"
                            className="fl-action-btn fl-action-btn-reject"
                            disabled={busyId === x.id}
                            onClick={() => void handleExpenseAction(x.id!, "reject")}
                            title="Từ chối"
                          >
                            <XCircle size={12} />
                          </button>
                        </>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
              {pendingTotalPages > 1 ? (
                <Pagination
                  page={pendingPage + 1}
                  totalPages={pendingTotalPages}
                  totalItems={pendingTotal}
                  pageSize={PAGE_SIZE}
                  onPageChange={(p) => setPendingPage(p - 1)}
                />
              ) : null}
            </>
          )}
        </>
      ) : null}

      {/* Dialog tạo khoản chi */}
      <Dialog
        open={dlgOpen}
        title="Ghi khoản chi từ quỹ"
        onClose={() => !formBusy && setDlgOpen(false)}
        size="md"
        footer={
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="submit" form={dlgFormId} disabled={formBusy}>
              {formBusy ? "Đang lưu…" : "Ghi khoản chi"}
            </Button>
            <Button type="button" variant="secondary" onClick={() => setDlgOpen(false)} disabled={formBusy}>
              Hủy
            </Button>
          </div>
        }
      >
        <form id={dlgFormId} className="admin-form" onSubmit={(e) => void saveExpense(e)} noValidate>
          {formErr ? (
            <Alert title="Không lưu được" variant="error">{formErr}</Alert>
          ) : null}
          <FormField label="Chiến dịch nguồn" required>
            <Select
              value={form.campaignId}
              onChange={(e) => setForm((f) => ({ ...f, campaignId: e.target.value }))}
              options={[
                { value: "", label: "— Chọn chiến dịch —" },
                ...campaigns
                  .filter((c) => c.id != null)
                  .map((c) => ({ value: String(c.id), label: c.title })),
              ]}
            />
          </FormField>
          <FormField label="Mô tả" required>
            <Input
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              autoFocus
            />
          </FormField>
          <div className="admin-form-grid">
            <FormField label="Số tiền (VND)" required>
              <Input
                value={form.amount}
                onChange={(e) => setForm((f) => ({ ...f, amount: e.target.value }))}
                inputMode="numeric"
                placeholder="VD: 5000000"
              />
            </FormField>
            <FormField label="Hạng mục" required>
              <Select
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                options={CATEGORY_OPTIONS}
              />
            </FormField>
          </div>
          <div className="admin-form-grid">
            <FormField label="Ngày chi" required>
              <Input
                type="date"
                value={form.expenseDate}
                onChange={(e) => setForm((f) => ({ ...f, expenseDate: e.target.value }))}
              />
            </FormField>
            <FormField label="Người thực hiện" required>
              <Input
                value={form.paidByName}
                onChange={(e) => setForm((f) => ({ ...f, paidByName: e.target.value }))}
              />
            </FormField>
          </div>
          <div className="admin-form-grid">
            <FormField label="Số biên lai">
              <Input
                value={form.receiptRef}
                onChange={(e) => setForm((f) => ({ ...f, receiptRef: e.target.value }))}
              />
            </FormField>
            <FormField label="Ghi chú">
              <Input
                value={form.note}
                onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))}
              />
            </FormField>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
