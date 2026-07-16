import type { CSSProperties } from "react";
import { layoutTree, type TreeNodeInput } from "./layoutTree";

export interface FamilyTreeCanvasProps {
  nodes: TreeNodeInput[];
  width?: number;
  height?: number;
}

export function FamilyTreeCanvas({ nodes, width = 800, height = 480 }: FamilyTreeCanvasProps) {
  const laidOut = layoutTree(nodes);
  const offsetX = width / 2;
  const offsetY = 40;

  const canvasStyle: CSSProperties = {
    position: "relative",
    width,
    height,
    background: "var(--color-surface-page)",
    border: "1px solid var(--color-border-subtle)",
    borderRadius: "var(--radius-lg)",
    overflow: "hidden",
  };

  const nodeStyle: CSSProperties = {
    position: "absolute",
    width: 160,
    padding: "var(--spacing-sm)",
    background: "var(--color-surface-card)",
    border: "2px solid var(--color-heritage-frame)",
    borderRadius: "var(--radius-md)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-display)",
    fontSize: "var(--font-size-sm)",
    boxShadow: "var(--shadow-sm)",
    textAlign: "center",
  };

  return (
    <div style={canvasStyle} role="img" aria-label="Sơ đồ phả đồ gia phả">
      {laidOut.map((node) => (
        <div
          key={node.id}
          style={{
            ...nodeStyle,
            left: offsetX + node.x - 80,
            top: offsetY + node.y,
          }}
        >
          {node.label}
        </div>
      ))}
    </div>
  );
}
