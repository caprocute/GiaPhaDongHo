import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import type { PersonNodeData } from "../types";
import styles from "./PersonNode.module.css";

export type PersonFlowData = PersonNodeData & {
  label?: string;
  isRoot?: boolean;
  isSelected?: boolean;
  showFrame?: boolean;
};

function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2);
  const a = parts[parts.length - 2]!.slice(0, 1);
  const b = parts[parts.length - 1]!.slice(0, 1);
  return `${a}${b}`.toLocaleUpperCase("vi-VN");
}

function PersonNodeComponent({ data }: NodeProps) {
  const person = data as unknown as PersonFlowData;
  const female = person.gender === "F";
  const showFrame = person.showFrame !== false;
  const subtitle =
    person.subtitle ??
    (person.lifeStatus === "deceased" ? "Đã mất" : person.lifeStatus === "alive" ? "Còn sống" : "—");

  const cls = [
    styles.card,
    person.isRoot ? styles.root : "",
    person.isSelected && !person.isRoot ? styles.selected : "",
    !showFrame ? styles.bare : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cls} data-testid={`person-node-${person.id}`}>
      <Handle type="target" position={Position.Top} id="child-in" className={styles.handle} />
      <div className={styles.top}>
        <span className={`${styles.avatar}${female ? ` ${styles.avatarF}` : ""}`}>
          {initialsOf(person.fullName)}
        </span>
        <div className={styles.meta}>
          <div className={styles.name}>{person.fullName}</div>
          <div className={styles.years}>{subtitle}</div>
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
