import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
  Button,
  Input,
  PersonNameDisplay,
  ProTable,
  Select,
} from "@giapha/ui";
import type { ProTableColumn } from "@giapha/ui";
import { defaultTreeSlug, deletePersonById, listTreePersons } from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { AdminPageHeader } from "../components/AdminPageHeader";
import { fromPersonDto } from "./personMappers";
import type { PersonRecord } from "./types";

type Row = PersonRecord & Record<string, unknown>;
type LifeFilter = "all" | "alive" | "deceased";

const PAGE_SIZE = 20;

export function PersonsListPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [params] = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [life, setLife] = useState<LifeFilter>("all");
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState<PersonRecord[]>([]);
  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, alive: 0, deceased: 0, incomplete: 0 });

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const result = await listTreePersons(slug, token, query, page, PAGE_SIZE);
      setRows(result.content.map(fromPersonDto));
      setTotalElements(result.totalElements);
      setTotalPages(Math.max(1, result.totalPages));

      const probe = await listTreePersons(slug, token, "", 0, 100);
      const all = probe.content.map(fromPersonDto);
      setStats({
        total: probe.totalElements,
        alive: all.filter((p) => p.lifeStatus !== "deceased").length,
        deceased: all.filter((p) => p.lifeStatus === "deceased").length,
        incomplete: all.filter((p) => !p.birthSolar || !p.generation).length,
      });
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
  }, [query, life]);

  const visible = useMemo(() => {
    if (life === "all") return rows;
    return rows.filter((r) =>
      life === "deceased" ? r.lifeStatus === "deceased" : r.lifeStatus !== "deceased",
    );
  }, [life, rows]);

  const columns = useMemo<ProTableColumn<Row>[]>(
    () => [
      {
        key: "code",
        header: "Mã hiệu",
        render: (row) => <code>{row.code as string}</code>,
        width: 100,
        sortable: true,
        exportValue: (row) => String(row.code ?? ""),
      },
      {
        key: "fullName",
        header: "Họ tên",
        render: (row) => (
          <PersonNameDisplay fullName={row.fullName as string} generation={row.generation as number | undefined} />
        ),
        sortable: true,
        exportValue: (row) => String(row.fullName ?? ""),
      },
      {
        key: "lifeStatus",
        header: "Trạng thái",
        render: (row) => (
          <Badge tone={row.lifeStatus === "deceased" ? "default" : "success"}>
            {row.lifeStatus === "deceased" ? "Đã mất" : "Còn sống"}
          </Badge>
        ),
        width: 120,
        exportValue: (row) => (row.lifeStatus === "deceased" ? "Đã mất" : "Còn sống"),
      },
      {
        key: "birthSolar",
        header: "Ngày sinh",
        render: (row) => (row.birthSolar as string | null | undefined) ?? "—",
        width: 130,
        exportValue: (row) => String(row.birthSolar ?? ""),
      },
      {
        key: "privacy",
        header: "Riêng tư",
        render: (row) =>
          row.privacy === "public" ? "Công khai" : row.privacy === "private" ? "Riêng tư" : "Thành viên",
        width: 110,
        exportValue: (row) =>
          row.privacy === "public" ? "Công khai" : row.privacy === "private" ? "Riêng tư" : "Thành viên",
      },
      {
        key: "actions",
        header: "Thao tác",
        hideable: false,
        width: 110,
        render: (row) => (
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Link to={`/persons/${row.code as string}`}>Sửa</Link>
            <button
              type="button"
              className="link-danger"
              onClick={(e) => {
                e.stopPropagation();
                void (async () => {
                  if (!confirm(`Xóa ${row.fullName}?`)) return;
                  try {
                    const token = await getAccessToken();
                    await deletePersonById(Number(row.id), token);
                    await reload();
                  } catch (err) {
                    setError(err instanceof ApiError ? err.message : "Xóa thất bại.");
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
        description="Hồ sơ người trong phả hệ — tra cứu, bổ sung và chỉnh sửa thông tin (ngày sinh/mất dương–âm)."
        actions={
          <Link to="/persons/new">
            <Button type="button">+ Thêm người</Button>
          </Link>
        }
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <div className="stat-row">
        <div className="stat">
          <div className="stat-lbl">Tổng thành viên</div>
          <div className="stat-val">{stats.total.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Trong phả hệ</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Còn sống</div>
          <div className="stat-val stat-val-ok">{stats.alive.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Trên trang khảo sát gần nhất</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Đã mất</div>
          <div className="stat-val">{stats.deceased.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Có thể gắn ngày giỗ</div>
        </div>
        <div className="stat">
          <div className="stat-lbl">Thiếu thông tin</div>
          <div className="stat-val stat-val-warn">{stats.incomplete.toLocaleString("vi-VN")}</div>
          <div className="stat-sub">Thiếu ngày sinh hoặc đời</div>
        </div>
      </div>

      <div className="admin-filter-bar">
        <Input
          placeholder="Tìm theo tên / mã hiệu…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Tìm thành viên"
        />
        <Select
          aria-label="Lọc trạng thái sống"
          value={life}
          onChange={(e) => setLife(e.target.value as LifeFilter)}
          options={[
            { value: "all", label: "Tất cả trạng thái" },
            { value: "alive", label: "Còn sống" },
            { value: "deceased", label: "Đã mất" },
          ]}
        />
      </div>

      <ProTable
        rowKey="code"
        columns={columns}
        rows={visible as Row[]}
        loading={loading}
        exportable
        exportFilename="thanh-vien"
        onRefresh={() => void reload()}
        emptyState={{
          title: "Chưa có thành viên",
          description: "Thêm hồ sơ mới — dùng lịch dương/âm khi nhập ngày sinh hoặc ngày mất.",
          action: (
            <Link to="/persons/new">
              <Button>Thêm người</Button>
            </Link>
          ),
        }}
        pagination={{
          page: page + 1,
          totalPages,
          totalItems: totalElements,
          pageSize: PAGE_SIZE,
          onPageChange: (p) => setPage(p - 1),
        }}
      />
    </div>
  );
}
