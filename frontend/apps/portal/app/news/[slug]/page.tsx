import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../../src/chrome/PageShell";
import { formatViDate } from "../../../src/chrome/personUi";
import styles from "../../../src/chrome/portal.module.css";
import { fetchPost } from "../../../src/lib/api";
import { DEMO_POSTS } from "../../../src/lib/demoContent";

type Props = { params: Promise<{ slug: string }> };

export default async function NewsDetailPage({ params }: Props) {
  const { slug } = await params;
  const api = await fetchPost(slug);
  const post = api ?? DEMO_POSTS.find((p) => p.slug === slug);
  if (!post) notFound();

  return (
    <PageShell
      label={post.category?.name ?? "Tin tức"}
      title={post.title}
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Tin tức", href: "/news" },
        ...(post.category?.slug
          ? [
              {
                label: post.category.name ?? post.category.slug,
                href: `/tin/${encodeURIComponent(post.category.slug)}`,
              },
            ]
          : []),
        { label: post.title.length > 40 ? `${post.title.slice(0, 40)}…` : post.title },
      ]}
    >
      <article className={styles.article}>
        <p className={styles.articleMeta}>
          {post.authorName ?? "Ban biên tập"}
          {post.publishedAt ? ` · ${formatViDate(post.publishedAt)}` : ""}
          {!api ? " · Demo" : ""}
          {post.viewCount != null ? ` · ${post.viewCount} lượt xem` : ""}
        </p>
        <div
          className={styles.prose}
          dangerouslySetInnerHTML={{ __html: post.bodyHtml ?? "" }}
        />
        <p style={{ marginTop: 32 }}>
          <Link href="/news" className={styles.back}>
            ← Về danh sách tin
          </Link>
        </p>
      </article>
    </PageShell>
  );
}
