import type {
  FamilyGraph,
  LayoutEdge,
  LayoutOptions,
  LayoutResult,
  PersonNodeData,
  PositionedNode,
  UnionNodeData,
} from "./types";

const DEFAULTS = {
  nodeWidth: 168,
  nodeHeight: 76,
  unionSize: 28,
  hGap: 28,
  vGap: 96,
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
    // chỗ cho cặp vợ chồng tối thiểu
    width = Math.max(width, nodeWidth * 2 + hGap + unionSize);
    subtreeWidth.set(personId, width);
    return width;
  }

  function measureUnion(union: UnionNodeData, fromPersonId: string): number {
    const spouses = union.memberIds.filter((id) => includedPersons.has(id));
    const coupleW = spouses.length * nodeWidth + Math.max(0, spouses.length - 1) * hGap + unionSize;
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

    const coupleSpan =
      ordered.length * nodeWidth + Math.max(0, ordered.length - 1) * (hGap + unionSize / 2);
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
      cursor += nodeWidth + hGap;
      if (i === 0 && ordered.length > 1) {
        // chèn chỗ union giữa hai vợ chồng
        cursor += unionSize * 0.25;
      }
    }

    const ux =
      memberCenters.length >= 2
        ? (memberCenters[0]! + memberCenters[1]!) / 2 - unionSize / 2
        : (memberCenters[0] ?? left + slotWidth / 2) - unionSize / 2;
    const uy = primaryY + nodeHeight / 2 - unionSize / 2;
    positions.set(unionKey, { x: ux, y: uy, kind: "union", union, depth });

    for (const mid of ordered) {
      edges.push({
        id: `e-${mid}-${union.id}`,
        source: mid,
        target: union.id,
        kind: "spouse",
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

/** Demo graph nhỏ — họ mẫu (A1→A2/A3) */
export function demoFamilyGraph(): FamilyGraph {
  const persons: PersonNodeData[] = [
    { id: "p1", code: "A1", fullName: "Hoàng Văn Tổ", generation: 1, gender: "M", lifeStatus: "deceased" },
    { id: "p2", code: "A1-sp1", fullName: "Nguyễn Thị Tổ Mẫu", generation: 1, gender: "F", lifeStatus: "deceased" },
    { id: "p3", code: "A2", fullName: "Hoàng Văn Trưởng", generation: 2, gender: "M", lifeStatus: "deceased" },
    { id: "p4", code: "A3", fullName: "Hoàng Văn Thứ", generation: 2, gender: "M", lifeStatus: "alive" },
    { id: "p5", code: "A2-sp1", fullName: "Trần Thị Hoa", generation: 2, gender: "F", lifeStatus: "deceased" },
    { id: "p6", code: "A4", fullName: "Hoàng Minh", generation: 3, gender: "M", lifeStatus: "alive" },
    { id: "p7", code: "A5", fullName: "Hoàng Lan", generation: 3, gender: "F", lifeStatus: "alive" },
  ];
  const unions: UnionNodeData[] = [
    { id: "u1", memberIds: ["p1", "p2"], childIds: ["p3", "p4"] },
    { id: "u2", memberIds: ["p3", "p5"], childIds: ["p6", "p7"] },
  ];
  return { persons, unions };
}
