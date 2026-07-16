import type { Edge, Node } from "@xyflow/react";
import type { LayoutResult } from "./types";

export function toReactFlowElements(layout: LayoutResult): { nodes: Node[]; edges: Edge[] } {
  const nodes: Node[] = layout.nodes.map((n) => {
    if (n.kind === "person" && n.person) {
      return {
        id: n.id,
        type: "person",
        position: { x: n.x, y: n.y },
        data: { ...n.person },
        draggable: false,
        connectable: false,
      };
    }
    return {
      id: n.id,
      type: "union",
      position: { x: n.x, y: n.y },
      data: { ...(n.union ?? {}) },
      draggable: false,
      connectable: false,
    };
  });

  const edges: Edge[] = layout.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: "smoothstep",
    style: {
      stroke: "var(--color-heritage-frame)",
      strokeWidth: e.kind === "spouse" ? 2 : 1.5,
    },
  }));

  return { nodes, edges };
}
