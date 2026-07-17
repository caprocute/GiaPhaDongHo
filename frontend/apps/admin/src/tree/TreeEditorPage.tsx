import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Button,
  Dialog,
  DualDatePicker,
  EmptyState,
  FormField,
  Input,
  Select,
  Textarea,
  type DualDateValue,
} from "@giapha/ui";
import {
  GitBranch,
  Maximize2,
  RefreshCw,
  UserPlus,
  Users,
  X,
  ZoomIn,
  ZoomOut,
} from "lucide-react";
import {
  createTreePerson,
  createTreeUnion,
  createUnionChild,
  createUnionMember,
  defaultTreeSlug,
  deleteFamilyUnion,
  deletePersonById,
  deleteUnionChild,
  deleteUnionMember,
  getTreeSettings,
  listTreePersons,
  listTreeUnions,
  listUnionChildren,
  listUnionMembers,
  updateFamilyUnion,
  type FamilyUnionDto,
  type PersonDto,
  type UnionChildDto,
  type UnionMemberDto,
} from "../api/genealogyApi";
import { ApiError } from "../api/http";
import { adminSiteTitle, persistAdminSiteTitle } from "../lib/siteTitle";
import {
  NH,
  NW,
  ROW_H,
  buildLayout,
  collectDescendantIds,
  type NodeData,
  type UnionLine,
} from "./treeLayout";
import styles from "./treeEditor.module.css";

type GenderFilter = "all" | "M" | "F";

type MarriageInfo = {
  type?: string;
  marriageSolar?: string;
  status?: string;
};

function parseMarriageInfo(raw: string | null | undefined): MarriageInfo {
  if (!raw?.trim()) return {};
  try {
    return JSON.parse(raw) as MarriageInfo;
  } catch {
    return { type: raw };
  }
}

function dualFromIso(iso: string | null | undefined): DualDateValue | null {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return null;
  return { solar: { year: y, month: m, day: d } };
}

function isoFromDual(v: DualDateValue | null): string | undefined {
  if (!v?.solar) return undefined;
  const { year, month, day } = v.solar;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

/** Control compact trong rail/panel — đồng bộ với --te-control-h */
const compactControl = {
  minHeight: 36,
  fontSize: "var(--font-size-sm)",
  borderRadius: "var(--radius-sm)",
} as const;

function initials(name: string | null | undefined): string {
  const p = (name ?? "").trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0]!.slice(0, 2).toUpperCase();
  return `${p[0]![0] ?? ""}${p[p.length - 1]![0] ?? ""}`.toUpperCase();
}

function PersonNodeSvg({
  data,
  selected,
  onClick,
}: {
  data: NodeData;
  selected: boolean;
  onClick: () => void;
}) {
  const { person, pos } = data;
  const g = person.gender;
  const mark = g === "M" ? "♂" : g === "F" ? "♀" : "?";
  const warn = data.warnOrphan === true;
  const stroke = warn
    ? "var(--color-heritage-accent)"
    : g === "M"
      ? "var(--color-heritage-deep)"
      : g === "F"
        ? "var(--color-action-primary-bg)"
        : "var(--color-border-strong)";
  const fill = selected
    ? g === "M"
      ? "color-mix(in srgb, var(--color-heritage-deep) 18%, var(--color-surface-card))"
      : g === "F"
        ? "color-mix(in srgb, var(--color-action-primary-bg) 18%, var(--color-surface-card))"
        : "var(--color-surface-sunken)"
    : "var(--color-surface-card)";
  const accent = warn
    ? "var(--color-heritage-accent)"
    : g === "M"
      ? "var(--color-heritage-deep)"
      : g === "F"
        ? "var(--color-action-primary-bg)"
        : "var(--color-heritage-line)";

  return (
    <g
      transform={`translate(${pos.x},${pos.y})`}
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      style={{ cursor: "pointer" }}
      role="button"
      aria-label={person.fullName ?? person.code ?? "Thành viên"}
    >
      <rect
        width={NW}
        height={NH}
        rx={8}
        fill={fill}
        stroke={stroke}
        strokeWidth={selected || warn ? 2.5 : 1.5}
      />
      <rect x={0} y={0} width={8} height={NH} rx={0} fill={accent} />
      <text
        x={16}
        y={20}
        textAnchor="start"
        fill="var(--color-text-primary)"
        style={{ fontFamily: "var(--font-display)", fontSize: 12, fontWeight: 700 }}
      >
        {(person.fullName ?? "—").slice(0, 16)}
      </text>
      <text
        x={16}
        y={36}
        textAnchor="start"
        fill="var(--color-text-muted)"
        style={{ fontFamily: "var(--font-body)", fontSize: 10 }}
      >
        {person.code ?? "—"}
        {person.generation != null ? ` · Đời ${person.generation}` : warn ? " · Chưa phân đời" : ""}
      </text>
      <text
        x={16}
        y={50}
        textAnchor="start"
        fill="var(--color-text-secondary)"
        style={{ fontFamily: "var(--font-body)", fontSize: 9 }}
      >
        {mark}
        {person.generation != null ? ` Đời ${person.generation}` : ""}
        {person.lifeStatus === "deceased" ? " · đã mất" : ""}
      </text>
    </g>
  );
}

