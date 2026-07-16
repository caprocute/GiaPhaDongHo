import { Badge, MediaLightbox } from "@giapha/ui";
import { DEMO_ALBUM } from "../../src/lib/demoContent";

export default function AlbumPage() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: "var(--spacing-md)" }}>
        <h1 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Album</h1>
        <Badge>Demo — chờ API public album</Badge>
      </div>
      <p style={{ margin: 0, color: "var(--color-text-muted)", maxWidth: 60 * 8 }}>
        Thư viện ảnh dòng họ. Upload MinIO đã có (R1.4); danh sách công khai sẽ nối sau.
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--spacing-md)" }}>
        {DEMO_ALBUM.map((item) => (
          <MediaLightbox key={item.src} src={item.src} alt={item.alt} caption={item.caption} />
        ))}
      </div>
    </div>
  );
}
