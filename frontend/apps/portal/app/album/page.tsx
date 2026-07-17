import { MediaLightbox } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import styles from "../../src/chrome/portal.module.css";
import { DEMO_ALBUM } from "../../src/lib/demoContent";

export default function AlbumPage() {
  return (
    <PageShell
      label="Di sản"
      title="Album ảnh"
      lead="Hình ảnh sinh hoạt, lễ hội và di tích của dòng họ Hoàng – Huỳnh thôn Trung Bính."
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Album" },
      ]}
    >
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