function UnionConnectors({
  ul,
  nodes,
  selected,
  onDiamondClick,
}: {
  ul: UnionLine;
  nodes: Map<number, NodeData>;
  selected: boolean;
  onDiamondClick: () => void;
}) {
  const childNodes = ul.childIds.map((id) => nodes.get(id)).filter((n): n is NodeData => n != null);
  const childBranchY = childNodes.length > 0 ? (childNodes[0]?.pos.y ?? ul.y) - 16 : ul.y + 40;

  return (
    <g>
      {ul.leftX !== ul.rightX ? (
        <line
          x1={ul.leftX}
          y1={ul.y}
          x2={ul.rightX}
          y2={ul.y}
          stroke="var(--color-heritage-frame)"
          strokeWidth={1.5}
          strokeDasharray="5 3"
        />
      ) : null}
      <polygon
        points={`${ul.midX},${ul.y - 6} ${ul.midX + 6},${ul.y} ${ul.midX},${ul.y + 6} ${ul.midX - 6},${ul.y}`}
        fill="var(--color-heritage-accent)"
        stroke="var(--color-surface-card)"
        strokeWidth={selected ? 2 : 1.5}
        style={{ cursor: "pointer" }}
        onClick={(e) => {
          e.stopPropagation();
          onDiamondClick();
        }}
      />
      <text
        x={ul.midX}
        y={ul.y + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--color-text-on-brand)"
        style={{ fontSize: 9, fontWeight: 800, pointerEvents: "none" }}
      >
        ♥
      </text>
      {childNodes.length > 0 ? (
        <>
          <line
            x1={ul.midX}
            y1={ul.y + 6}
            x2={ul.midX}
            y2={childBranchY}
            stroke="var(--color-border-strong)"
            strokeWidth={1.5}
          />
          {childNodes.length > 1 ? (
            <line
              x1={childNodes[0]!.pos.x + NW / 2}
              y1={childBranchY}
              x2={childNodes[childNodes.length - 1]!.pos.x + NW / 2}
              y2={childBranchY}
              stroke="var(--color-border-strong)"
              strokeWidth={1.5}
            />
          ) : null}
          {childNodes.map((cn) => (
            <line
              key={cn.personId}
              x1={cn.pos.x + NW / 2}
              y1={childBranchY}
              x2={cn.pos.x + NW / 2}
              y2={cn.pos.y}
              stroke="var(--color-border-strong)"
              strokeWidth={1.5}
            />
          ))}
        </>
      ) : null}
    </g>
  );
}

