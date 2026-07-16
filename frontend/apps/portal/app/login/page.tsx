import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import styles from "./login.module.css";

function Seal() {
  return (
    <svg className={styles.seal} viewBox="0 0 72 72" aria-hidden="true">
      <circle cx="36" cy="36" r="34" fill="none" stroke="var(--color-heritage-accent)" strokeWidth="2" />
      <circle
        cx="36"
        cy="36"
        r="30.5"
        fill="none"
        stroke="var(--color-heritage-accent)"
        strokeWidth=".8"
        opacity=".7"
      />
      <circle cx="36" cy="36" r="26" fill="var(--color-action-primary-bg-deep)" />
      <path
        d="M36 50 V30 M36 37 L26 27 M36 37 L46 27 M36 30 L30 22.5 M36 30 L42 22.5"
        stroke="var(--color-heritage-soft)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="26" cy="27" r="2.8" fill="var(--color-heritage-accent)" />
      <circle cx="46" cy="27" r="2.8" fill="var(--color-heritage-accent)" />
      <circle cx="30" cy="22.5" r="2" fill="var(--color-heritage-line)" />
      <circle cx="42" cy="22.5" r="2" fill="var(--color-heritage-line)" />
      <path d="M27 50 h18" stroke="var(--color-heritage-accent)" strokeWidth="2.6" strokeLinecap="round" />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <div className={styles.page}>
      <aside className={styles.brandPane}>
        <div className={styles.brandInner}>
          <Seal />
          <div className={styles.kicker}>GiaPhaHub · Di sản sống</div>
          <h2 className={styles.brandTitle}>
            Họ Hoàng – Huỳnh
            <br />
            <span className={styles.foil}>thôn Trung Bính</span>
          </h2>
          <p className={styles.brandLead}>
            Cây có cội, nước có nguồn — đăng nhập để kết nối phả hệ, hương hỏa và tư liệu dòng tộc.
          </p>
        </div>
      </aside>

      <div className={styles.formPane}>
        <div className={styles.card}>
          <Suspense fallback={<p className={styles.formSub}>Đang tải…</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
