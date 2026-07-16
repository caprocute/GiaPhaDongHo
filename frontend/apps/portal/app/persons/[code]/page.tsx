import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge, PersonNameDisplay } from "@giapha/ui";
import { fetchPerson } from "../../../src/lib/api";
import { DEMO_PERSONS } from "../../../src/lib/demoContent";

type Props = { params: Promise<{ code: string }> };

export default async function PersonDetailPage({ params }: Props) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  const api = await fetchPerson(decoded);
  const person = api ?? DEMO_PERSONS.find((p) => p.code.toLowerCase() === decoded.toLowerCase());
  if (!person) notFound();

  return (
    <article style={{ maxWidth: 720, display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
      <Link href="/persons" style={{ color: "var(--color-text-muted)" }}>
        ← Gia phả
      </Link>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)", flexWrap: "wrap" }}>
        <PersonNameDisplay fullName={person.fullName} generation={person.generation} />
        <Badge tone={person.lifeStatus === "deceased" ? "default" : "success"}>
          {person.lifeStatus === "deceased" ? "Đã mất" : "Còn sống"}
        </Badge>
        {!api ? <Badge>Demo</Badge> : null}
      </div>
      <p style={{ margin: 0 }}>
        Mã hiệu: <code>{person.code}</code>
      </p>
      {person.birthSolar ? (
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Ngày sinh (dương): {person.birthSolar}</p>
      ) : person.lifeStatus === "alive" ? (
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>
          Ngày sinh: ẩn với khách (privacy — NĐ13)
        </p>
      ) : null}
      {person.deathSolar ? (
        <p style={{ margin: 0, color: "var(--color-text-muted)" }}>Ngày mất (dương): {person.deathSolar}</p>
      ) : null}
      {person.biography ? (
        <div style={{ lineHeight: 1.7 }}>{person.biography}</div>
      ) : (
        <p style={{ color: "var(--color-text-muted)" }}>Chưa có tiểu sử.</p>
      )}
      <Link href="/tree" style={{ color: "var(--color-action-primary-bg)", fontWeight: 600 }}>
        Xem trên phả đồ →
      </Link>
    </article>
  );
}
