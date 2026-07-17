import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
  Button,
  DataTable,
  EmptyState,
  Input,
  Pagination,
  PersonNameDisplay,
} from "@giapha/ui";
import { defaultTreeSlug, deletePersonById, listTreePersons } from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { fromPersonDto } from "./personMappers";
import type { PersonRecord } from "./types";

type Row = PersonRecord & Record<string, unknown>;
const PAGE_SIZE = 20;

export function PersonsListPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<PersonRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const result = await listTreePersons(slug, token, query, page, PAGE_SIZE);
      setRows(result.content.map(fromPersonDto));
      setTotalElements(result.totalElements);
      setTotalPages(result.totalPages);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được danh sách thành viên.");
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, page, query, slug]);

  useEffect(() => {
    const t = window.setTimeout(() => void reload(), 200);
    return () => window.clearTimeout(t);
  }, [reload]);

  useEffect(() => {
    setPage(0);
  }, [query]);

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
    <div className="admin-stack">
      <AdminPageHeader
        title="Thành viên"
        description="Hồ sơ người trong phả hệ — tra cứu, bổ sung và chỉnh sửa thông tin."
        actions={
          <Link to="/persons/new">
            <Button type="button">Thêm người</Button>
          </Link>
        }
      />
      {error ? (
        <Alert title="Lỗi" variant="error">
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
          description="Thêm hồ sơ mới hoặc kiểm tra quyền xem thành viên."
          action={
            <Link to="/persons/new">
              <Button>Thêm người</Button>
            </Link>
          }
        />
      ) : (
        <>
          <div className="admin-table-wrap">
            <DataTable columns={columns} rows={rows as Row[]} />
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
