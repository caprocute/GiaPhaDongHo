import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import styles from "./UnionNode.module.css";

function UnionNodeComponent(_props: NodeProps) {
  return (
    <div className={styles.union} aria-hidden data-testid="union-node" title="Hôn phối">
      <Handle type="target" position={Position.Left} id="from-left" className={styles.handle} />
      <Handle type="target" position={Position.Right} id="from-right" className={styles.handle} />
      <Handle type="target" position={Position.Top} id="top" className={styles.handle} />
      <Handle type="source" position={Position.Bottom} id="to-children" className={styles.handle} />
    </div>
  );
}

export const UnionNode = memo(UnionNodeComponent);
