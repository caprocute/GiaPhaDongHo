import Link from "next/link";
import { notFound } from "next/navigation";
import { PageShell } from "../../../src/chrome/PageShell";
import { personInitial } from "../../../src/chrome/personUi";
import styles from "../../../src/chrome/portal.module.css";
import { fetchPerson } from "../../../src/lib/api";
import { DEMO_PERSONS } from "../../../src/lib/demoContent";

type Props = { params: Promise<{ code: string }> };

export default async function PersonDetailPage({ params }: Props) {
  const { code } = await params;
  const decoded = decodeURIComponent(code);
  const api = await fetchPerson(decoded);
  const person = api ?? DEMO_PERSONS.find((p) => p.code.toLowerCase() === decoded.toLowerCase());
  if (!person) notFound();

  const isDeceased = person.lifeStatus === "deceased";
  const yearsLine = isDeceased
    ? [
        person.birthSolar ? person.birthSolar.slice(0, 4) : null,
        person.deathSolar ? `GIỖ ${person.deathSolar}` : "ĐÃ MẤT",
      ]
        .filter(Boolean)
        .join(" — ")
    : person.birthSolar
      ? `Sinh ${person.birthSolar}`
      : "Còn sống · ngày sinh ẩn với khách";

  return (
    <PageShell
      title={person.fullName}
      hideHeader
      crumbs={[
        { label: "Trang chủ", href: "/" },
        { label: "Gia phả", href: "/persons" },
        { label: person.fullName },
      ]}
      toolbarRight={
        <>
          <Link href="/tree" className={styles.tool}>
            Phả đồ
          </Link>
          <Link href={`/search?q=${encodeURIComponent(person.code)}`} className={styles.toolPrimary}>
            Tra cứu
          </Link>
        </>
      }
    >
      <div className={styles.profileGrid}>
        <aside className={styles.baivi}>
          <div className={styles.portrait}>
            <span className={styles.glyph}>{personInitial(person.fullName)}</span>
          </div>
          <h1 className={styles.baiviNm}>{person.fullName}</h1>
          <div className={styles.baiviHuy}>
            Mã hiệu {person.code}
            {person.gender === "F" ? " · Nữ" : person.gender === "M" ? " · Nam" : ""}
          </div>
          <div className={styles.baiviYears}>{yearsLine}</div>
          <div className={styles.chips}>
            {person.generation != null ? (
              <span className={styles.chip}>Đời thứ {person.generation}</span>
            ) : null}
            <span className={styles.chipGold}>Mã {person.code}</span>
            {!api ? <span className={styles.chipGold}>Demo</span> : null}
          </div>
          <div className={styles.baiviBtns}>
            <Link href="/tree" className={styles.toolPrimary}>
              Vẽ cây hậu duệ
            </Link>
            <Link href="/gio" className={styles.tool}>
              Ngày giỗ
            </Link>
          </div>
        </aside>

        <div className={styles.pfBody}>
          <span className={styles.eyebrow}>
            Hồ sơ {isDeceased ? "tiên tổ" : "thành viên"} · Họ Hoàng
          </span>
          <h2>
            {person.biography
              ? person.biography.split(/[.!?]/)[0] || person.fullName
              : person.fullName}
          </h2>
          <p className={styles.pfSub}>
            {person.lineagePath
              ? `Đường dòng: ${person.lineagePath}`
              : "Hồ sơ trong gia phả họ Hoàng thôn Trung Bính"}
            {!api ? " · dữ liệu demo" : ""}
          </p>

          <div className={styles.pfCards}>
            <div className={styles.pfCard}>
              <div className={styles.pfKey}>Sinh</div>
              <div className={styles.pfVal}>
                {person.birthSolar
                  ? person.birthSolar
                  : person.lifeStatus === "alive"
                    ? "Ẩn với khách (privacy — NĐ13)"
                    : "Chưa ghi"}
              </div>
            </div>
            <div className={styles.pfCard}>
              <div className={styles.pfKey}>Tạ thế</div>
              <div className={styles.pfVal}>
                {isDeceased
                  ? person.deathSolar
                    ? `${person.deathSolar} — giỗ hằng năm`
                    : "Đã mất · chưa ghi ngày"
                  : "Còn sống"}
              </div>
            </div>
            <div className={styles.pfCard}>
              <div className={styles.pfKey}>Mã hiệu</div>
              <div className={styles.pfVal}>{person.code}</div>
            </div>
            <div className={styles.pfCard}>
              <div className={styles.pfKey}>Đời</div>
              <div className={styles.pfVal}>
                {person.generation != null ? `Đời thứ ${person.generation}` : "Chưa ghi"}
              </div>
            </div>
          </div>

          <div className={styles.story}>
            <h3>Sự nghiệp · Công đức</h3>
            {person.biography ? (
              <p>{person.biography}</p>
            ) : (
              <p>Chưa có tiểu sử chi tiết. Ban biên tập sẽ bổ sung khi có tư liệu phả ký.</p>
            )}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
