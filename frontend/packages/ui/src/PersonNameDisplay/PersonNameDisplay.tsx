import type { CSSProperties } from "react";

export interface PersonNameDisplayProps {
  fullName: string;
  generation?: number;
  honorific?: string;
}

export function PersonNameDisplay({ fullName, generation, honorific }: PersonNameDisplayProps) {
  const style: CSSProperties = {
    color: "var(--color-text-primary)",
    fontFamily: "var(--font-display)",
    fontSize: "var(--font-size-lg)",
  };

  const meta: CSSProperties = {
    color: "var(--color-text-muted)",
    fontFamily: "var(--font-body)",
    fontSize: "var(--font-size-sm)",
    marginTop: "var(--spacing-xs)",
  };

  return (
    <div>
      <h2 style={style}>
        {honorific ? `${honorific} ` : ""}
        {fullName}
      </h2>
      {generation != null ? <p style={meta}>Đời {generation}</p> : null}
    </div>
  );
}
