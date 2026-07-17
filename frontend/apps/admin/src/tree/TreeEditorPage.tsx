import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, EmptyState, FormField, Input, Select } from "@giapha/ui";
import {
  GitBranch,
  Maximize2,
  Minus,
  Plus,
  RefreshCw,
  UserPlus,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
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
import { AdminPageHeader } from "../components/AdminPageHeader";

// ── Layout constants ──────────────────────────────────────────────────
const NW = 148;    // node width
const NH = 58;     // node height
const H_GAP = 28;  // gap between couples
const FAMILY_GAP = 48; // gap between families
const ROW_H = 148; // vertical distance between generations

// ── Types ─────────────────────────────────────────────────────────────
type Pos = { x: number; y: number };

type NodeData = {
  personId: number;
  person: PersonDto;
  pos: Pos;
};

type UnionLine = {
  unionId: number;
  leftX: number;
  rightX: number;
  midX: number;
  y: number;
  childIds: number[];
};

type LayoutResult = {
  nodes: Map<number, NodeData>;
  unionLines: UnionLine[];
  svgWidth: number;
  svgHeight: number;
};

// ── Layout algorithm ─────────────────────────────────────────────────
function buildLayout(
  persons: PersonDto[],
  unions: FamilyUnionDto[],
  members: UnionMemberDto[],
  children: UnionChildDto[],
): LayoutResult {
  if (persons.length === 0) {
    return { nodes: new Map(), unionLines: [], svgWidth: 400, svgHeight: 200 };
  }

  // Build indices
  const membersByUnion = new Map<number, number[]>();
  const unionsByPerson = new Map<number, number[]>();
  for (const m of members) {
    if (!m.union?.id || !m.person?.id) continue;
    const a = membersByUnion.get(m.union.id) ?? [];
    a.push(m.person.id);
    membersByUnion.set(m.union.id, a);
    const b = unionsByPerson.get(m.person.id) ?? [];
    b.push(m.union.id);
    unionsByPerson.set(m.person.id, b);
  }

  const childrenByUnion = new Map<number, number[]>();
  const parentUnionByPerson = new Map<number, number>();
  for (const c of children) {
    if (!c.union?.id || !c.child?.id) continue;
    const a = childrenByUnion.get(c.union.id) ?? [];
    a.push(c.child.id);
    childrenByUnion.set(c.union.id, a);
    parentUnionByPerson.set(c.child.id, c.union.id);
  }

  // Group by generation
  const byGen = new Map<number, PersonDto[]>();
  for (const p of persons) {
    if (p.id == null) continue;
    const g = p.generation ?? 1;
    const arr = byGen.get(g) ?? [];
    arr.push(p);
    byGen.set(g, arr);
  }

  const gens = [...byGen.keys()].sort((a, b) => a - b);
  const nodes = new Map<number, NodeData>();
  const unionLines: UnionLine[] = [];

  // Layout each generation
  gens.forEach((gen, genIdx) => {
    const ps = [...(byGen.get(gen) ?? [])];
    const placed = new Set<number>();
    let curX = 24;
    const y = 24 + genIdx * ROW_H;
    const genUnionMid = new Map<number, number>(); // unionId → midX in this gen

    for (const p of ps) {
      if (!p.id || placed.has(p.id)) continue;
      placed.add(p.id);

      // Find partner in same generation for same union
      const myUnions = unionsByPerson.get(p.id) ?? [];
      let partnerId: number | null = null;
      let partnerUnionId: number | null = null;
      for (const uid of myUnions) {
        const mates = (membersByUnion.get(uid) ?? []).filter((id) => id !== p.id);
        for (const mate of mates) {
          const matePerson = persons.find((x) => x.id === mate);
          if (matePerson && (matePerson.generation ?? 1) === gen && !placed.has(mate)) {
            partnerId = mate;
            partnerUnionId = uid;
            break;
          }
        }
        if (partnerId) break;
      }

      nodes.set(p.id, { personId: p.id, person: p, pos: { x: curX, y } });

      if (partnerId && partnerUnionId) {
        placed.add(partnerId);
        const partnerX = curX + NW + H_GAP;
        const partnerPerson = persons.find((x) => x.id === partnerId)!;
        nodes.set(partnerId, { personId: partnerId, person: partnerPerson, pos: { x: partnerX, y } });

        const midX = curX + NW + H_GAP / 2;
        genUnionMid.set(partnerUnionId, midX);
        curX += NW + H_GAP + NW + FAMILY_GAP;
      } else {
        curX += NW + FAMILY_GAP;
      }
    }

    // Build union lines for this generation
    for (const [uid, midX] of genUnionMid) {
      const mateIds = membersByUnion.get(uid) ?? [];
      const leftId = mateIds[0];
      const rightId = mateIds[1];
      const leftNode = leftId != null ? nodes.get(leftId) : null;
      const rightNode = rightId != null ? nodes.get(rightId) : null;
      if (!leftNode || !rightNode) continue;
      const childIds = childrenByUnion.get(uid) ?? [];
      unionLines.push({
        unionId: uid,
        leftX: leftNode.pos.x + NW,
        rightX: rightNode.pos.x,
        midX,
        y: y + NH / 2,
        childIds,
      });
    }
  });

  // Place orphan persons (no generation): last row
  const orphans = persons.filter(
    (p) => p.id != null && p.generation == null && !nodes.has(p.id!),
  );
  if (orphans.length > 0) {
    const y = 24 + gens.length * ROW_H;
    orphans.forEach((p, i) => {
      if (p.id != null) nodes.set(p.id, { personId: p.id, person: p, pos: { x: 24 + i * (NW + FAMILY_GAP), y } });
    });
  }

  // Compute SVG bounds
  let maxX = 400;
  let maxY = 200;
  for (const n of nodes.values()) {
    maxX = Math.max(maxX, n.pos.x + NW + 24);
    maxY = Math.max(maxY, n.pos.y + NH + 24);
  }

  return { nodes, unionLines, svgWidth: maxX, svgHeight: maxY };
}

// ── Person node (SVG) ─────────────────────────────────────────────────
function PersonNode({
  data,
  selected,
  onClick,
}: {
  data: NodeData;
  selected: boolean;
  onClick: () => void;
}) {
  const { person, pos } = data;
  const isMale = person.gender === "M";
  const isFemale = person.gender === "F";
  const fill = isMale
    ? "var(--color-heritage-deep)"
    : isFemale
      ? "var(--color-action-primary-bg)"
      : "var(--color-surface-card)";
  const textCol =
    isMale || isFemale ? "var(--color-action-primary-fg)" : "var(--color-text-primary)";
  const stroke = selected ? "var(--color-heritage-accent)" : "transparent";

  return (
    <g
      transform={`translate(${pos.x},${pos.y})`}
      onClick={onClick}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={person.fullName ?? person.code ?? "Thành viên"}
    >
      <rect
        width={NW}
        height={NH}
        rx={6}
        fill={fill}
        stroke={stroke}
        strokeWidth={selected ? 2.5 : 0}
        style={{ transition: "stroke 0.15s" }}
      />
      <text
        x={NW / 2}
        y={22}
        textAnchor="middle"
        fill={textCol}
        style={{ fontFamily: "var(--font-display)", fontSize: 13, fontWeight: 700 }}
      >
        {(person.fullName ?? "—").slice(0, 20)}
      </text>
      <text
        x={NW / 2}
        y={37}
        textAnchor="middle"
        fill={textCol}
        style={{ fontFamily: "var(--font-body)", fontSize: 10.5, opacity: 0.82 }}
      >
        {person.code ?? ""}
        {person.generation != null ? ` · Đời ${person.generation}` : ""}
      </text>
      <text
        x={NW / 2}
        y={51}
        textAnchor="middle"
        fill={textCol}
        style={{ fontFamily: "var(--font-body)", fontSize: 10, opacity: 0.65 }}
      >
        {person.lifeStatus === "deceased" ? "✦ đã mất" : "còn sống"}
      </text>
    </g>
  );
}

// ── Connector lines (SVG) ─────────────────────────────────────────────
function UnionConnectors({
  ul,
  nodes,
}: {
  ul: UnionLine;
  nodes: Map<number, NodeData>;
}) {
  const childNodes = ul.childIds
    .map((id) => nodes.get(id))
    .filter((n): n is NodeData => n != null);

  const dropY = ul.y + 32;
  const childBranchY = childNodes.length > 0
    ? (childNodes[0]?.pos.y ?? dropY + 40) - 16
    : dropY + 40;

  return (
    <g>
      {/* Spouse horizontal line */}
      <line
        x1={ul.leftX}
        y1={ul.y}
        x2={ul.rightX}
        y2={ul.y}
        stroke="var(--color-heritage-line)"
        strokeWidth={2}
      />
      {/* Diamond at union midpoint */}
      <polygon
        points={`${ul.midX},${ul.y - 5} ${ul.midX + 5},${ul.y} ${ul.midX},${ul.y + 5} ${ul.midX - 5},${ul.y}`}
        fill="var(--color-heritage-accent)"
      />
      {/* Vertical drop from union */}
      {childNodes.length > 0 ? (
        <>
          <line
            x1={ul.midX}
            y1={ul.y + 5}
            x2={ul.midX}
            y2={childBranchY}
            stroke="var(--color-heritage-line)"
            strokeWidth={1.5}
          />
          {/* Horizontal bar across children */}
          {childNodes.length > 1 ? (
            <line
              x1={childNodes[0].pos.x + NW / 2}
              y1={childBranchY}
              x2={childNodes[childNodes.length - 1].pos.x + NW / 2}
              y2={childBranchY}
              stroke="var(--color-heritage-line)"
              strokeWidth={1.5}
            />
          ) : null}
          {/* Vertical to each child */}
          {childNodes.map((cn) => (
            <line
              key={cn.personId}
              x1={cn.pos.x + NW / 2}
              y1={childBranchY}
              x2={cn.pos.x + NW / 2}
              y2={cn.pos.y}
              stroke="var(--color-heritage-line)"
              strokeWidth={1.5}
            />
          ))}
        </>
      ) : null}
    </g>
  );
}

// ── Right detail panel ────────────────────────────────────────────────
function UnionPanel({
  unionId,
  union,
  members,
  children,
  persons,
  onClose,
  onAddMember,
  onRemoveMember,
  onAddChild,
  onRemoveChild,
  busy,
}: {
  unionId: number;
  union: FamilyUnionDto;
  members: UnionMemberDto[];
  children: UnionChildDto[];
  persons: PersonDto[];
  onClose: () => void;
  onAddMember: (personId: number, role: string) => void;
  onRemoveMember: (id: number) => void;
  onAddChild: (personId: number) => void;
  onRemoveChild: (id: number) => void;
  busy: boolean;
}) {
  const [memberPersonId, setMemberPersonId] = useState("");
  const [memberRole, setMemberRole] = useState("husband");
  const [childPersonId, setChildPersonId] = useState("");

  const myMembers = members.filter((m) => m.union?.id === unionId);
  const myChildren = children.filter((c) => c.union?.id === unionId);

  const personOptions = [
    { value: "", label: "— Chọn người —" },
    ...persons
      .filter((p) => p.id != null)
      .map((p) => ({
        value: String(p.id),
        label: `${p.fullName ?? "—"} (${p.code ?? "?"})`,
      })),
  ];

  return (
    <aside className="tree-panel">
      <div className="tree-panel-head">
        <h3>Hôn phối #{unionId}</h3>
        <button type="button" className="tree-panel-close" onClick={onClose} aria-label="Đóng">
          <X size={16} />
        </button>
      </div>

      <div className="tree-panel-section">
        <p className="tree-panel-label">Thành viên</p>
        {myMembers.length === 0 ? (
          <p className="tree-panel-empty">Chưa có vợ/chồng.</p>
        ) : (
          <ul className="tree-panel-list">
            {myMembers.map((m) => (
              <li key={m.id}>
                <span>
                  <b>{m.person?.fullName ?? m.person?.code ?? `ID ${m.person?.id}`}</b>
                  <small> · {m.role === "husband" ? "Chồng" : m.role === "wife" ? "Vợ" : m.role}</small>
                </span>
                <button
                  type="button"
                  className="tree-del-btn"
                  disabled={busy}
                  onClick={() => m.id != null && onRemoveMember(m.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="tree-mini-form">
          <Select
            options={personOptions}
            value={memberPersonId}
            onChange={(e) => setMemberPersonId(e.target.value)}
          />
          <Select
            options={[
              { value: "husband", label: "Chồng" },
              { value: "wife", label: "Vợ" },
              { value: "partner", label: "Bạn đời" },
            ]}
            value={memberRole}
            onChange={(e) => setMemberRole(e.target.value)}
          />
          <Button
            type="button"
            disabled={busy || !memberPersonId}
            onClick={() => {
              if (memberPersonId) {
                onAddMember(Number(memberPersonId), memberRole);
                setMemberPersonId("");
              }
            }}
          >
            <UserPlus size={14} /> Thêm
          </Button>
        </div>
      </div>

      <div className="tree-panel-section">
        <p className="tree-panel-label">Con cái ({myChildren.length})</p>
        {myChildren.length === 0 ? (
          <p className="tree-panel-empty">Chưa có con.</p>
        ) : (
          <ul className="tree-panel-list">
            {myChildren.map((c) => (
              <li key={c.id}>
                <span>
                  <b>{c.child?.fullName ?? c.child?.code ?? `ID ${c.child?.id}`}</b>
                </span>
                <button
                  type="button"
                  className="tree-del-btn"
                  disabled={busy}
                  onClick={() => c.id != null && onRemoveChild(c.id)}
                >
                  Xóa
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="tree-mini-form">
          <Select
            options={personOptions}
            value={childPersonId}
            onChange={(e) => setChildPersonId(e.target.value)}
          />
          <Button
            type="button"
            disabled={busy || !childPersonId}
            onClick={() => {
              if (childPersonId) {
                onAddChild(Number(childPersonId));
                setChildPersonId("");
              }
            }}
          >
            <UserPlus size={14} /> Thêm con
          </Button>
        </div>
      </div>
    </aside>
  );
}

// ── Main page ─────────────────────────────────────────────────────────
export function TreeEditorPage() {
  const { getAccessToken } = useAuth();
  const slug = defaultTreeSlug();

  const [unions, setUnions] = useState<FamilyUnionDto[]>([]);
  const [persons, setPersons] = useState<PersonDto[]>([]);
  const [members, setMembers] = useState<UnionMemberDto[]>([]);
  const [children, setChildren] = useState<UnionChildDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Selection / panel
  const [selectedUnionId, setSelectedUnionId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);

  // Pan/zoom
  const [transform, setTransform] = useState({ x: 16, y: 16, scale: 1 });
  const svgRef = useRef<SVGSVGElement>(null);
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);

  // Create union form
  const [showCreateUnion, setShowCreateUnion] = useState(false);
  const [orderNo, setOrderNo] = useState("");

  // Query / search
  const [query, setQuery] = useState("");

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const [u, personPage, m, c] = await Promise.all([
        listTreeUnions(slug, token),
        listTreePersons(slug, token, undefined, 0, 500),
        listUnionMembers(token),
        listUnionChildren(token),
      ]);
      setUnions(u);
      setPersons(personPage.content);
      setMembers(m);
      setChildren(c);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được dữ liệu phả hệ.");
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, slug]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Layout
  const layout = useMemo(
    () => buildLayout(persons, unions, members, children),
    [persons, unions, members, children],
  );

  // Filtered person list
  const filteredPersons = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return persons;
    return persons.filter(
      (p) =>
        (p.fullName ?? "").toLowerCase().includes(q) ||
        (p.code ?? "").toLowerCase().includes(q),
    );
  }, [persons, query]);

  // ── Mutations ──
  async function createUnion() {
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
      setShowCreateUnion(false);
      if (created.id != null) setSelectedUnionId(created.id);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tạo hôn phối thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function addMember(personId: number, role: string) {
    if (!selectedUnionId) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      await createUnionMember(
        { role, union: { id: selectedUnionId }, person: { id: personId } },
        token,
      );
      const token2 = await getAccessToken();
      setMembers(await listUnionMembers(token2));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Thêm thành viên thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function removeMember(id: number) {
    setBusy(true);
    try {
      const token = await getAccessToken();
      await deleteUnionMember(id, token);
      const token2 = await getAccessToken();
      setMembers(await listUnionMembers(token2));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa thành viên thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function addChild(personId: number) {
    if (!selectedUnionId) return;
    const currentChildren = children.filter((c) => c.union?.id === selectedUnionId);
    setBusy(true);
    try {
      const token = await getAccessToken();
      await createUnionChild(
        {
          orderNo: currentChildren.length + 1,
          union: { id: selectedUnionId },
          child: { id: personId },
        },
        token,
      );
      const token2 = await getAccessToken();
      setChildren(await listUnionChildren(token2));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Thêm con thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function removeChild(id: number) {
    setBusy(true);
    try {
      const token = await getAccessToken();
      await deleteUnionChild(id, token);
      const token2 = await getAccessToken();
      setChildren(await listUnionChildren(token2));
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa con thất bại.");
    } finally {
      setBusy(false);
    }
  }

  // ── Pan/zoom handlers ──
  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.min(2.5, Math.max(0.25, t.scale * delta)),
    }));
  }

  function onMouseDown(e: React.MouseEvent) {
    if (e.button !== 0) return;
    dragRef.current = { startX: e.clientX, startY: e.clientY, tx: transform.x, ty: transform.y };
  }

  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const dy = e.clientY - dragRef.current.startY;
    setTransform((t) => ({ ...t, x: dragRef.current!.tx + dx, y: dragRef.current!.ty + dy }));
  }

  function onMouseUp() {
    dragRef.current = null;
  }

  function fitView() {
    setTransform({ x: 16, y: 16, scale: 1 });
  }

  const selectedUnion = selectedUnionId != null ? unions.find((u) => u.id === selectedUnionId) : null;

  return (
    <div className="tree-page">
      <AdminPageHeader
        title="Soạn phả đồ"
        description={`${persons.length} thành viên · ${unions.length} hôn phối · ${children.length} quan hệ cha-con`}
        actions={
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="button" variant="secondary" onClick={() => void reload()} disabled={loading}>
              <RefreshCw size={15} /> Tải lại
            </Button>
            <Button type="button" onClick={() => setShowCreateUnion(true)}>
              <GitBranch size={15} /> Tạo hôn phối
            </Button>
          </div>
        }
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      {/* Create union modal */}
      {showCreateUnion ? (
        <div className="tree-modal-overlay" onClick={() => setShowCreateUnion(false)}>
          <div className="tree-modal" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: "0 0 16px", fontFamily: "var(--font-display)" }}>Tạo hôn phối mới</h3>
            <FormField label="Thứ tự (tùy chọn)">
              <Input
                type="number"
                value={orderNo}
                onChange={(e) => setOrderNo(e.target.value)}
                placeholder="1, 2, 3…"
              />
            </FormField>
            <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
              <Button type="button" disabled={busy} onClick={() => void createUnion()}>
                {busy ? "Đang tạo…" : "Tạo"}
              </Button>
              <Button type="button" variant="secondary" onClick={() => setShowCreateUnion(false)}>
                Hủy
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <div className="tree-workspace">
        {/* Left: person list */}
        <aside className="tree-sidebar">
          <div className="tree-sidebar-head">
            <Users size={14} />
            <span>Thành viên ({persons.length})</span>
          </div>
          <Input
            placeholder="Tìm tên, mã…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Tìm thành viên"
          />
          <div className="tree-person-list">
            {filteredPersons.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`tree-person-item${selectedPersonId === p.id ? " tree-person-item-on" : ""}`}
                onClick={() => {
                  setSelectedPersonId(p.id ?? null);
                  setSelectedUnionId(null);
                  // Scroll / center on person in canvas
                  const node = p.id != null ? layout.nodes.get(p.id) : null;
                  if (node) {
                    setTransform((t) => ({
                      ...t,
                      x: -node.pos.x * t.scale + 200,
                      y: -node.pos.y * t.scale + 200,
                    }));
                  }
                }}
              >
                <span
                  className={`tree-gender-dot ${p.gender === "M" ? "m" : p.gender === "F" ? "f" : "u"}`}
                />
                <div>
                  <div className="tree-person-name">{p.fullName ?? "—"}</div>
                  <div className="tree-person-sub">
                    {p.code ?? ""}
                    {p.generation != null ? ` · Đời ${p.generation}` : ""}
                  </div>
                </div>
              </button>
            ))}
            {filteredPersons.length === 0 ? (
              <p className="tree-panel-empty">Không tìm thấy.</p>
            ) : null}
          </div>
        </aside>

        {/* Center: SVG canvas */}
        <div className="tree-canvas-wrap">
          {/* Zoom controls */}
          <div className="tree-zoom-bar">
            <button
              type="button"
              className="tree-zoom-btn"
              onClick={() => setTransform((t) => ({ ...t, scale: Math.min(2.5, t.scale * 1.2) }))}
              title="Phóng to"
            >
              <ZoomIn size={16} />
            </button>
            <span className="tree-zoom-val">{Math.round(transform.scale * 100)}%</span>
            <button
              type="button"
              className="tree-zoom-btn"
              onClick={() => setTransform((t) => ({ ...t, scale: Math.max(0.25, t.scale * 0.83) }))}
              title="Thu nhỏ"
            >
              <ZoomOut size={16} />
            </button>
            <button type="button" className="tree-zoom-btn" onClick={fitView} title="Khớp màn hình">
              <Maximize2 size={16} />
            </button>
          </div>

          {loading ? (
            <div className="tree-loading">Đang tải phả đồ…</div>
          ) : persons.length === 0 ? (
            <EmptyState
              title="Chưa có thành viên"
              description="Thêm thành viên tại mục Thành viên, sau đó quay lại để tạo phả đồ."
            />
          ) : (
            <svg
              ref={svgRef}
              width="100%"
              height="100%"
              style={{ cursor: dragRef.current ? "grabbing" : "grab", display: "block" }}
              onWheel={onWheel}
              onMouseDown={onMouseDown}
              onMouseMove={onMouseMove}
              onMouseUp={onMouseUp}
              onMouseLeave={onMouseUp}
            >
              <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
                {/* Union connector lines (behind nodes) */}
                {layout.unionLines.map((ul) => (
                  <UnionConnectors key={ul.unionId} ul={ul} nodes={layout.nodes} />
                ))}
                {/* Person nodes */}
                {[...layout.nodes.values()].map((n) => (
                  <PersonNode
                    key={n.personId}
                    data={n}
                    selected={
                      selectedPersonId === n.personId ||
                      // highlight members of selected union
                      (selectedUnionId != null &&
                        members.some(
                          (m) => m.union?.id === selectedUnionId && m.person?.id === n.personId,
                        ))
                    }
                    onClick={() => {
                      setSelectedPersonId(n.personId);
                      // If person belongs to a union, open that union's panel
                      const myUnions = members
                        .filter((m) => m.person?.id === n.personId)
                        .map((m) => m.union?.id)
                        .filter((id): id is number => id != null);
                      if (myUnions.length > 0) setSelectedUnionId(myUnions[0]);
                      else setSelectedUnionId(null);
                    }}
                  />
                ))}
              </g>
            </svg>
          )}
        </div>

        {/* Right: union detail panel */}
        {selectedUnionId != null && selectedUnion ? (
          <UnionPanel
            unionId={selectedUnionId}
            union={selectedUnion}
            members={members}
            children={children}
            persons={persons}
            onClose={() => { setSelectedUnionId(null); setSelectedPersonId(null); }}
            onAddMember={addMember}
            onRemoveMember={removeMember}
            onAddChild={addChild}
            onRemoveChild={removeChild}
            busy={busy}
          />
        ) : null}
      </div>

      {/* Legend */}
      <div className="tree-legend">
        <span className="tree-legend-dot m" /> Nam&ensp;
        <span className="tree-legend-dot f" /> Nữ&ensp;
        <span className="tree-legend-dot u" /> Không rõ&ensp;
        <span style={{ marginLeft: 12, color: "var(--color-text-muted)", fontSize: 11 }}>
          Kéo để di chuyển · Cuộn để phóng to/thu nhỏ · Click node để xem chi tiết hôn phối
        </span>
      </div>
    </div>
  );
}
