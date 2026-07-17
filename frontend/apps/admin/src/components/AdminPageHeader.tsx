import type { CSSProperties, ReactNode } from "react";

type Props = {
  title: string;
  description?: ReactNode;
  actions?: ReactNode;
};

const wrap: CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "var(--spacing-md)",
  flexWrap: "wrap",
  marginBottom: "var(--spacing-sm)",
};

const titleStyle: CSSProperties = {
  fontFamily: "var(--font-display)",
  fontSize: "clamp(1.35rem, 2.2vw, 1.65rem)",
  fontWeight: 700,
  margin: 0,
  letterSpacing: "-0.01em",
  color: "var(--color-text-primary)",
  lineHeight: 1.2,
};

const descStyle: CSSProperties = {
  margin: "6px 0 0",
  fontFamily: "var(--font-body)",
  fontSize: 14,
  lineHeight: 1.55,
  color: "var(--color-text-muted)",
  maxWidth: "52ch",
};

/** Tiêu đề trang CRM — theo mockup «Di sản sống», không gắn mã FR/slug kỹ thuật. */
export function AdminPageHeader({ title, description, actions }: Props) {
  return (
    <div style={wrap}>
      <div style={{ minWidth: 0, flex: "1 1 220px" }}>
        <h1 style={titleStyle}>{title}</h1>
        {description ? <p style={descStyle}>{description}</p> : null}
      </div>
      {actions ? (
        <div style={{ display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap", alignItems: "center" }}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
