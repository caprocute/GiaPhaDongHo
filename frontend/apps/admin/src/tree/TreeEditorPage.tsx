import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import { Alert, Button, DataTable, EmptyState, FormField, Input, Select } from "@giapha/ui";
import {
  createTreeUnion,
  createUnionChild,
  createUnionMember,
  defaultTreeSlug,
  deleteUnionChild,
  deleteUnionMember,
  listTreePersons,
  listTreeUnions,
  listUnionChildren,
  listUnionMembers,
  type FamilyUnionDto,
  type PersonDto,
  type UnionChildDto,
  type UnionMemberDto,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";

type UnionRow = FamilyUnionDto & Record<string, unknown>;

export function TreeEditorPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();
  const [unions, setUnions] = useState<FamilyUnionDto[]>([]);
  const [persons, setPersons] = useState<PersonDto[]>([]);
  const [members, setMembers] = useState<UnionMemberDto[]>([]);
  const [children, setChildren] = useState<UnionChildDto[]>([]);
  const [selectedUnionId, setSelectedUnionId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [orderNo, setOrderNo] = useState("");
  const [memberPersonId, setMemberPersonId] = useState("");
  const [memberRole, setMemberRole] = useState("husband");
  const [childPersonId, setChildPersonId] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const [u, p, m, c] = await Promise.all([
        listTreeUnions(slug, token),
        listTreePersons(slug, token),
        listUnionMembers(token),
        listUnionChildren(token),
      ]);
      setUnions(u);
      setPersons(p);
      setMembers(m);
      setChildren(c);
      setSelectedUnionId((prev) => (prev || (u[0]?.id != null ? String(u[0].id) : "")));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được dữ liệu quan hệ.");
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const personOptions = useMemo(
    () =>
      persons
        .filter((p) => p.id != null)
        .map((p) => ({
          value: String(p.id),
          label: `${p.code ?? "?"} — ${p.fullName ?? "Không tên"}`,
        })),
    [persons],
  );

  const unionOptions = useMemo(
    () =>
      unions
        .filter((u) => u.id != null)
        .map((u) => ({
          value: String(u.id),
          label: `Union #${u.id}${u.orderNo != null ? ` (thứ tự ${u.orderNo})` : ""}`,
        })),
    [unions],
  );

  const selectedId = selectedUnionId ? Number(selectedUnionId) : null;

  const membersOfUnion = useMemo(
    () => members.filter((m) => m.union?.id === selectedId),
    [members, selectedId],
  );
  const childrenOfUnion = useMemo(
    () => children.filter((c) => c.union?.id === selectedId),
    [children, selectedId],
  );

  async function onCreateUnion() {
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const created = await createTreeUnion(
        slug,
        { orderNo: orderNo.trim() ? Number(orderNo) : undefined },
        token,
      );
      setOrderNo("");
      if (created.id != null) setSelectedUnionId(String(created.id));
      const token2 = await getAccessToken();
      setUnions(await listTreeUnions(slug, token2));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tạo union thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function onAddMember() {
    if (!selectedId || !memberPersonId) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await createUnionMember(
        {
          role: memberRole,
          union: { id: selectedId },
          person: { id: Number(memberPersonId) },
        },
        token,
      );
      setMembers(await listUnionMembers(token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Thêm thành viên union thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function onAddChild() {
    if (!selectedId || !childPersonId) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await createUnionChild(
        {
          orderNo: childrenOfUnion.length + 1,
          union: { id: selectedId },
          child: { id: Number(childPersonId) },
        },
        token,
      );
      setChildren(await listUnionChildren(token));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Thêm con thất bại.");
    } finally {
      setBusy(false);
    }
  }

  const unionColumns = [
    {
      key: "id",
      header: "ID",
      render: (row: UnionRow) => row.id ?? "—",
    },
    {
      key: "orderNo",
      header: "Thứ tự",
      render: (row: UnionRow) => row.orderNo ?? "—",
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: UnionRow) => (
        <button
          type="button"
          style={{
            border: "none",
            background: "transparent",
            color: "var(--color-action-primary-bg)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
          onClick={() => setSelectedUnionId(String(row.id))}
        >
          Chọn
        </button>
      ),
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          gap: "var(--spacing-md)",
          flexWrap: "wrap",
        }}
      >
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Tree editor</h1>
        <p style={{ margin: 0, fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
          Cây: <code>{slug}</code> · đổi ở <Link to="/settings">Cài đặt</Link>
        </p>
      </div>

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: "var(--spacing-md)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
            padding: "var(--spacing-md)",
            border: "1px solid var(--color-border-subtle)",
            background: "var(--color-surface-card)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "var(--font-size-lg)" }}>
            Tạo hôn phối (union)
          </h2>
          <FormField label="Thứ tự (tuỳ chọn)">
            <Input
              type="number"
              value={orderNo}
              onChange={(e) => setOrderNo(e.target.value)}
              placeholder="1"
            />
          </FormField>
          <Button type="button" disabled={busy} onClick={() => void onCreateUnion()}>
            Tạo union
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
            padding: "var(--spacing-md)",
            border: "1px solid var(--color-border-subtle)",
            background: "var(--color-surface-card)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "var(--font-size-lg)" }}>
            Gắn vợ/chồng
          </h2>
          <FormField label="Union">
            <Select
              options={[{ value: "", label: "— Chọn —" }, ...unionOptions]}
              value={selectedUnionId}
              onChange={(e) => setSelectedUnionId(e.target.value)}
            />
          </FormField>
          <FormField label="Người">
            <Select
              options={[{ value: "", label: "— Chọn —" }, ...personOptions]}
              value={memberPersonId}
              onChange={(e) => setMemberPersonId(e.target.value)}
            />
          </FormField>
          <FormField label="Vai trò">
            <Select
              options={[
                { value: "husband", label: "Chồng" },
                { value: "wife", label: "Vợ" },
                { value: "partner", label: "Bạn đời" },
              ]}
              value={memberRole}
              onChange={(e) => setMemberRole(e.target.value)}
            />
          </FormField>
          <Button
            type="button"
            disabled={busy || !selectedUnionId || !memberPersonId}
            onClick={() => void onAddMember()}
          >
            Thêm thành viên
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
            padding: "var(--spacing-md)",
            border: "1px solid var(--color-border-subtle)",
            background: "var(--color-surface-card)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "var(--font-size-lg)" }}>
            Gắn con
          </h2>
          <FormField label="Union">
            <Select
              options={[{ value: "", label: "— Chọn —" }, ...unionOptions]}
              value={selectedUnionId}
              onChange={(e) => setSelectedUnionId(e.target.value)}
            />
          </FormField>
          <FormField label="Con">
            <Select
              options={[{ value: "", label: "— Chọn —" }, ...personOptions]}
              value={childPersonId}
              onChange={(e) => setChildPersonId(e.target.value)}
            />
          </FormField>
          <Button
            type="button"
            disabled={busy || !selectedUnionId || !childPersonId}
            onClick={() => void onAddChild()}
          >
            Thêm con
          </Button>
        </div>
      </section>

      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
      ) : (
        <>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Danh sách union</h2>
            {unions.length === 0 ? (
              <EmptyState title="Chưa có union" description="Tạo hôn phối để gắn vợ/chồng và con." />
            ) : (
              <DataTable columns={unionColumns} rows={unions as UnionRow[]} />
            )}
          </section>

          {selectedId ? (
            <section
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "var(--spacing-md)",
              }}
            >
              <div>
                <h3 style={{ fontFamily: "var(--font-display)" }}>Thành viên union #{selectedId}</h3>
                {membersOfUnion.length === 0 ? (
                  <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                    Chưa có thành viên.
                  </p>
                ) : (
                  <ul style={{ fontFamily: "var(--font-body)", paddingLeft: "1.2rem" }}>
                    {membersOfUnion.map((m) => (
                      <li key={m.id}>
                        {m.role}: {m.person?.fullName ?? m.person?.code ?? m.person?.id}{" "}
                        <button
                          type="button"
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--color-status-error-fg)",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            void (async () => {
                              if (m.id == null) return;
                              const token = await getAccessToken();
                              await deleteUnionMember(m.id, token);
                              setMembers(await listUnionMembers(token));
                            })();
                          }}
                        >
                          xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <h3 style={{ fontFamily: "var(--font-display)" }}>Con của union #{selectedId}</h3>
                {childrenOfUnion.length === 0 ? (
                  <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
                    Chưa gắn con.
                  </p>
                ) : (
                  <ul style={{ fontFamily: "var(--font-body)", paddingLeft: "1.2rem" }}>
                    {childrenOfUnion.map((c) => (
                      <li key={c.id}>
                        {c.child?.fullName ?? c.child?.code ?? c.child?.id}{" "}
                        <button
                          type="button"
                          style={{
                            border: "none",
                            background: "transparent",
                            color: "var(--color-status-error-fg)",
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            void (async () => {
                              if (c.id == null) return;
                              const token = await getAccessToken();
                              await deleteUnionChild(c.id, token);
                              setChildren(await listUnionChildren(token));
                            })();
                          }}
                        >
                          xóa
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </section>
          ) : null}
        </>
      )}
    </div>
  );
}
