import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { PersonNodeData } from "../types";
import styles from "./PersonNode.module.css";

export type PersonFlowData = PersonNodeData & {
  label?: string;
  isRoot?: boolean;
};

function initialOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] ?? "?";
  return last.slice(0, 1).toLocaleUpperCase("vi-VN");
}

function PersonNodeComponent({ data }: NodeProps) {
  const person = data as unknown as PersonFlowData;
  const female = person.gender === "F";
  const status =
    person.lifeStatus === "deceased" ? "Đã mất" : person.lifeStatus === "alive" ? "Còn sống" : "—";

  return (
    <div
      className={`${styles.card}${person.isRoot ? ` ${styles.root}` : ""}`}
      data-testid={`person-node-${person.id}`}
    >
      <Handle type="target" position={Position.Top} id="child-in" className={styles.handle} />
      <div className={styles.top}>
        <span className={`${styles.avatar}${female ? ` ${styles.avatarF}` : ""}`}>
          {initialOf(person.fullName)}
        </span>
        <div className={styles.meta}>
          <div className={styles.name}>{person.fullName}</div>
          <div className={styles.years}>{status}</div>
        </div>
      </div>
      <div className={styles.foot}>
        <span className={styles.doi}>
          {person.generation != null ? `Đời ${person.generation}` : "—"}
          {person.isRoot ? " · gốc" : ""}
        </span>
        <span className={styles.code}>{person.code}</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="child-out" className={styles.handle} />
      <Handle type="source" position={Position.Right} id="spouse-out" className={styles.handle} />
      <Handle type="source" position={Position.Left} id="spouse-left" className={styles.handle} />
    </div>
  );
}

export const PersonNode = memo(PersonNodeComponent);
