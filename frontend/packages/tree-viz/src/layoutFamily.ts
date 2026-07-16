import type {
  FamilyGraph,
  LayoutEdge,
  LayoutOptions,
  LayoutResult,
  PersonNodeData,
  PositionedNode,
  UnionNodeData,
} from "./types";

/** Khớp mockup Di sản sống (.pnode 170px, hàng đời ~166px) */
const DEFAULTS = {
  nodeWidth: 170,
  nodeHeight: 88,
  unionSize: 8,
  /** Khoảng giữa anh/chị/em (subtree) */
  hGap: 40,
  /** Khoảng dọc giữa đáy hàng trên → đỉnh hàng dưới */
  vGap: 78,
  /** Khoảng mỗi bên nút hôn phối (vợ–chồng) */
  spouseGap: 18,
};

interface WalkFrame {
  personId: string;
  depth: number;
}

/**
 * Layout gia phả Việt: hàng ngang theo đời, union node hôn phối, con theo thứ tự.
 * Root + maxDepth giới hạn subtree (FR-04).
 */
export function layoutFamily(graph: FamilyGraph, options: LayoutOptions): LayoutResult {
  const nodeWidth = options.nodeWidth ?? DEFAULTS.nodeWidth;
  const nodeHeight = options.nodeHeight ?? DEFAULTS.nodeHeight;
  const unionSize = options.unionSize ?? DEFAULTS.unionSize;
  const hGap = options.hGap ?? DEFAULTS.hGap;
  const vGap = options.vGap ?? DEFAULTS.vGap;
  const spouseGap = options.spouseGap ?? DEFAULTS.spouseGap;
  const { rootId, maxDepth } = options;

  const personById = new Map(graph.persons.map((p) => [p.id, p]));
  if (!personById.has(rootId)) {
    return emptyResult(rootId, maxDepth);
  }

  const unionsByMember = new Map<string, UnionNodeData[]>();
  for (const u of graph.unions) {
    for (const mid of u.memberIds) {
      const list = unionsByMember.get(mid) ?? [];
      list.push(u);
      unionsByMember.set(mid, list);
    }
  }

  const includedPersons = new Set<string>();
  const includedUnions = new Set<string>();
  const queue: WalkFrame[] = [{ personId: rootId, depth: 0 }];
  includedPersons.add(rootId);

  while (queue.length > 0) {
    const { personId, depth } = queue.shift()!;
    const unions = unionsByMember.get(personId) ?? [];
    for (const union of unions) {
      includedUnions.add(union.id);
      for (const mid of union.memberIds) {
        if (personById.has(mid)) includedPersons.add(mid);
      }
      // Hậu duệ chỉ mở khi còn ngân sách depth (FR-04)
      if (depth >= maxDepth) continue;
      for (const childId of union.childIds) {
        if (!personById.has(childId) || includedPersons.has(childId)) continue;
        includedPersons.add(childId);
        queue.push({ personId: childId, depth: depth + 1 });
      }
    }
  }

  /** depth tương đối của person (min path từ root qua union→child) */
  const depthOf = new Map<string, number>();
  depthOf.set(rootId, 0);
  const dQueue = [rootId];
  while (dQueue.length > 0) {
    const pid = dQueue.shift()!;
    const d = depthOf.get(pid)!;
    for (const union of unionsByMember.get(pid) ?? []) {
      if (!includedUnions.has(union.id)) continue;
      for (const mid of union.memberIds) {
        if (!depthOf.has(mid)) depthOf.set(mid, d);
      }
      if (d >= maxDepth) continue;
      for (const childId of union.childIds) {
        if (!includedPersons.has(childId)) continue;
        const next = d + 1;
        if (!depthOf.has(childId) || next < depthOf.get(childId)!) {
          depthOf.set(childId, next);
          dQueue.push(childId);
        }
      }
    }
  }

  const subtreeWidth = new Map<string, number>();

  function measurePerson(personId: string): number {
    if (subtreeWidth.has(personId)) return subtreeWidth.get(personId)!;
    const d = depthOf.get(personId) ?? 0;
    const unions = (unionsByMember.get(personId) ?? []).filter((u) => includedUnions.has(u.id));
    if (unions.length === 0 || d >= maxDepth) {
      subtreeWidth.set(personId, nodeWidth);
      return nodeWidth;
    }
    let width = 0;
    for (const union of unions) {
      width = Math.max(width, measureUnion(union, personId));
    }
    // chỗ cho cặp vợ chồng tối thiểu: [người][gap][union][gap][phối]
    width = Math.max(width, coupleWidth(2));
    subtreeWidth.set(personId, width);
    return width;
  }

  function coupleWidth(memberCount: number): number {
    if (memberCount <= 1) return nodeWidth;
    return (
      memberCount * nodeWidth +
      (memberCount - 1) * (spouseGap * 2 + unionSize)
    );
  }

  function measureUnion(union: UnionNodeData, fromPersonId: string): number {
    const spouses = union.memberIds.filter((id) => includedPersons.has(id));
    const coupleW = coupleWidth(spouses.length);
    if ((depthOf.get(fromPersonId) ?? 0) >= maxDepth) return coupleW;
    let childrenW = 0;
    for (const childId of union.childIds) {
      if (!includedPersons.has(childId)) continue;
      childrenW += measurePerson(childId) + hGap;
    }
    if (childrenW > 0) childrenW -= hGap;
    return Math.max(coupleW, childrenW);
  }

  measurePerson(rootId);

  const positions = new Map<string, { x: number; y: number; kind: "person" | "union"; person?: PersonNodeData; union?: UnionNodeData; depth: number }>();
  const edges: LayoutEdge[] = [];

  function placePerson(personId: string, left: number): void {
    if (positions.has(`person:${personId}`)) return;
    const person = personById.get(personId)!;
    const depth = depthOf.get(personId) ?? 0;
    const width = measurePerson(personId);
    const cx = left + width / 2;
    const y = depth * (nodeHeight + vGap);

    const unions = (unionsByMember.get(personId) ?? []).filter((u) => includedUnions.has(u.id));
    if (unions.length === 0) {
      positions.set(`person:${personId}`, { x: cx - nodeWidth / 2, y, kind: "person", person, depth });
      return;
    }

    // Layout từng union (thường 1); căn couple trong slot — vẫn vẽ phối khi hết depth
    for (const union of unions) {
      placeUnion(union, personId, left, width, y, depth);
    }
  }

  function placeUnion(
    union: UnionNodeData,
    primaryId: string,
    left: number,
    slotWidth: number,
    primaryY: number,
    depth: number,
  ): void {
    const unionKey = `union:${union.id}`;
    if (positions.has(unionKey)) return;

    const members = union.memberIds.filter((id) => includedPersons.has(id));
    // primary trước, còn lại sau (thứ tự hiển thị)
    const ordered = [
      ...members.filter((id) => id === primaryId),
      ...members.filter((id) => id !== primaryId),
    ];

    const coupleSpan = coupleWidth(ordered.length);
    let cursor = left + (slotWidth - coupleSpan) / 2;

    const memberCenters: number[] = [];
    for (let i = 0; i < ordered.length; i++) {
      const mid = ordered[i]!;
      const key = `person:${mid}`;
      if (!positions.has(key)) {
        positions.set(key, {
          x: cursor,
          y: primaryY,
          kind: "person",
          person: personById.get(mid),
          depth: depthOf.get(mid) ?? depth,
        });
      }
      memberCenters.push(cursor + nodeWidth / 2);
      cursor += nodeWidth;
      if (i < ordered.length - 1) {
        // khoảng trống: spouseGap + union + spouseGap
        cursor += spouseGap * 2 + unionSize;
      }
    }

    const ux =
      memberCenters.length >= 2
        ? (memberCenters[0]! + memberCenters[1]!) / 2 - unionSize / 2
        : (memberCenters[0] ?? left + slotWidth / 2) - unionSize / 2;
    const uy = primaryY + nodeHeight / 2 - unionSize / 2;
    positions.set(unionKey, { x: ux, y: uy, kind: "union", union, depth });

    for (let i = 0; i < ordered.length; i++) {
      const mid = ordered[i]!;
      edges.push({
        id: `e-${mid}-${union.id}`,
        source: mid,
        target: union.id,
        kind: "spouse",
        /** Trái: cạnh phải → union; phải: cạnh trái → union */
        sourceHandle: i === 0 ? "spouse-out" : "spouse-left",
        targetHandle: i === 0 ? "from-left" : "from-right",
      });
    }

    const childIds = union.childIds.filter((id) => includedPersons.has(id));
    if (childIds.length === 0 || depth >= maxDepth) return;

    let childLeft = left;
    const totalChildrenW = childIds.reduce((acc, id) => acc + measurePerson(id), 0) + hGap * (childIds.length - 1);
    childLeft = left + (slotWidth - totalChildrenW) / 2;

    for (const childId of childIds) {
      const cw = measurePerson(childId);
      placePerson(childId, childLeft);
      edges.push({
        id: `e-${union.id}-${childId}`,
        source: union.id,
        target: childId,
        kind: "child",
      });
      childLeft += cw + hGap;
    }
  }

  placePerson(rootId, 0);

  const nodes: PositionedNode[] = [];
  for (const [key, pos] of positions) {
    if (pos.kind === "person" && pos.person) {
      nodes.push({
        id: pos.person.id,
        kind: "person",
        x: pos.x,
        y: pos.y,
        width: nodeWidth,
        height: nodeHeight,
        person: pos.person,
        depth: pos.depth,
      });
    } else if (pos.kind === "union" && pos.union) {
      nodes.push({
        id: pos.union.id,
        kind: "union",
        x: pos.x,
        y: pos.y,
        width: unionSize,
        height: unionSize,
        union: pos.union,
        depth: pos.depth,
      });
    } else {
      void key;
    }
  }

  // Deduplicate spouse edges (undirected logical)
  const edgeKeys = new Set<string>();
  const uniqueEdges = edges.filter((e) => {
    const k = `${e.kind}:${e.source}->${e.target}`;
    if (edgeKeys.has(k)) return false;
    edgeKeys.add(k);
    return true;
  });

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    minX = Math.min(minX, n.x);
    minY = Math.min(minY, n.y);
    maxX = Math.max(maxX, n.x + n.width);
    maxY = Math.max(maxY, n.y + n.height);
  }
  if (!Number.isFinite(minX)) {
    minX = minY = 0;
    maxX = maxY = 0;
  }

  return {
    nodes,
    edges: uniqueEdges,
    bounds: { minX, minY, maxX, maxY },
    rootId,
    maxDepth,
  };
}

