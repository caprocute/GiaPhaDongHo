import { MediaLightbox } from "@giapha/ui";
import { PageShell } from "../../src/chrome/PageShell";
import styles from "../../src/chrome/portal.module.css";
import { fetchGalleryPhotos } from "../../src/lib/api";
import { DEMO_ALBUM } from "../../src/lib/demoContent";

export const revalidate = 30;

export default async function AlbumPage() {
  const photos = await fetchGalleryPhotos(120);
  const items =
    photos.length > 0
      ? photos.map((p) => ({
          src: p.url || p.thumbUrl || "",
          alt: p.caption || "Ảnh dòng họ",
          caption: p.caption || undefined,
        }))
      : DEMO_ALBUM;

  return (
    <PageShell
      label="Di sản"
      title="Album ảnh"
      lead="Hình ảnh sinh hoạt, lễ hội và di tích — đồng bộ từ thư viện quản trị."
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Album" },
      ]}
    >
      {photos.length === 0 ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>
          Đang hiển thị ảnh mẫu — chạy seed media hoặc tải ảnh lên thư viện quản trị.
        </p>
      ) : null}
      <div className={styles.albumGrid}>
        {items
          .filter((item) => item.src)
          .map((item) => (
            <div key={item.src + (item.caption ?? "")} className={styles.albumCard}>
              <MediaLightbox src={item.src} alt={item.alt} caption={item.caption} />
            </div>
          ))}
      </div>
    </PageShell>
  );
}
