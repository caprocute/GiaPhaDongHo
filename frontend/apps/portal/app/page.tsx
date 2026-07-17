import Link from "next/link";
import { GioCard, HonorBoardCard, StatCard } from "@giapha/ui";
import { convertSolarToLunar } from "@giapha/lunar";
import { HomeSearch } from "./HomeSearch";
import { HeroConstellation } from "./HeroConstellation";
import styles from "./home.module.css";
import {
  DEMO_CONG_DUC,
  DEMO_POSTS,
  DEMO_STATS,
  demoAnniversaries,
} from "../src/lib/demoContent";
import { fetchAnniversaries, fetchPosts } from "../src/lib/api";

function formatPostDate(iso?: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString("vi-VN");
}

export default async function HomePage() {
  const now = new Date();
  const lunar = convertSolarToLunar(now.getDate(), now.getMonth() + 1, now.getFullYear());
  const apiPosts = await fetchPosts(5);
  const posts = apiPosts.length >= 2 ? apiPosts.slice(0, 5) : DEMO_POSTS;
  const featured = posts[0];
  const rest = posts.slice(1, 5);
  const apiGio = await fetchAnniversaries(lunar.month);
  const gio = apiGio.length ? apiGio.slice(0, 6) : demoAnniversaries(lunar.month).slice(0, 6);

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <div className={styles.heroGrid}>
            <div>
              <span className={styles.eyebrow}>Phả hệ dòng họ · Mười ba đời</span>
              <h2 className={styles.heroTitle}>
                Cây có cội,
                <br />
                nước có <span className={styles.foil}>nguồn</span>
              </h2>
              <p className={styles.lead}>
                Nơi lưu giữ cội nguồn và kết nối con cháu họ Hoàng – Huỳnh muôn phương: gia phả mười
                ba đời, ngày giỗ tổ tiên, tư liệu di sản và những gương sáng của dòng tộc.
              </p>
              <HomeSearch />
              <p className={styles.heroLinks}>
                Hoặc <Link href="/tree">mở sơ đồ phả hệ toàn họ →</Link>
              </p>
            </div>
            <HeroConstellation />
          </div>

          <div className={styles.stats}>
            {DEMO_STATS.map((s) => (
              <StatCard key={s.label} value={s.value} label={s.label} />
            ))}
          </div>
        </div>
      </section>

      <section className={styles.gio} aria-labelledby="gio-heading">
        <div className={`${styles.wrap} ${styles.gioInner}`}>
          <div className={styles.gioHead}>
            <span className={styles.label}>Hương hỏa</span>
            <h3 id="gio-heading">Ngày giỗ sắp tới</h3>
            <Link href="/gio">Xem cả năm →</Link>
          </div>
          {gio.map((g) => (
            <GioCard
              key={g.id}
              day={String(g.lunarDay).padStart(2, "0")}
              month={`Tháng ${g.lunarMonth} ÂL`}
              name={g.person?.fullName ?? "—"}
              tag={g.note ?? (g.lunarMonth === lunar.month ? "Tháng này" : "Tháng sau")}
            />
          ))}
        </div>
      </section>

      <section className={styles.sec}>
        <div className={styles.wrap}>
          <div className={styles.secHead}>
            <div>
              <span className={styles.label}>Tộc sự</span>
              <h3>Tin tức & hoạt động dòng họ</h3>
            </div>
            <span className={styles.rule} />
            <Link href="/news">Tất cả bài viết →</Link>
          </div>
          <div className={styles.news}>
            {featured && (
              <Link href={`/news/${featured.slug}`} className={styles.feat}>
                <div className={styles.featPh} />
                <div className={styles.featOvl} />
                <div className={styles.featBody}>
                  <span className={styles.featCat}>{featured.category?.name ?? "Tin tức"}</span>
                  <h4>{featured.title}</h4>
                  <div className={styles.featMeta}>
                    {featured.authorName ?? "Ban biên tập"} · {formatPostDate(featured.publishedAt)}
                    {featured.viewCount != null ? ` · ${featured.viewCount} lượt xem` : ""}
                  </div>
                </div>
              </Link>
            )}
            <div className={styles.newsList}>
              {rest.map((p, i) => (
                <Link key={p.slug} href={`/news/${p.slug}`} className={styles.newsItem}>
                  <div
                    className={styles.thumb}
                    style={{
                      background:
                        i % 2 === 0
                          ? "linear-gradient(140deg, var(--color-heritage-accent), var(--color-heritage-deep))"
                          : "linear-gradient(140deg, var(--color-action-primary-bg), var(--color-heritage-frame))",
                    }}
                  />
                  <div>
                    <h5>{p.title}</h5>
                    <div className={styles.newsMeta}>
                      {formatPostDate(p.publishedAt)}
                      {p.viewCount != null ? ` · ${p.viewCount} lượt xem` : ""}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className={styles.congduc} aria-labelledby="congduc-heading">
        <div className={styles.wrap}>
          <div className={styles.sacphong}>
            <span className={styles.kicker}>Uống nước nhớ nguồn</span>
            <h3 id="congduc-heading">
              <span className={styles.foil}>Bảng vàng công đức</span>
            </h3>
            <p className={styles.sacSub}>Khắc ghi tấm lòng của con cháu hướng về tông tộc</p>
            <div className={styles.cdGrid}>
              {DEMO_CONG_DUC.map((item) => (
                <HonorBoardCard
                  key={item.name}
                  onDark
                  name={item.name}
                  detail={item.desc}
                  emblem={item.medal}
                />
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
