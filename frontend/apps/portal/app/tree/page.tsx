import { TreeClientLoader } from "./TreeClientLoader";

export default function TreePage() {
  return (
    <main
      style={{
        padding: "var(--spacing-lg)",
        maxWidth: 1280,
        margin: "0 auto",
      }}
    >
      <p
        style={{
          margin: "0 0 var(--spacing-xs)",
          fontSize: "var(--font-size-sm)",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "var(--color-heritage-deep)",
          fontWeight: 600,
        }}
      >
        Gia phả
      </p>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          color: "var(--color-text-primary)",
          margin: "0 0 var(--spacing-sm)",
          fontSize: "clamp(1.75rem, 3vw, 2.25rem)",
        }}
      >
        Phả đồ
      </h1>
      <p
        style={{
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          margin: "0 0 var(--spacing-lg)",
        }}
      >
        Chọn gốc và độ sâu — pan/zoom, minimap, xuất PNG/SVG (Họ Hoàng thôn Trung Bính).
      </p>
      <TreeClientLoader />
    </main>
  );
}
