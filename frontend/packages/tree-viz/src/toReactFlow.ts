import type { Edge, Node } from "@xyflow/react";
import type { LayoutResult } from "./types";

export type ToFlowOptions = {
  selectedId?: string | null;
  showFrame?: boolean;
};

export function toReactFlowElements(
  layout: LayoutResult,
  options: ToFlowOptions = {},
): { nodes: Node[]; edges: Edge[] } {
  const { selectedId = null, showFrame = true } = options;

  const nodes: Node[] = layout.nodes.map((n) => {
    if (n.kind === "person" && n.person) {
      return {
        id: n.id,
        type: "person",
        position: { x: n.x, y: n.y },
        data: {
          ...n.person,
          isRoot: n.id === layout.rootId,
          isSelected: n.id === selectedId,
          showFrame,
        },
        draggable: false,
        connectable: false,
        style: { width: n.width, height: n.height },
      };
    }
    return {
      id: n.id,
      type: "union",
      position: { x: n.x, y: n.y },
      data: { ...(n.union ?? {}) },
      draggable: false,
      connectable: false,
      style: { width: n.width, height: n.height },
    };
  });

  const edges: Edge[] = layout.edges.map((e) => {
    if (e.kind === "spouse") {
      return {
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: "straight",
        style: {
          stroke: "var(--color-heritage-accent)",
          strokeWidth: 1.3,
          strokeDasharray: "2 4",
        },
      };
    }
    return {
      id: e.id,
      source: e.source,
      target: e.target,
      sourceHandle: "to-children",
      targetHandle: "child-in",
      type: "smoothstep",
      pathOptions: { borderRadius: 6, offset: 0 },
      style: {
        stroke: "color-mix(in srgb, var(--color-action-primary-bg) 50%, var(--color-border-strong))",
        strokeWidth: 1.5,
      },
    };
  });

  return { nodes, edges };
}
