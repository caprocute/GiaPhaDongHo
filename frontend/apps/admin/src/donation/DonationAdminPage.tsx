import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Button,
  DataTable,
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

type Row = DonationCampaignView & Record<string, unknown>;
const CAMPAIGN_PAGE_SIZE = 20;
const CONTRIBUTION_PAGE_SIZE = 20;

export function DonationAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [campaignPage, setCampaignPage] = useState(0);
  const [rows, setRows] = useState<DonationCampaignView[]>([]);
  const [campaignTotal, setCampaignTotal] = useState(0);
  const [campaignTotalPages, setCampaignTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [contributionPage, setContributionPage] = useState(0);
  const [contributions, setContributions] = useState<DonationContributionDto[]>([]);
  const [contributionTotal, setContributionTotal] = useState(0);
  const [contributionTotalPages, setContributionTotalPages] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [title, setTitle] = useState("");
  const [goal, setGoal] = useState("");
  const [status, setStatus] = useState("open");
  const [vietqr, setVietqr] = useState(
    '{"bankBin":"970418","accountNo":"","accountName":"HOI DONG HO"}',
  );

  const [donorName, setDonorName] = useState("");
  const [amount, setAmount] = useState("");
  const [kind, setKind] = useState("money");
  const [note, setNote] = useState("");

  const reloadCampaigns = useCallback(async () => {
    setError(null);
    try {
      const token = await getAccessToken();
      const result = await listDonationCampaignsAdmin(slug, token, campaignPage, CAMPAIGN_PAGE_SIZE);
      setRows(result.content);
      setCampaignTotal(result.totalElements);
      setCampaignTotalPages(result.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được chiến dịch.");
      setRows([]);
    }
  }, [campaignPage, getAccessToken, slug]);

  useEffect(() => {
    void reloadCampaigns();
  }, [reloadCampaigns]);

  useEffect(() => {
    setContributionPage(0);
  }, [selectedId]);

  const reloadContributions = useCallback(async () => {
    if (selectedId == null) {
      setContributions([]);
      setContributionTotal(0);
      setContributionTotalPages(1);
      return;
    }
    try {
      const token = await getAccessToken();
      const result = await listCampaignContributions(
        slug,
        selectedId,
        token,
        contributionPage,
        CONTRIBUTION_PAGE_SIZE,
      );
      setContributions(result.content);
      setContributionTotal(result.totalElements);
      setContributionTotalPages(result.totalPages);
    } catch {
      setContributions([]);
    }
  }, [contributionPage, getAccessToken, selectedId, slug]);

  useEffect(() => {
    void reloadContributions();
  }, [reloadContributions]);

  async function saveCampaign(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      await upsertDonationCampaign(
        slug,
        {
          title: title.trim(),
          goalAmount: goal.trim() ? Number(goal) : null,
          status,
          vietqrPayload: vietqr.trim(),
        },
        token,
      );
      setMsg("Đã lưu chiến dịch.");
      setTitle("");
      setGoal("");
      await reloadCampaigns();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Lưu thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function openReceipt(contributionId: number) {
    try {
      const token = await getAccessToken();
      const res = await fetch(
        `${apiBase()}/api/v1/trees/${encodeURIComponent(slug)}/donation-contributions/${contributionId}/receipt`,
        { headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) } },
      );
      if (!res.ok) throw new Error(await res.text());
      const html = await res.text();
      const blob = new Blob([html], { type: "text/html;charset=utf-8" });
      window.open(URL.createObjectURL(blob), "_blank", "noopener,noreferrer");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Không mở được biên nhận.");
    }
  }

  async function saveContribution(e: React.FormEvent) {
    e.preventDefault();
    if (selectedId == null) {
      setError("Chọn chiến dịch trước.");
      return;
    }
    setBusy(true);
    setError(null);
    setMsg(null);
    try {
      const token = await getAccessToken();
      const created = await recordDonationContribution(
        slug,
        selectedId,
        {
          donorName: donorName.trim(),
          amount: amount.trim() ? Number(amount) : 0,
          kind,
          note: note.trim() || null,
        },
        token,
        true,
      );
      setMsg(`Đã ghi nhận #${created.id ?? "?"}.`);
      setDonorName("");
      setAmount("");
      setNote("");
      await reloadContributions();
      await reloadCampaigns();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Ghi nhận thất bại.");
    } finally {
      setBusy(false);
    }
  }

  const columns = [
    {
      key: "id",
      header: "ID",
      render: (row: Row) => row.campaign?.id ?? "—",
    },
    {
      key: "title",
      header: "Chiến dịch",
      render: (row: Row) => (
        <button
          type="button"
          onClick={() => setSelectedId(row.campaign?.id ?? null)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            color: "var(--color-action-primary-bg)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
            textAlign: "left" as const,
          }}
        >
          {row.campaign?.title}
        </button>
      ),
    },
    {
      key: "progress",
      header: "Tiến độ",
      render: (row: Row) =>
        `${row.campaign?.raisedAmount ?? 0} / ${row.campaign?.goalAmount ?? "—"}`,
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (row: Row) => row.campaign?.status ?? "—",
    },
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Quỹ công đức"
        description="Tạo chiến dịch gây quỹ, ghi nhận đóng góp và in biên nhận."
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}
      {msg ? (
        <Alert title="Thành công" variant="success">
          {msg}
        </Alert>
      ) : null}

      <form
        onSubmit={saveCampaign}
        style={{
          display: "grid",
          gap: "var(--spacing-md)",
          maxWidth: 640,
          padding: "var(--spacing-md)",
          border: "1px solid var(--color-border-subtle)",
        }}
      >
        <strong style={{ fontFamily: "var(--font-display)" }}>Tạo chiến dịch</strong>
        <FormField label="Tiêu đề" required>
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
              { value: "open", label: "Đang mở" },
              { value: "draft", label: "Nháp" },
              { value: "closed", label: "Đóng" },
            ]}
          />
        </FormField>
        <FormField label="Thông tin chuyển khoản (JSON)" hint='{"bankBin","accountNo","accountName"}'>
          <Textarea rows={3} value={vietqr} onChange={(e) => setVietqr(e.target.value)} />
        </FormField>
        <Button type="submit" disabled={busy || !title.trim()}>
          Lưu chiến dịch
        </Button>
      </form>

      {rows.length === 0 ? (
        <EmptyState title="Chưa có chiến dịch" description="Tạo chiến dịch đầu tiên ở form trên." />
      ) : (
        <>
          <div className="admin-table-wrap">
            <DataTable columns={columns} rows={rows as Row[]} />
          </div>
          <div className="admin-table-footer">
            <Pagination
              page={campaignPage + 1}
              totalPages={campaignTotalPages}
              totalItems={campaignTotal}
              onPageChange={(p) => setCampaignPage(p - 1)}
            />
          </div>
        </>
      )}

      {selectedId != null ? (
        <form
          onSubmit={saveContribution}
          style={{
            display: "grid",
            gap: "var(--spacing-md)",
            maxWidth: 640,
            padding: "var(--spacing-md)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <strong style={{ fontFamily: "var(--font-display)" }}>
            Ghi nhận đóng góp — chiến dịch #{selectedId}
          </strong>
          <FormField label="Người công đức" required>
            <Input value={donorName} onChange={(e) => setDonorName(e.target.value)} />
          </FormField>
          <FormField label="Số tiền">
            <Input value={amount} onChange={(e) => setAmount(e.target.value)} inputMode="numeric" />
          </FormField>
          <FormField label="Loại">
            <Select
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              options={[
                { value: "money", label: "Tiền" },
                { value: "goods", label: "Hiện vật" },
                { value: "labor", label: "Công sức" },
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

          {contributions.length ? (
            <>
              <ul style={{ margin: 0, paddingLeft: "1.2rem", fontFamily: "var(--font-body)" }}>
                {contributions.map((c) => (
                  <li key={c.id}>
                    #{c.id} {c.donorName} — {String(c.amount ?? 0)} ({c.kind}){" "}
                    {c.id != null ? (
                      <button
                        type="button"
                        onClick={() => void openReceipt(c.id!)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-action-primary-bg)",
                          cursor: "pointer",
                          fontFamily: "var(--font-body)",
                          padding: 0,
                        }}
                      >
                        Biên nhận
                      </button>
                    ) : null}
                  </li>
                ))}
              </ul>
              <Pagination
                page={contributionPage + 1}
                totalPages={contributionTotalPages}
                totalItems={contributionTotal}
                onPageChange={(p) => setContributionPage(p - 1)}
              />
            </>
          ) : (
            <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
              Chưa có đóng góp công khai trên chiến dịch này.
            </p>
          )}
        </form>
      ) : null}
    </div>
  );
}
