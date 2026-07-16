import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Badge, Button, DataTable, EmptyState, Input, PersonNameDisplay } from "@giapha/ui";
import { deletePerson, listPersons } from "./personStore";
import type { PersonRecord } from "./types";

type Row = PersonRecord & Record<string, unknown>;

export function PersonsListPage() {
  const [query, setQuery] = useState("");
  const [tick, setTick] = useState(0);
  const rows = useMemo(() => {
    void tick;
    const q = query.trim().toLowerCase();
    return listPersons().filter(
      (p) =>
        !q ||
        p.fullName.toLowerCase().includes(q) ||
        p.code.toLowerCase().includes(q) ||
        (p.tenHuy?.toLowerCase().includes(q) ?? false),
    ) as Row[];
  }, [query, tick]);

  const columns = [
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
      header: "Ngày sinh (dương)",
      render: (row: Row) => row.birthSolar ?? "—",
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: Row) => (
        <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
          <Link to={`/persons/${row.id}`}>Sửa</Link>
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
              if (confirm(`Xóa ${row.fullName}?`)) {
                deletePerson(row.id);
                setTick((t) => t + 1);
              }
            }}
          >
            Xóa
          </button>
        </div>
      ),
    },
  ];

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
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Thành viên</h1>
        <Link to="/persons/new">
          <Button type="button">Thêm người</Button>
        </Link>
      </div>
      <Input
        placeholder="Tìm theo tên / mã hiệu…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        aria-label="Tìm thành viên"
      />
      {rows.length === 0 ? (
        <EmptyState
          title="Chưa có thành viên"
          description="Thêm hồ sơ hoặc nới bộ lọc tìm kiếm."
          action={
            <Link to="/persons/new">
              <Button>Thêm người</Button>
            </Link>
          }
        />
      ) : (
        <DataTable columns={columns} rows={rows} />
      )}
    </div>
  );
}
