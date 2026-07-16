import { layoutFamily } from "./layoutFamily";
import type { FamilyGraph, LayoutResult, TreeNodeInput } from "./types";

export type { TreeNodeInput } from "./types";

export interface LayoutNode extends TreeNodeInput {
  x: number;
  y: number;
}

/**
 * Layout đơn giản theo `generation` (tương thích stub cũ).
 * Ưu tiên dùng {@link layoutFamily} với union/root/depth.
 */
export function layoutTree(nodes: TreeNodeInput[]): LayoutNode[] {
  const NODE_WIDTH = 160;
  const NODE_HEIGHT = 72;
  const H_GAP = 24;
  const V_GAP = 48;

  const byGen = new Map<number, TreeNodeInput[]>();
  for (const node of nodes) {
    const list = byGen.get(node.generation) ?? [];
    list.push(node);
    byGen.set(node.generation, list);
  }

  const generations = [...byGen.keys()].sort((a, b) => a - b);
  const result: LayoutNode[] = [];

  for (const gen of generations) {
    const row = byGen.get(gen) ?? [];
    const rowWidth = row.length * NODE_WIDTH + Math.max(0, row.length - 1) * H_GAP;
    row.forEach((node, index) => {
      result.push({
        ...node,
        x: index * (NODE_WIDTH + H_GAP) - rowWidth / 2 + NODE_WIDTH / 2,
        y: gen * (NODE_HEIGHT + V_GAP),
      });
    });
  }

  return result;
}

/** Chuyển graph phẳng parentId → FamilyGraph tối thiểu rồi layoutFamily */
export function layoutTreeAsFamily(
  nodes: TreeNodeInput[],
  rootId: string,
  maxDepth: number,
): LayoutResult {
  const persons = nodes.map((n) => ({
    id: n.id,
    code: n.id,
    fullName: n.label,
    generation: n.generation,
  }));
  const unions = nodes
    .filter((n) => n.parentId)
    .reduce<FamilyGraph["unions"]>((acc, n) => {
      const uid = `u-from-${n.parentId}`;
      let u = acc.find((x) => x.id === uid);
      if (!u) {
        u = { id: uid, memberIds: [n.parentId!], childIds: [] };
        acc.push(u);
      }
      u.childIds.push(n.id);
      return acc;
    }, []);
  return layoutFamily({ persons, unions }, { rootId, maxDepth });
}
