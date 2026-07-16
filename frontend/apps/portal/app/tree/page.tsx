import { PublicFooter, PublicHeader } from "@giapha/ui";
import { TreeClientLoader } from "./TreeClientLoader";

export default function TreePage() {
  return (
    <>
      <PublicHeader />
      <main style={{ padding: "var(--spacing-lg)", maxWidth: 1200, margin: "0 auto" }}>
        <h1 style={{ fontFamily: "var(--font-display)", color: "var(--color-text-primary)" }}>
          Phả đồ
        </h1>
        <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
          Chọn gốc và độ sâu — pan/zoom, minimap, xuất PNG/SVG (mẫu họ Hoàng).
        </p>
        <TreeClientLoader />
      </main>
      <PublicFooter />
    </>
  );
}
