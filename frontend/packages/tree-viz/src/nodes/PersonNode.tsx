import { memo, type CSSProperties } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { PersonNodeData } from "../types";

export type PersonFlowData = PersonNodeData & { label?: string };

function PersonNodeComponent({ data }: NodeProps) {
  const person = data as unknown as PersonFlowData;
  const deceased = person.lifeStatus === "deceased";
  const box: CSSProperties = {
    width: 168,
    minHeight: 72,
    padding: "var(--spacing-sm)",
    background: "var(--color-surface-card)",
    border: `2px solid ${deceased ? "var(--color-heritage-frame)" : "var(--color-action-primary-bg)"}`,
    borderRadius: "var(--radius-md)",
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-display)",
    fontSize: "var(--font-size-sm)",
    boxShadow: "var(--shadow-sm)",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    gap: 2,
  };

  return (
    <div style={box} data-testid={`person-node-${person.id}`}>
      <Handle type="target" position={Position.Top} style={{ opacity: 0 }} />
      <strong style={{ fontWeight: 600 }}>{person.fullName}</strong>
      <span style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)", fontSize: "var(--font-size-xs)" }}>
        {person.code}
        {person.generation != null ? ` · đời ${person.generation}` : null}
      </span>
      <Handle type="source" position={Position.Bottom} style={{ opacity: 0 }} />
      <Handle type="source" position={Position.Right} id="spouse" style={{ opacity: 0 }} />
      <Handle type="target" position={Position.Left} id="spouse" style={{ opacity: 0 }} />
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
