import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import { Alert, Badge, Button, DataTable, EmptyState, Input, PersonNameDisplay } from "@giapha/ui";
import {
  defaultTreeSlug,
  deletePersonById,
  listTreePersons,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { fromPersonDto } from "./personMappers";
import type { PersonRecord } from "./types";

type Row = PersonRecord & Record<string, unknown>;

export function PersonsListPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [query, setQuery] = useState("");
  const [rows, setRows] = useState<PersonRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const list = await listTreePersons(slug, token, query);
      setRows(list.map(fromPersonDto));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được danh sách thành viên.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, query, slug]);

  useEffect(() => {
    const t = window.setTimeout(() => void reload(), 200);
    return () => window.clearTimeout(t);
  }, [reload]);

  const columns = useMemo(
    () => [
      {
        key: "code",
        header: "Mã hiệu",
        render: (row: Row) => <code>{row.code}</code>,
      },
      {
        key: "fullName",
        header: "Họ tên",
        render: (row: Row) => (
          <PersonNameDisplay fullName={row.fullName} generation={row.generation} />
        ),
      },
      {
        key: "lifeStatus",
        header: "Trạng thái",
        render: (row: Row) => (
          <Badge tone={row.lifeStatus === "deceased" ? "default" : "success"}>
            {row.lifeStatus === "deceased" ? "Đã mất" : "Còn sống"}
          </Badge>
        ),
      },
      {
        key: "birthSolar",
        header: "Ngày sinh",
        render: (row: Row) => row.birthSolar ?? "—",
      },
      {
        key: "actions",
        header: "Thao tác",
        render: (row: Row) => (
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Link to={`/persons/${row.code}`}>Sửa</Link>
            <button
              type="button"
              style={{
                border: "none",
                background: "transparent",
                color: "var(--color-status-error-fg)",
                cursor: "pointer",
                fontFamily: "var(--font-body)",
              }}
              onClick={() => {
                void (async () => {
                  if (!confirm(`Xóa ${row.fullName}?`)) return;
                  try {
                    const token = await getAccessToken();
                    await deletePersonById(Number(row.id), token);
                    await reload();
                  } catch (e) {
                    setError(e instanceof ApiError ? e.message : "Xóa thất bại.");
                  }
                })();
              }}
            >
              Xóa
            </button>
          </div>
        ),
      },
    ],
    [getAccessToken, reload],
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--spacing-md)",
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Thành viên</h1>
          <p style={{ margin: 0, fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
            Cây <code>{slug}</code>
          </p>
        </div>
        <Link to="/persons/new">
          <Button type="button">Thêm người</Button>
        </Link>
      </div>
      {error ? (
        <Alert title="Lỗi API" variant="error">
          {error}
        </Alert>
      ) : null}
      <Input
        placeholder="Tìm theo tên / mã hiệu…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Tìm thành viên"
      />
      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
      ) : rows.length === 0 ? (
        <EmptyState
          title="Chưa có thành viên"
          description="Thêm hồ sơ hoặc kiểm tra slug cây / quyền genealogy:person:read."
          action={
            <Link to="/persons/new">
              <Button>Thêm người</Button>
            </Link>
          }
        />
      ) : (
        <DataTable columns={columns} rows={rows as Row[]} />
      )}
    </div>
  );
}