function emptyResult(rootId: string, maxDepth: number): LayoutResult {
  return {
    nodes: [],
    edges: [],
    bounds: { minX: 0, minY: 0, maxX: 0, maxY: 0 },
    rootId,
    maxDepth,
  };
}

/** Demo graph khớp mockup — nhánh Hoàng Văn Thành / Thạch */
export function demoFamilyGraph(): FamilyGraph {
  const persons: PersonNodeData[] = [
    {
      id: "a7",
      code: "A7",
      fullName: "Hoàng Văn Thành",
      generation: 5,
      gender: "M",
      lifeStatus: "deceased",
      subtitle: "1785 · Ất Tỵ — 14/6 ÂL",
    },
    {
      id: "a7sp",
      code: "A7-sp1",
      fullName: "Phạm Thị Soạn",
      generation: 5,
      gender: "F",
      lifeStatus: "deceased",
      subtitle: "Chánh thất",
    },
    {
      id: "a18",
      code: "A18",
      fullName: "Hoàng Thị The",
      generation: 6,
      gender: "F",
      lifeStatus: "deceased",
      subtitle: "1810 — ?",
    },
    {
      id: "a22",
      code: "A22",
      fullName: "Hoàng Văn Thạch",
      generation: 6,
      gender: "M",
      lifeStatus: "deceased",
      subtitle: "1815 · Ất Hợi — 23/2 ÂL",
    },
    {
      id: "a27",
      code: "A27",
      fullName: "Hoàng Thị Thêu",
      generation: 6,
      gender: "F",
      lifeStatus: "deceased",
      subtitle: "1818 — ?",
    },
    {
      id: "a27sp",
      code: "A27-sp1",
      fullName: "Võ Văn Đáp",
      generation: 6,
      gender: "M",
      lifeStatus: "deceased",
      subtitle: "Rể · thôn Sa Động",
    },
    {
      id: "a31",
      code: "A31",
      fullName: "Hoàng Thị Vân",
      generation: 7,
      gender: "F",
      lifeStatus: "deceased",
      subtitle: "1842 — 1919",
    },
    {
      id: "a36",
      code: "A36",
      fullName: "Hoàng Văn Cẩm",
      generation: 7,
      gender: "M",
      lifeStatus: "deceased",
      subtitle: "1846 — 12/8 ÂL",
    },
    {
      id: "a38",
      code: "A38",
      fullName: "Hoàng Kỳ",
      generation: 7,
      gender: "M",
      lifeStatus: "deceased",
      subtitle: "1851 · Tân Hợi",
    },
    {
      id: "a39",
      code: "A39",
      fullName: "Hoàng Thị Búa",
      generation: 7,
      gender: "F",
      lifeStatus: "deceased",
      subtitle: "1854 — ?",
    },
    {
      id: "a55",
      code: "A55",
      fullName: "Hoàng Liệu",
      generation: 8,
      gender: "M",
      lifeStatus: "alive",
      subtitle: "1884 — 30/4 ÂL",
    },
    {
      id: "a57",
      code: "A57",
      fullName: "Hoàng Văn Kĩnh",
      generation: 8,
      gender: "M",
      lifeStatus: "deceased",
      subtitle: "1889 — 19/4 ÂL",
    },
  ];
  const unions: UnionNodeData[] = [
    { id: "u1", memberIds: ["a7", "a7sp"], childIds: ["a18", "a22", "a27"] },
    { id: "u2", memberIds: ["a27", "a27sp"], childIds: [] },
    { id: "u3", memberIds: ["a22"], childIds: ["a31", "a36", "a38", "a39"] },
    { id: "u4", memberIds: ["a38"], childIds: ["a55", "a57"] },
  ];
  return { persons, unions };
}
