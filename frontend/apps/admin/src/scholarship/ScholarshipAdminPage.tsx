import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, DataTable, EmptyState, Select } from "@giapha/ui";
import { defaultTreeSlug } from "../api/genealogyApi";
import { ApiError, apiFetch } from "../api/http";

type Entry = {
  id?: number;
  personName?: string;
  achievement?: string;
  year?: number | null;
  status?: string | null;
} & Record<string, unknown>;

export function ScholarshipAdminPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [filter, setFilter] = useState("nominated");
  const [rows, setRows] = useState<Entry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const q = filter === "all" ? "" : `?status=${encodeURIComponent(filter)}`;
      setRows(
        await apiFetch<Entry[]>(
          `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin${q}`,
          { token },
        ),
      );
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải đề cử.");
    }
  }, [filter, getAccessToken, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

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
    { key: "st", header: "TT", render: (r: Entry) => r.status ?? "—" },
    {
      key: "act",
      header: "Duyệt",
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
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--spacing-md)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Khuyến học</h1>
        <Select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          options={[
            { value: "nominated", label: "Chờ duyệt" },
            { value: "approved", label: "Đã duyệt" },
            { value: "rejected", label: "Từ chối" },
            { value: "all", label: "Tất cả" },
          ]}
        />
      </div>
      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}
      {rows.length === 0 ? (
        <EmptyState title="Trống" description="Chưa có đề cử." />
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}
    </div>
  );
}
