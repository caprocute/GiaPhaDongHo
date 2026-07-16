import type { FamilyGraph, Gender, LifeStatus } from "@giapha/tree-viz";
import type { ApiPerson } from "./types";

/** Dựng graph từ lineagePath khi API union chưa đủ member/child. */
export function personsToFamilyGraph(persons: ApiPerson[]): FamilyGraph {
  const byCode = new Map(persons.map((p) => [p.code, p]));
  const nodes = persons.map((p) => ({
    id: String(p.id),
    code: p.code,
    fullName: p.fullName,
    generation: p.generation ?? 1,
    gender: (p.gender as Gender) ?? "U",
    lifeStatus: (p.lifeStatus === "deceased" ? "deceased" : "alive") as LifeStatus,
  }));

  const kidsByParent = new Map<string, string[]>();
  for (const p of persons) {
    const parts = (p.lineagePath ?? "").split("/").filter(Boolean);
    if (parts.length < 2) continue;
    const parentCode = parts[parts.length - 2];
    const parent = byCode.get(parentCode);
    if (!parent) continue;
    const pid = String(parent.id);
    const list = kidsByParent.get(pid) ?? [];
    list.push(String(p.id));
    kidsByParent.set(pid, list);
  }

  let i = 0;
  const unions = [...kidsByParent.entries()].map(([parentId, childIds]) => ({
    id: `u-${++i}`,
    memberIds: [parentId],
    childIds,
  }));

  return { persons: nodes, unions };
}
