export interface TreeNodeInput {
  id: string;
  label: string;
  generation: number;
  parentId?: string;
}

export interface LayoutNode extends TreeNodeInput {
  x: number;
  y: number;
}

const NODE_WIDTH = 160;
const NODE_HEIGHT = 72;
const H_GAP = 24;
const V_GAP = 48;

/** Layout theo đời (generation) — stub cho pipeline React Flow sau này */
export function layoutTree(nodes: TreeNodeInput[]): LayoutNode[] {
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
