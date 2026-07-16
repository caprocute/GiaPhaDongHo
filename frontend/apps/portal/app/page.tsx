import Link from "next/link";
import { Button, GioCard } from "@giapha/ui";
import { HomeSearch } from "./HomeSearch";
import { DEMO_ALBUM, DEMO_POSTS, demoAnniversaries } from "../src/lib/demoContent";
import { fetchAnniversaries, fetchPosts } from "../src/lib/api";
import { convertSolarToLunar } from "@giapha/lunar";

export default async function HomePage() {
  const now = new Date();
  const lunar = convertSolarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
  const apiPosts = await fetchPosts(3);
  const posts = apiPosts.length ? apiPosts.slice(0, 3) : DEMO_POSTS.slice(0, 3);
  const apiGio = await fetchAnniversaries(lunar.month);
  const gio = apiGio.length ? apiGio.slice(0, 4) : demoAnniversaries(lunar.month).slice(0, 4);

  return (
    <div style={{ margin: "calc(-1 * var(--spacing-lg))", marginBottom: 0 }}>
      {/* Hero full-bleed — brand first */}
      <section
        style={{
          position: "relative",
          minHeight: "min(78vh, 720px)",
          display: "flex",
          alignItems: "flex-end",
          padding: "var(--spacing-xl) var(--spacing-lg)",
          background: `
            linear-gradient(105deg, color-mix(in srgb, var(--color-heritage-frame) 88%, transparent) 0%,
              color-mix(in srgb, var(--color-action-primary-bg) 55%, transparent) 45%,
              transparent 75%),
            url(${DEMO_ALBUM[0].src}) center/cover no-repeat
          `,
          color: "var(--color-text-on-brand)",
          borderBottom: "3px solid var(--color-heritage-line)",
        }}
      >
        <div style={{ maxWidth: 640, display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <p
            style={{
              margin: 0,
              fontFamily: "var(--font-body)",
              fontSize: "var(--font-size-sm)",
              letterSpacing: "0.28em",
              textTransform: "uppercase",
              color: "var(--color-heritage-accent)",
              fontWeight: 700,
            }}
          >
            Gia phả số
          </p>
          <h1
            style={{
              margin: 0,
              fontFamily: "var(--font-display)",
              fontSize: "clamp(2.4rem, 5vw, 3.75rem)",
              lineHeight: 1.1,
              fontWeight: 700,
            }}
          >
            GiaPhaHub
          </h1>
          <p style={{ margin: 0, fontSize: "var(--font-size-lg)", maxWidth: "40ch", lineHeight: 1.7, opacity: 0.95 }}>
            Di sản sống — kết nối thế hệ, giữ gìn phả đồ và ngày giỗ dòng họ Việt.
          </p>
          <HomeSearch />
          <div style={{ display: "flex", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
            <Link href="/tree">
              <Button type="button">Xem phả đồ</Button>
            </Link>
            <Link href="/gio">
              <Button type="button" variant="secondary">
                Ngày giỗ tháng {lunar.month} âm
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          padding: "var(--spacing-xl) var(--spacing-lg)",
          display: "flex",
          flexDirection: "column",
          gap: "var(--spacing-xl)",
        }}
      >
        <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Giỗ tháng này</h2>
          <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
            Tháng {lunar.month} năm {lunar.year} âm lịch
            {lunar.leap ? " (nhuận)" : ""}
          </p>
          <div style={{ display: "flex", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
            {gio.map((g) => (
              <GioCard
                key={g.id}
                day={String(g.lunarDay).padStart(2, "0")}
                month={`Tháng ${g.lunarMonth} âm`}
                name={g.person?.fullName ?? "—"}
                tag={g.person?.code}
              />
            ))}
          </div>
          <Link href="/gio" style={{ color: "var(--color-action-primary-bg)", fontWeight: 600 }}>
            Xem tất cả ngày giỗ →
          </Link>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
          <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Tin mới</h2>
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            {posts.map((p) => (
              <li key={p.slug} style={{ borderBottom: "1px solid var(--color-border-subtle)", paddingBottom: "var(--spacing-sm)" }}>
                <Link
                  href={`/news/${p.slug}`}
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "var(--font-size-lg)",
                    color: "var(--color-text-primary)",
                    textDecoration: "none",
                  }}
                >
                  {p.title}
                </Link>
                <p style={{ margin: "var(--spacing-xs) 0 0", color: "var(--color-text-muted)" }}>{p.summary}</p>
              </li>
            ))}
          </ul>
          <Link href="/news" style={{ color: "var(--color-action-primary-bg)", fontWeight: 600 }}>
            Tất cả tin tức →
          </Link>
        </section>
      </div>
    </div>
  );
}
