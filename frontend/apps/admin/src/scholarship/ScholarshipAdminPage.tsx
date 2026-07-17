import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, DataTable, EmptyState, Pagination, Select } from "@giapha/ui";
import { defaultTreeSlug } from "../api/genealogyApi";
import { ApiError, apiFetch, apiFetchPage } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";

type Entry = {
  id?: number;
  personName?: string;
  achievement?: string;
  year?: number | null;
  status?: string | null;
} & Record<string, unknown>;

const PAGE_SIZE = 20;

const statusLabel: Record<string, string> = {
  nominated: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
};

export function ScholarshipAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [filter, setFilter] = useState("nominated");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<Entry[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const q = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
      const result = await apiFetchPage<Entry>(
        `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin${q}`,
        { token, page, size: PAGE_SIZE },
      );
      setRows(result.content);
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải đề cử khuyến học.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [filter, getAccessToken, page, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setPage(0);
  }, [filter]);

  async function review(id: number, action: "approve" | "reject") {
    const token = await getAccessToken();
    await apiFetch(
      `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/${id}/${action}`,
      { method: "POST", body: {}, token },
    );
    await reload();
  }

  const columns = [
    { key: "id", header: "ID", render: (r: Entry) => r.id ?? "—" },
    { key: "name", header: "Họ tên", render: (r: Entry) => r.personName ?? "—" },
    { key: "year", header: "Năm", render: (r: Entry) => r.year ?? "—" },
    { key: "ach", header: "Thành tích", render: (r: Entry) => r.achievement ?? "—" },
    {
      key: "st",
      header: "Trạng thái",
      render: (r: Entry) => statusLabel[(r.status ?? "").toLowerCase()] ?? r.status ?? "—",
    },
    {
      key: "act",
      header: "Thao tác",
      render: (r: Entry) =>
        r.status === "nominated" && r.id != null ? (
          <span style={{ display: "flex", gap: "var(--spacing-xs)" }}>
            <Button type="button" onClick={() => void review(r.id!, "approve")}>
              Duyệt
            </Button>
            <Button type="button" variant="secondary" onClick={() => void review(r.id!, "reject")}>
              Từ chối
            </Button>
          </span>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Khuyến học"
        description="Duyệt đề cử thành tích học tập của con cháu dòng họ."
        actions={
          <Select
            aria-label="Lọc trạng thái"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            options={[
              { value: "nominated", label: "Chờ duyệt" },
              { value: "approved", label: "Đã duyệt" },
              { value: "rejected", label: "Từ chối" },
              { value: "all", label: "Tất cả" },
            ]}
          />
        }
      />
      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
      ) : rows.length === 0 ? (
        <EmptyState title="Chưa có đề cử" description="Chưa có đề cử khuyến học khớp bộ lọc." />
      ) : (
        <>
          <div className="admin-table-wrap">
            <DataTable columns={columns} rows={rows} />
          </div>
          <div className="admin-table-footer">
            <Pagination
              page={page + 1}
              totalPages={totalPages}
              totalItems={totalElements}
              onPageChange={(p) => setPage(p - 1)}
            />
          </div>
        </>
      )}
    </div>
  );
}
