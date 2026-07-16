import { MediaLightbox } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import styles from "../../src/chrome/portal.module.css";
import { DEMO_ALBUM } from "../../src/lib/demoContent";

export default function AlbumPage() {
  return (
    <PageShell
      label="Di sản"
      title="Album ảnh"
      lead="Thư viện ảnh dòng họ. Upload MinIO đã có (R1.4); danh sách công khai sẽ nối API sau."
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Album" },
      ]}
    >
      <p className={styles.note}>Demo — ảnh minh họa Unsplash</p>
      <div className={styles.albumGrid}>
        {DEMO_ALBUM.map((item) => (
          <div key={item.src} className={styles.albumCard}>
            <MediaLightbox src={item.src} alt={item.alt} caption={item.caption} />
          </div>
        ))}
      </div>
    </PageShell>
  );
}