export function TreeEditorPage() {
  const { getAccessToken } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const slug = defaultTreeSlug();
  const rootCode = searchParams.get("root");
  const [clanTitle, setClanTitle] = useState(() => adminSiteTitle());

  const [unions, setUnions] = useState<FamilyUnionDto[]>([]);
  const [persons, setPersons] = useState<PersonDto[]>([]);
  const [members, setMembers] = useState<UnionMemberDto[]>([]);
  const [children, setChildren] = useState<UnionChildDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [selectedUnionId, setSelectedUnionId] = useState<number | null>(null);
  const [selectedPersonId, setSelectedPersonId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [genderFilter, setGenderFilter] = useState<GenderFilter>("all");
  const [genFilter, setGenFilter] = useState<string>("all");

  const [transform, setTransform] = useState({ x: 16, y: 16, scale: 1 });
  const dragRef = useRef<{ startX: number; startY: number; tx: number; ty: number } | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);
  const didFitRef = useRef(false);
  const didLoadToastRef = useRef(false);

  const [showCreateUnion, setShowCreateUnion] = useState(false);
  const [showCreatePerson, setShowCreatePerson] = useState(false);
  const [husbandId, setHusbandId] = useState("");
  const [wifeId, setWifeId] = useState("");
  const [marriageType, setMarriageType] = useState("chinh_that");
  const [marriageDate, setMarriageDate] = useState<DualDateValue | null>(null);
  const [newName, setNewName] = useState("");
  const [newGender, setNewGender] = useState("M");
  const [newGen, setNewGen] = useState("1");
  const [newLife, setNewLife] = useState("alive");
  const [newNotes, setNewNotes] = useState("");
  const [newBirth, setNewBirth] = useState<DualDateValue | null>(null);
  const [newParentCode, setNewParentCode] = useState("");

  const [memberPersonId, setMemberPersonId] = useState("");
  const [memberRole, setMemberRole] = useState("husband");
  const [childPersonId, setChildPersonId] = useState("");

  const [editMarriageType, setEditMarriageType] = useState("chinh_that");
  const [editMarriageDate, setEditMarriageDate] = useState<DualDateValue | null>(null);
  const [editMarriageStatus, setEditMarriageStatus] = useState("married");

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    window.setTimeout(() => setToast(null), 3000);
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const [u, personPage, m, c, settings] = await Promise.all([
        listTreeUnions(slug, token),
        listTreePersons(slug, token, undefined, 0, 500),
        listUnionMembers(token),
        listUnionChildren(token),
        getTreeSettings(slug, token).catch(() => null),
      ]);
      const list = personPage.content;
      const ids = new Set(list.map((p) => p.id).filter((id): id is number => id != null));
      setUnions(u);
      setPersons(list);
      setMembers(m.filter((x) => x.person?.id != null && ids.has(x.person.id)));
      setChildren(c.filter((x) => x.child?.id != null && ids.has(x.child.id)));
      if (settings?.displayName) {
        setClanTitle(settings.displayName);
        persistAdminSiteTitle(settings.displayName);
      }
      if (!didLoadToastRef.current) {
        didLoadToastRef.current = true;
        showToast(`✓ Đã tải ${list.length} thành viên`);
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được dữ liệu phả hệ.");
    } finally {
      setLoading(false);
    }
  }, [getAccessToken, slug, showToast]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key !== "Escape") return;
      if (showCreateUnion || showCreatePerson) return;
      if (selectedUnionId != null || selectedPersonId != null) {
        setSelectedUnionId(null);
        setSelectedPersonId(null);
        return;
      }
      if (window.history.length > 1) navigate(-1);
      else navigate("/");
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showCreateUnion, showCreatePerson, selectedUnionId, selectedPersonId, navigate]);

  const rootPerson = useMemo(
    () => (rootCode ? persons.find((p) => p.code === rootCode) : null),
    [persons, rootCode],
  );

  const visiblePersons = useMemo(() => {
    if (!rootPerson?.id) return persons;
    const keep = collectDescendantIds(rootPerson.id, members, children);
    // include spouses of descendants
    for (const m of members) {
      if (m.person?.id != null && keep.has(m.person.id) && m.union?.id != null) {
        for (const m2 of members) {
          if (m2.union?.id === m.union.id && m2.person?.id != null) keep.add(m2.person.id);
        }
      }
    }
    return persons.filter((p) => p.id != null && keep.has(p.id));
  }, [persons, members, children, rootPerson]);

  const layout = useMemo(
    () => buildLayout(visiblePersons, unions, members, children),
    [visiblePersons, unions, members, children],
  );

  const generationOptions = useMemo(() => {
    const gens = [...new Set(persons.map((p) => p.generation).filter((g): g is number => g != null))];
    gens.sort((a, b) => a - b);
    return [
      { value: "all", label: "Mọi đời" },
      ...gens.map((g) => ({ value: String(g), label: `Đời ${g}` })),
    ];
  }, [persons]);

  const filteredSidebar = useMemo(() => {
    const q = query.trim().toLowerCase();
    return persons.filter((p) => {
      if (genderFilter !== "all" && p.gender !== genderFilter) return false;
      if (genFilter !== "all" && String(p.generation) !== genFilter) return false;
      if (!q) return true;
      return (
        (p.fullName ?? "").toLowerCase().includes(q) || (p.code ?? "").toLowerCase().includes(q)
      );
    });
  }, [persons, query, genderFilter, genFilter]);

  const selectedUnion = selectedUnionId != null ? unions.find((u) => u.id === selectedUnionId) : null;
  const selectedPerson =
    selectedPersonId != null ? persons.find((p) => p.id === selectedPersonId) : null;

  const personOptions = useMemo(
    () => [
      { value: "", label: "— Chọn người —" },
      ...persons
        .filter((p) => p.id != null)
        .map((p) => ({
          value: String(p.id),
          label: `${p.fullName ?? "—"} (${p.code ?? "?"})`,
        })),
    ],
    [persons],
  );

  function focusPerson(id: number) {
    const node = layout.nodes.get(id);
    const box = canvasRef.current?.getBoundingClientRect();
    if (!node || !box) return;
    setTransform((t) => ({
      ...t,
      x: box.width / 2 - (node.pos.x + NW / 2) * t.scale,
      y: box.height / 2 - (node.pos.y + NH / 2) * t.scale,
    }));
  }

  function fitView() {
    const box = canvasRef.current?.getBoundingClientRect();
    if (!box || layout.nodes.size === 0) {
      setTransform({ x: 16, y: 16, scale: 1 });
      return;
    }
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const n of layout.nodes.values()) {
      minX = Math.min(minX, n.pos.x);
      minY = Math.min(minY, n.pos.y);
      maxX = Math.max(maxX, n.pos.x + NW);
      maxY = Math.max(maxY, n.pos.y + NH);
    }
    const w = maxX - minX + 80;
    const h = maxY - minY + 80;
    const scale = Math.min(2, Math.max(0.25, Math.min((box.width - 40) / w, (box.height - 40) / h)));
    setTransform({
      scale,
      x: (box.width - w * scale) / 2 - minX * scale + 20,
      y: (box.height - h * scale) / 2 - minY * scale + 20,
    });
  }

  useEffect(() => {
    if (loading || layout.nodes.size === 0 || didFitRef.current) return;
    didFitRef.current = true;
    window.requestAnimationFrame(() => fitView());
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, layout.nodes.size, rootCode]);

  useEffect(() => {
    didFitRef.current = false;
  }, [rootCode]);

  async function createUnion() {
    if (!husbandId && !wifeId) {
      setError("Chọn ít nhất một thành viên cho hôn phối.");
      return;
    }
    const h = husbandId ? persons.find((p) => p.id === Number(husbandId)) : null;
    const w = wifeId ? persons.find((p) => p.id === Number(wifeId)) : null;
    if (
      h?.generation != null &&
      w?.generation != null &&
      h.generation !== w.generation &&
      !window.confirm(
        `Hai người khác đời (Đời ${h.generation} và Đời ${w.generation}). Vẫn tạo hôn phối?`,
      )
    ) {
      return;
    }
    if (h?.id != null && w?.id != null) {
      const pairExists = unions.some((u) => {
        if (u.id == null) return false;
        const ids = members.filter((m) => m.union?.id === u.id).map((m) => m.person?.id);
        return ids.includes(h.id) && ids.includes(w.id);
      });
      if (pairExists && !window.confirm("Đã có hôn phối giữa hai người này. Tạo thêm?")) return;
    }
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const created = await createTreeUnion(
        slug,
        {
          marriageInfoJson: JSON.stringify({
            type: marriageType,
            marriageSolar: isoFromDual(marriageDate),
            status: "married",
          }),
        },
        token,
      );
      if (created.id != null) {
        if (husbandId) {
          await createUnionMember(
            { role: "husband", union: { id: created.id }, person: { id: Number(husbandId) } },
            token,
          );
        }
        if (wifeId) {
          await createUnionMember(
            { role: "wife", union: { id: created.id }, person: { id: Number(wifeId) } },
            token,
          );
        }
        setSelectedUnionId(created.id);
        setSelectedPersonId(null);
      }
      setShowCreateUnion(false);
      setHusbandId("");
      setWifeId("");
      setMarriageDate(null);
      await reload();
      showToast(`✓ Đã tạo hôn phối #${created.id ?? "—"}`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tạo hôn phối thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function createPerson() {
    if (!newName.trim()) {
      setError("Nhập họ tên thành viên.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const parent = newParentCode
        ? persons.find((p) => String(p.id) === newParentCode)
        : null;
      const gen =
        Number(newGen) ||
        (parent?.generation != null ? parent.generation + 1 : 1);
      const created = await createTreePerson(
        slug,
        {
          fullName: newName.trim(),
          gender: newGender,
          generation: gen,
          lifeStatus: newLife,
          notes: newNotes.trim() || undefined,
          birthSolar: isoFromDual(newBirth),
        },
        token,
        parent?.code ? { parentCode: parent.code } : undefined,
      );
      setShowCreatePerson(false);
      setNewName("");
      setNewNotes("");
      setNewBirth(null);
      setNewParentCode("");
      await reload();
      if (created.id != null) {
        setSelectedPersonId(created.id);
        setSelectedUnionId(null);
        window.setTimeout(() => focusPerson(created.id!), 100);
      }
      showToast(`✓ Đã thêm ${created.fullName ?? "thành viên"} (${created.code ?? ""})`);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Thêm thành viên thất bại.");
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
      await reload();
      showToast("✓ Đã thêm thành viên hôn phối");
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
      await reload();
      showToast("✓ Đã gỡ thành viên khỏi hôn phối");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa thành viên thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function addChild(personId: number) {
    if (!selectedUnionId) return;
    const n = children.filter((c) => c.union?.id === selectedUnionId).length;
    setBusy(true);
    try {
      const token = await getAccessToken();
      await createUnionChild(
        { orderNo: n + 1, union: { id: selectedUnionId }, child: { id: personId } },
        token,
      );
      await reload();
      showToast("✓ Đã liên kết con");
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
      await reload();
      showToast("✓ Đã gỡ liên kết con");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa con thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function removeUnion() {
    if (!selectedUnionId) return;
    if (!window.confirm("Xóa hôn phối này? Chỉ xóa liên kết, không xóa thành viên.")) return;
    if (!window.confirm("Xác nhận lần 2: xóa hôn phối?")) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      const mid = members.filter((m) => m.union?.id === selectedUnionId);
      const cid = children.filter((c) => c.union?.id === selectedUnionId);
      for (const c of cid) if (c.id != null) await deleteUnionChild(c.id, token);
      for (const m of mid) if (m.id != null) await deleteUnionMember(m.id, token);
      await deleteFamilyUnion(selectedUnionId, token);
      setSelectedUnionId(null);
      await reload();
      showToast("✓ Đã xóa hôn phối");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa hôn phối thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function saveMarriageInfo() {
    if (!selectedUnionId || !selectedUnion) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await updateFamilyUnion(
        selectedUnionId,
        {
          ...selectedUnion,
          marriageInfoJson: JSON.stringify({
            type: editMarriageType,
            marriageSolar: isoFromDual(editMarriageDate),
            status: editMarriageStatus,
          }),
        },
        token,
      );
      await reload();
      showToast("✓ Đã lưu thông tin hôn nhân");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Lưu hôn nhân thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function removePersonFromTree() {
    if (!selectedPerson?.id) return;
    if (
      !window.confirm(
        `Xóa «${selectedPerson.fullName ?? selectedPerson.code}» khỏi cây? Hồ sơ sẽ bị xóa khỏi hệ thống.`,
      )
    ) {
      return;
    }
    if (!window.confirm("Xác nhận lần 2: xóa thành viên này?")) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await deletePersonById(selectedPerson.id, token);
      setSelectedPersonId(null);
      await reload();
      showToast("✓ Đã xóa thành viên khỏi cây");
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa thành viên thất bại.");
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    if (!selectedUnion) return;
    const info = parseMarriageInfo(selectedUnion.marriageInfoJson);
    setEditMarriageType(info.type ?? "chinh_that");
    setEditMarriageDate(dualFromIso(info.marriageSolar));
    setEditMarriageStatus(info.status ?? "married");
  }, [selectedUnion]);

  function onWheel(e: React.WheelEvent) {
    e.preventDefault();
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    setTransform((t) => ({
      ...t,
      scale: Math.min(2, Math.max(0.2, t.scale * delta)),
    }));
  }

  function closeEditor() {
    if (window.history.length > 1) navigate(-1);
    else navigate("/");
  }

  const personUnions = useMemo(() => {
    if (!selectedPerson?.id) return [] as { unionId: number; role: string }[];
    return members
      .filter((m) => m.person?.id === selectedPerson.id && m.union?.id != null)
      .map((m) => ({ unionId: m.union!.id!, role: m.role ?? "?" }));
  }, [members, selectedPerson]);

  const parentUnionId = useMemo(() => {
    if (!selectedPerson?.id) return null;
    return children.find((c) => c.child?.id === selectedPerson.id)?.union?.id ?? null;
  }, [children, selectedPerson]);

  const panelOpen = selectedUnionId != null || selectedPersonId != null;
  const myMembers = members.filter((m) => m.union?.id === selectedUnionId);
  const myChildren = children.filter((c) => c.union?.id === selectedUnionId);

  const ui = (
    <div className={styles.fs} role="dialog" aria-modal="true" aria-label="Soạn phả đồ">
      <header className={styles.topbar}>
        <span className={styles.brand}>GiaPhaHub</span>
        <span className={styles.sep} aria-hidden />
        <div className={styles.titleBlock}>
          <h1 className={styles.title}>Soạn phả đồ · {clanTitle}</h1>
          <p className={styles.sub}>Ban quản trị tộc sự</p>
        </div>
        <div className={styles.stats}>
          <b>{persons.length}</b> thành viên · <b>{unions.length}</b> hôn phối ·{" "}
          <b>{children.length}</b> cha-con
        </div>
        <div className={styles.actions}>
          <button type="button" className={styles.ghostBtn} onClick={() => void reload()} disabled={loading}>
            <RefreshCw size={16} /> Tải lại
          </button>
          <Button
            type="button"
            onClick={() => setShowCreateUnion(true)}
            style={{ minHeight: 36, padding: "0 16px", fontSize: "var(--font-size-sm)" }}
          >
            <GitBranch size={16} /> Tạo hôn phối
          </Button>
          <button type="button" className={styles.closeBtn} onClick={closeEditor} aria-label="Đóng">
            <X size={18} />
          </button>
        </div>
      </header>

      {error ? (
        <div className={styles.banner}>
          <Alert title="Lỗi" variant="error">
            {error}{" "}
            <Button type="button" variant="secondary" onClick={() => void reload()}>
              Thử lại
            </Button>
          </Alert>
        </div>
      ) : null}

      <div className={panelOpen ? `${styles.workspace} ${styles.workspaceWithPanel}` : styles.workspace}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarHead}>
            <h3>
              <Users size={16} style={{ marginRight: 8, verticalAlign: -2 }} />
              Thành viên ({persons.length})
            </h3>
            <Input
              placeholder="Tìm tên hoặc mã hiệu…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Tìm thành viên"
              style={compactControl}
            />
            <div className={styles.filters}>
              {(
                [
                  ["all", "Tất cả"],
                  ["M", "Nam"],
                  ["F", "Nữ"],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  className={genderFilter === id ? `${styles.chip} ${styles.chipOn}` : styles.chip}
                  onClick={() => setGenderFilter(id)}
                >
                  {label}
                </button>
              ))}
            </div>
            <Select
              options={generationOptions}
              value={genFilter}
              onChange={(e) => setGenFilter(e.target.value)}
              aria-label="Lọc theo đời"
              style={compactControl}
            />
          </div>
          <div className={styles.list}>
            {filteredSidebar.map((p) => (
              <button
                key={p.id}
                type="button"
                className={
                  selectedPersonId === p.id ? `${styles.member} ${styles.memberOn}` : styles.member
                }
                onClick={() => {
                  if (p.id == null) return;
                  setSelectedPersonId(p.id);
                  setSelectedUnionId(null);
                  if (rootCode && !visiblePersons.some((v) => v.id === p.id)) {
                    if (window.confirm("Người này ngoài nhánh đang xem. Về toàn cây?")) {
                      setSearchParams({});
                    }
                  }
                  window.setTimeout(() => focusPerson(p.id!), 50);
                }}
              >
                <span
                  className={`${styles.avatar} ${
                    p.gender === "M" ? styles.avatarM : p.gender === "F" ? styles.avatarF : styles.avatarU
                  }`}
                >
                  {initials(p.fullName)}
                </span>
                <div style={{ minWidth: 0 }}>
                  <div className={styles.memberName}>{p.fullName ?? "—"}</div>
                  <div className={styles.memberMeta}>
                    {p.code ?? "—"}
                    {p.generation != null ? ` · Đời ${p.generation}` : ""}
                  </div>
                  {p.generation === 1 ? <span className={styles.badge}>Thủy tổ</span> : null}
                </div>
              </button>
            ))}
            {filteredSidebar.length === 0 ? (
              <p className={styles.emptyHint}>Không tìm thấy.</p>
            ) : null}
          </div>
          <div className={styles.sidebarFoot}>
            <Button
              type="button"
              style={{ width: "100%", minHeight: 36, fontSize: "var(--font-size-sm)" }}
              onClick={() => setShowCreatePerson(true)}
            >
              <UserPlus size={16} /> Thêm thành viên
            </Button>
          </div>
        </aside>

        <div
          ref={canvasRef}
          className={styles.canvasWrap}
          onWheel={onWheel}
          onMouseDown={(e) => {
            if (e.button !== 0) return;
            dragRef.current = {
              startX: e.clientX,
              startY: e.clientY,
              tx: transform.x,
              ty: transform.y,
            };
          }}
          onMouseMove={(e) => {
            if (!dragRef.current) return;
            setTransform((t) => ({
              ...t,
              x: dragRef.current!.tx + (e.clientX - dragRef.current!.startX),
              y: dragRef.current!.ty + (e.clientY - dragRef.current!.startY),
            }));
          }}
          onMouseUp={() => {
            dragRef.current = null;
          }}
          onMouseLeave={() => {
            dragRef.current = null;
          }}
          onClick={() => {
            setSelectedPersonId(null);
            setSelectedUnionId(null);
          }}
        >
          {rootPerson ? (
            <div className={styles.rootBanner}>
              Đang xem: <b>{rootPerson.fullName}</b> & hậu duệ
              <Button type="button" variant="secondary" onClick={() => setSearchParams({})}>
                Về toàn cây
              </Button>
            </div>
          ) : null}

          <div className={styles.zoomBar}>
            <button
              type="button"
              className={styles.zoomBtn}
              title="Phóng to"
              onClick={() => setTransform((t) => ({ ...t, scale: Math.min(2, t.scale * 1.2) }))}
            >
              <ZoomIn size={16} />
            </button>
            <span className={styles.zoomVal}>{Math.round(transform.scale * 100)}%</span>
            <button
              type="button"
              className={styles.zoomBtn}
              title="Thu nhỏ"
              onClick={() => setTransform((t) => ({ ...t, scale: Math.max(0.2, t.scale * 0.83) }))}
            >
              <ZoomOut size={16} />
            </button>
            <button type="button" className={styles.zoomBtn} title="Vừa màn hình" onClick={fitView}>
              <Maximize2 size={16} />
            </button>
          </div>

          <div className={styles.legend}>
            <span>
              <i className={`${styles.dot} ${styles.dotM}`} /> Nam
            </span>
            <span>
              <i className={`${styles.dot} ${styles.dotF}`} /> Nữ
            </span>
            <span>
              <i className={`${styles.dot} ${styles.dotU}`} /> Hôn phối
            </span>
            <span className={styles.legendHint}>— — Hôn nhân · —— Cha-con</span>
          </div>

          {loading ? (
            <div className={styles.loading}>Đang tải phả đồ…</div>
          ) : visiblePersons.length === 0 ? (
            <EmptyState
              title="Chưa có thành viên"
              description="Thêm thành viên để dựng phả đồ."
            />
          ) : (
            <>
              {layout.generations.map((gen, idx) => (
                <div
                  key={gen}
                  className={styles.genLabel}
                  style={{ top: 24 + idx * ROW_H + NH / 2 - 10 + transform.y }}
                >
                  Đời {gen}
                  {gen === 1 ? " · Thủy tổ" : ""}
                </div>
              ))}
              {layout.orphanGenerationIndex >= 0 ? (
                <div
                  className={styles.genLabel}
                  style={{
                    top: 24 + layout.orphanGenerationIndex * ROW_H + NH / 2 - 10 + transform.y,
                  }}
                >
                  Chưa phân đời
                </div>
              ) : null}
              <svg width="100%" height="100%" style={{ display: "block" }}>
                <g transform={`translate(${transform.x},${transform.y}) scale(${transform.scale})`}>
                  {layout.unionLines.map((ul) => (
                    <UnionConnectors
                      key={ul.unionId}
                      ul={ul}
                      nodes={layout.nodes}
                      selected={selectedUnionId === ul.unionId}
                      onDiamondClick={() => {
                        setSelectedUnionId(ul.unionId);
                        setSelectedPersonId(null);
                      }}
                    />
                  ))}
                  {[...layout.nodes.values()].map((n) => (
                    <PersonNodeSvg
                      key={n.personId}
                      data={n}
                      selected={
                        selectedPersonId === n.personId ||
                        (selectedUnionId != null &&
                          members.some(
                            (m) => m.union?.id === selectedUnionId && m.person?.id === n.personId,
                          ))
                      }
                      onClick={() => {
                        setSelectedPersonId(n.personId);
                        setSelectedUnionId(null);
                      }}
                    />
                  ))}
                </g>
              </svg>
            </>
          )}

          {toast ? <div className={styles.toast}>{toast}</div> : null}
        </div>

        {selectedUnion && selectedUnionId != null ? (
          <aside className={styles.panel}>
            <div className={styles.panelHead}>
              <h3>Hôn phối #{selectedUnionId}</h3>
              <button
                type="button"
                className={styles.panelClose}
                aria-label="Đóng"
                onClick={() => setSelectedUnionId(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Thành viên hôn phối</p>
                {myMembers.map((m) => (
                  <div key={m.id} className={styles.row}>
                    <div className={styles.rowInfo}>
                      <div className={styles.rowName}>{m.person?.fullName ?? "—"}</div>
                      <div className={styles.rowMeta}>
                        {m.role === "husband" ? "Chồng" : m.role === "wife" ? "Vợ" : m.role}
                      </div>
                    </div>
                    <button
                      type="button"
                      className={styles.delLink}
                      disabled={busy}
                      onClick={() => m.id != null && void removeMember(m.id)}
                    >
                      Xóa
                    </button>
                  </div>
                ))}
                <div className={styles.miniForm}>
                  <Select
                    options={personOptions}
                    value={memberPersonId}
                    onChange={(e) => setMemberPersonId(e.target.value)}
                    style={compactControl}
                  />
                  <div className={styles.miniFormRow}>
                    <Select
                      options={[
                        { value: "husband", label: "Chồng" },
                        { value: "wife", label: "Vợ" },
                        { value: "partner", label: "Bạn đời" },
                      ]}
                      value={memberRole}
                      onChange={(e) => setMemberRole(e.target.value)}
                      style={compactControl}
                    />
                    <Button
                      type="button"
                      disabled={busy || !memberPersonId}
                      style={{ minHeight: 36, fontSize: "var(--font-size-sm)", flex: "none" }}
                      onClick={() => {
                        void addMember(Number(memberPersonId), memberRole);
                        setMemberPersonId("");
                      }}
                    >
                      + Thêm
                    </Button>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Con cái ({myChildren.length})</p>
                <p className={styles.rowMeta}>
                  Liên kết người đã có — không tạo mới tại đây.
                </p>
                {myChildren.map((c) => (
                  <span key={c.id} className={styles.tag}>
                    {c.child?.fullName ?? c.child?.code ?? "—"}
                    <button
                      type="button"
                      className={styles.delLink}
                      disabled={busy}
                      onClick={() => c.id != null && void removeChild(c.id)}
                    >
                      ×
                    </button>
                  </span>
                ))}
                <div className={styles.miniForm}>
                  <div className={styles.miniFormRow}>
                    <Select
                      options={personOptions}
                      value={childPersonId}
                      onChange={(e) => setChildPersonId(e.target.value)}
                      style={compactControl}
                    />
                    <Button
                      type="button"
                      disabled={busy || !childPersonId}
                      style={{ minHeight: 36, fontSize: "var(--font-size-sm)", flex: "none" }}
                      onClick={() => {
                        void addChild(Number(childPersonId));
                        setChildPersonId("");
                      }}
                    >
                      + Thêm
                    </Button>
                  </div>
                </div>
              </div>

              <div className={styles.section}>
                <p className={styles.sectionTitle}>Thông tin hôn nhân</p>
                <FormField label="Loại hôn nhân">
                  <Select
                    options={[
                      { value: "chinh_that", label: "Chính thất" },
                      { value: "thu_that", label: "Thứ thất" },
                      { value: "nguoi_yeu", label: "Người yêu" },
                      { value: "chua_ro", label: "Chưa rõ" },
                    ]}
                    value={editMarriageType}
                    onChange={(e) => setEditMarriageType(e.target.value)}
                    style={compactControl}
                  />
                </FormField>
                <DualDatePicker
                  label="Ngày cưới (dương / âm)"
                  optional
                  value={editMarriageDate}
                  onChange={setEditMarriageDate}
                />
                <FormField label="Trạng thái">
                  <Select
                    options={[
                      { value: "married", label: "Đang hôn nhân" },
                      { value: "divorced", label: "Ly hôn" },
                      { value: "widowed", label: "Góa" },
                      { value: "unknown", label: "Chưa rõ" },
                    ]}
                    value={editMarriageStatus}
                    onChange={(e) => setEditMarriageStatus(e.target.value)}
                    style={compactControl}
                  />
                </FormField>
                <div className={styles.miniFormRow}>
                  <Button type="button" disabled={busy} onClick={() => void saveMarriageInfo()}>
                    Lưu thay đổi
                  </Button>
                  <Button type="button" variant="secondary" disabled={busy} onClick={() => void removeUnion()}>
                    Xóa hôn phối
                  </Button>
                </div>
              </div>
            </div>
          </aside>
        ) : null}

        {selectedPerson && selectedUnionId == null ? (
          <aside className={styles.panel}>
            <div className={styles.panelHead}>
              <h3>{selectedPerson.fullName ?? "Thành viên"}</h3>
              <button
                type="button"
                className={styles.panelClose}
                aria-label="Đóng"
                onClick={() => setSelectedPersonId(null)}
              >
                <X size={16} />
              </button>
            </div>
            <div className={styles.panelBody}>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Thông tin cơ bản</p>
                <div className={styles.rowMeta}>Mã: {selectedPerson.code ?? "—"}</div>
                <div className={styles.rowMeta}>
                  Giới tính:{" "}
                  {selectedPerson.gender === "M"
                    ? "Nam"
                    : selectedPerson.gender === "F"
                      ? "Nữ"
                      : "Chưa rõ"}
                </div>
                <div className={styles.rowMeta}>Đời: {selectedPerson.generation ?? "—"}</div>
                <div className={styles.rowMeta}>
                  Tình trạng: {selectedPerson.lifeStatus === "deceased" ? "Đã mất" : "Còn sống"}
                </div>
              </div>
              <div className={styles.section}>
                <p className={styles.sectionTitle}>Quan hệ</p>
                <div className={styles.rowMeta}>
                  Là con của hôn phối:{" "}
                  {parentUnionId != null ? (
                    <button
                      type="button"
                      className={styles.delLink}
                      onClick={() => {
                        setSelectedUnionId(parentUnionId);
                        setSelectedPersonId(null);
                      }}
                    >
                      #{parentUnionId}
                      {(() => {
                        const parents = members
                          .filter((m) => m.union?.id === parentUnionId)
                          .map((m) => m.person?.fullName)
                          .filter(Boolean);
                        return parents.length ? ` (${parents.join(" · ")})` : "";
                      })()}
                    </button>
                  ) : (
                    "—"
                  )}
                </div>
                <div className={styles.rowMeta}>
                  Con: {children.filter((c) => {
                    const uid = c.union?.id;
                    if (uid == null || !selectedPerson?.id) return false;
                    return members.some(
                      (m) => m.union?.id === uid && m.person?.id === selectedPerson.id,
                    );
                  }).length}
                </div>
                <div className={styles.rowMeta}>
                  Hôn phối ({personUnions.length}):
                </div>
                {personUnions.length === 0 ? (
                  <div className={styles.rowMeta}>Chưa có</div>
                ) : (
                  personUnions.map((u) => (
                    <button
                      key={u.unionId}
                      type="button"
                      className={styles.member}
                      style={{ width: "100%" }}
                      onClick={() => {
                        setSelectedUnionId(u.unionId);
                        setSelectedPersonId(null);
                      }}
                    >
                      <div className={styles.memberName}>Hôn phối #{u.unionId}</div>
                      <div className={styles.memberMeta}>{u.role}</div>
                    </button>
                  ))
                )}
              </div>
              <div className={styles.miniForm}>
                {selectedPerson.code ? (
                  <Button
                    type="button"
                    style={{ width: "100%", minHeight: 36, fontSize: "var(--font-size-sm)" }}
                    onClick={() => navigate(`/persons/${encodeURIComponent(selectedPerson.code!)}`)}
                  >
                    Xem / sửa hồ sơ đầy đủ
                  </Button>
                ) : null}
                <Button
                  type="button"
                  variant="secondary"
                  style={{ minHeight: 36, fontSize: "var(--font-size-sm)" }}
                  onClick={() => {
                    if (selectedPerson.code) {
                      setSearchParams({ root: selectedPerson.code });
                      showToast(`Đang xem nhánh hậu duệ của ${selectedPerson.fullName}`);
                    }
                  }}
                >
                  Đặt làm gốc cây
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  style={{ minHeight: 36, fontSize: "var(--font-size-sm)" }}
                  onClick={() => setShowCreatePerson(true)}
                >
                  Thêm thành viên mới
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={busy}
                  style={{
                    minHeight: 36,
                    fontSize: "var(--font-size-sm)",
                    color: "var(--color-status-error-fg)",
                  }}
                  onClick={() => void removePersonFromTree()}
                >
                  Xóa khỏi cây
                </Button>
              </div>
            </div>
          </aside>
        ) : null}
      </div>

      <Dialog
        open={showCreateUnion}
        title="Tạo hôn phối"
        description="Chọn vợ/chồng đã có trong cây. Có thể để trống một bên nếu chưa rõ tên."
        onClose={() => setShowCreateUnion(false)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setShowCreateUnion(false)}>
              Hủy
            </Button>
            <Button type="button" disabled={busy} onClick={() => void createUnion()}>
              {busy ? "Đang tạo…" : "Tạo hôn phối"}
            </Button>
          </>
        }
      >
        <FormField label="Thành viên 1 (chồng)">
          <Select options={personOptions} value={husbandId} onChange={(e) => setHusbandId(e.target.value)} />
        </FormField>
        <FormField label="Thành viên 2 (vợ)">
          <Select options={personOptions} value={wifeId} onChange={(e) => setWifeId(e.target.value)} />
        </FormField>
        <FormField label="Loại hôn nhân">
          <Select
            options={[
              { value: "chinh_that", label: "Chính thất" },
              { value: "thu_that", label: "Thứ thất" },
              { value: "partner", label: "Người yêu / bạn đời" },
              { value: "unknown", label: "Chưa rõ" },
            ]}
            value={marriageType}
            onChange={(e) => setMarriageType(e.target.value)}
          />
        </FormField>
        <DualDatePicker
          label="Ngày cưới (dương / âm)"
          optional
          value={marriageDate}
          onChange={setMarriageDate}
        />
      </Dialog>

      <Dialog
        open={showCreatePerson}
        title="Thêm thành viên"
        description="Mã hiệu do hệ thống sinh theo cấu hình dòng họ. Hồ sơ dùng chung với cổng thông tin."
        onClose={() => setShowCreatePerson(false)}
        footer={
          <>
            <Button type="button" variant="secondary" onClick={() => setShowCreatePerson(false)}>
              Hủy
            </Button>
            <Button type="button" disabled={busy} onClick={() => void createPerson()}>
              {busy ? "Đang lưu…" : "Lưu thành viên"}
            </Button>
          </>
        }
      >
        <FormField label="Họ tên" required>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Họ và tên" />
        </FormField>
        <FormField label="Giới tính" required>
          <Select
            options={[
              { value: "M", label: "Nam" },
              { value: "F", label: "Nữ" },
              { value: "U", label: "Chưa rõ" },
            ]}
            value={newGender}
            onChange={(e) => setNewGender(e.target.value)}
          />
        </FormField>
        <FormField label="Cha/mẹ (tuỳ chọn)" hint="Gắn nhánh và gợi ý đời = đời cha + 1">
          <Select
            options={[{ value: "", label: "— Không chọn —" }, ...personOptions]}
            value={newParentCode}
            onChange={(e) => {
              const v = e.target.value;
              setNewParentCode(v);
              const p = persons.find((x) => String(x.id) === v);
              if (p?.generation != null) setNewGen(String(p.generation + 1));
            }}
          />
        </FormField>
        <FormField label="Đời" required>
          <Input value={newGen} onChange={(e) => setNewGen(e.target.value)} inputMode="numeric" />
        </FormField>
        <DualDatePicker
          label="Ngày sinh (dương / âm)"
          optional
          value={newBirth}
          onChange={setNewBirth}
        />
        <FormField label="Tình trạng" required>
          <Select
            options={[
              { value: "alive", label: "Còn sống" },
              { value: "deceased", label: "Đã mất" },
            ]}
            value={newLife}
            onChange={(e) => setNewLife(e.target.value)}
          />
        </FormField>
        <FormField label="Ghi chú">
          <Textarea rows={2} value={newNotes} onChange={(e) => setNewNotes(e.target.value)} />
        </FormField>
      </Dialog>
    </div>
  );

  return createPortal(ui, document.body);
}
