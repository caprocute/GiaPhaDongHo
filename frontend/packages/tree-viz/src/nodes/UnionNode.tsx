import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

function UnionNodeComponent(_props: NodeProps) {
  const style: CSSProperties = {
    width: 28,
    height: 28,
    borderRadius: "50%",
    background: "var(--color-heritage-accent)",
    border: "2px solid var(--color-heritage-frame)",
    boxShadow: "var(--shadow-sm)",
  };

  return (
    <div style={style} aria-hidden data-testid="union-node">
      <Handle type="target" position={Position.Left} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Right} style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
    </div>
  );
}

export const UnionNode = memo(UnionNodeComponent);
