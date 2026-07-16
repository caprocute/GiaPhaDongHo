import type { CSSProperties } from "react";

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
}

export function Skeleton({ width = "100%", height = "16px" }: SkeletonProps) {
  const style: CSSProperties = {
    width,
    height,
    borderRadius: "var(--radius-sm)",
    background: "var(--color-border-subtle)",
    animation: "pulse 1.5s ease-in-out infinite",
  };

  return <div aria-hidden="true" style={style} />;
}
