import type { FamilyUnionDto, PersonDto, UnionChildDto, UnionMemberDto } from "../api/genealogyApi";

export const NW = 148;
export const NH = 58;
export const H_GAP = 28;
export const FAMILY_GAP = 48;
export const ROW_H = 148;

export type Pos = { x: number; y: number };

export type NodeData = {
  personId: number;
  person: PersonDto;
  pos: Pos;
  /** generation = null — hàng «Chưa phân đời» */
  warnOrphan?: boolean;
};

export type UnionLine = {
  unionId: number;
  leftX: number;
  rightX: number;
  midX: number;
  y: number;
  childIds: number[];
};

export type LayoutResult = {
  nodes: Map<number, NodeData>;
  unionLines: UnionLine[];
  svgWidth: number;
  svgHeight: number;
  generations: number[];
  /** Index hàng nhãn «Chưa phân đời»; -1 nếu không có */
  orphanGenerationIndex: number;
};

function codeSortKey(code: string | null | undefined): string {
  return (code ?? "").toLowerCase();
}

/** Lọc descendants từ root (theo union children). */
export function collectDescendantIds(
  rootId: number,
  members: UnionMemberDto[],
  children: UnionChildDto[],
): Set<number> {
  const unionsOf = new Map<number, number[]>();
  for (const m of members) {
    if (m.person?.id == null || m.union?.id == null) continue;
    const a = unionsOf.get(m.person.id) ?? [];
    a.push(m.union.id);
    unionsOf.set(m.person.id, a);
  }
  const kidsOf = new Map<number, number[]>();
  for (const c of children) {
    if (c.union?.id == null || c.child?.id == null) continue;
    const a = kidsOf.get(c.union.id) ?? [];
    a.push(c.child.id);
    kidsOf.set(c.union.id, a);
  }

  const out = new Set<number>([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const id = queue.shift()!;
    for (const uid of unionsOf.get(id) ?? []) {
      for (const cid of kidsOf.get(uid) ?? []) {
        if (!out.has(cid)) {
          out.add(cid);
          queue.push(cid);
        }
      }
    }
  }
  return out;
}

export function buildLayout(
  persons: PersonDto[],
  _unions: FamilyUnionDto[],
  members: UnionMemberDto[],
  children: UnionChildDto[],
): LayoutResult {
  if (persons.length === 0) {
    return {
      nodes: new Map(),
      unionLines: [],
      svgWidth: 400,
      svgHeight: 200,
      generations: [],
      orphanGenerationIndex: -1,
    };
  }

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
  for (const c of children) {
    if (!c.union?.id || !c.child?.id) continue;
    const a = childrenByUnion.get(c.union.id) ?? [];
    a.push(c.child.id);
    childrenByUnion.set(c.union.id, a);
  }

  const byGen = new Map<number, PersonDto[]>();
  for (const p of persons) {
    if (p.id == null) continue;
    const g = p.generation ?? 1;
    const arr = byGen.get(g) ?? [];
    arr.push(p);
    byGen.set(g, arr);
  }
  for (const [g, arr] of byGen) {
    arr.sort((a, b) => codeSortKey(a.code).localeCompare(codeSortKey(b.code), "vi"));
    byGen.set(g, arr);
  }

  const gens = [...byGen.keys()].sort((a, b) => a - b);
  const nodes = new Map<number, NodeData>();
  const unionLines: UnionLine[] = [];

  gens.forEach((gen, genIdx) => {
    const ps = [...(byGen.get(gen) ?? [])];
    const placed = new Set<number>();
    let curX = 80;
    const y = 24 + genIdx * ROW_H;
    const genUnionMid = new Map<number, number>();

    for (const p of ps) {
      if (!p.id || placed.has(p.id)) continue;
      placed.add(p.id);

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

    for (const [uid, midX] of genUnionMid) {
      const mateIds = membersByUnion.get(uid) ?? [];
      const leftId = mateIds[0];
      const rightId = mateIds[1];
      const leftNode = leftId != null ? nodes.get(leftId) : null;
      const rightNode = rightId != null ? nodes.get(rightId) : null;
      if (!leftNode || !rightNode) continue;
      const a = leftNode.pos.x <= rightNode.pos.x ? leftNode : rightNode;
      const b = leftNode.pos.x <= rightNode.pos.x ? rightNode : leftNode;
      unionLines.push({
        unionId: uid,
        leftX: a.pos.x + NW,
        rightX: b.pos.x,
        midX,
        y: y + NH / 2,
        childIds: childrenByUnion.get(uid) ?? [],
      });
    }

    // FR-12a.7 — hôn phối 1 người (hoặc chưa có vợ/chồng trên cùng đời): đường cha-con từ node cha/mẹ
    for (const [uid, mateIds] of membersByUnion) {
      if (genUnionMid.has(uid)) continue;
      const childIds = childrenByUnion.get(uid) ?? [];
      if (childIds.length === 0) continue;
      const parentOnRow = mateIds
        .map((id) => nodes.get(id))
        .filter((n): n is NodeData => n != null && (n.person.generation ?? 1) === gen);
      if (parentOnRow.length === 0) continue;
      const parent = parentOnRow[0]!;
      const midX = parent.pos.x + NW / 2;
      unionLines.push({
        unionId: uid,
        leftX: midX,
        rightX: midX,
        midX,
        y: parent.pos.y + NH / 2,
        childIds,
      });
    }
  });

  const orphans = persons.filter((p) => p.id != null && p.generation == null && !nodes.has(p.id!));
  const orphanGenerationIndex = orphans.length > 0 ? gens.length : -1;
  if (orphans.length > 0) {
    const y = 24 + gens.length * ROW_H;
    orphans.forEach((p, i) => {
      if (p.id != null) {
        nodes.set(p.id, {
          personId: p.id,
          person: p,
          pos: { x: 80 + i * (NW + FAMILY_GAP), y },
          warnOrphan: true,
        });
      }
    });
  }

  let maxX = 400;
  let maxY = 200;
  for (const n of nodes.values()) {
    maxX = Math.max(maxX, n.pos.x + NW + 48);
    maxY = Math.max(maxY, n.pos.y + NH + 48);
  }

  return {
    nodes,
    unionLines,
    svgWidth: maxX,
    svgHeight: maxY,
    generations: gens,
    orphanGenerationIndex,
  };
}
