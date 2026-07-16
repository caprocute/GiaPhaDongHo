import styles from "./home.module.css";

/** Phả đồ cách điệu — mockup Di sản sống */
export function HeroConstellation() {
  return (
    <figure className={styles.constellation} aria-label="Sơ đồ phả hệ cách điệu">
      <svg viewBox="0 0 480 400" fill="none">
        <g stroke="var(--color-heritage-accent)" strokeWidth="1.2" opacity=".9">
          <path d="M240 52 V110" />
          <path d="M240 110 C240 150 130 140 130 185" />
          <path d="M240 110 C240 150 350 140 350 185" />
          <path d="M130 185 C130 225 70 220 70 262" />
          <path d="M130 185 C130 225 185 220 185 262" />
          <path d="M350 185 C350 225 300 220 300 262" />
          <path d="M350 185 C350 225 415 220 415 262" />
          <path d="M185 262 C185 300 150 298 150 336" />
          <path d="M185 262 C185 300 230 298 230 336" />
          <path d="M300 262 C300 300 335 298 335 336" />
        </g>
        <g fontFamily="var(--font-display)">
          <circle
            cx="240"
            cy="46"
            r="16"
            fill="var(--color-heritage-frame)"
            stroke="var(--color-heritage-accent)"
            strokeWidth="1.5"
          />
          <text x="240" y="51.5" textAnchor="middle" fill="var(--color-heritage-soft)" fontSize="13">
            祖
          </text>
          <circle
            cx="130"
            cy="185"
            r="11"
            fill="var(--color-action-primary-bg)"
            stroke="var(--color-heritage-accent)"
            strokeWidth="1"
          />
          <circle
            cx="350"
            cy="185"
            r="11"
            fill="var(--color-action-primary-bg)"
            stroke="var(--color-heritage-accent)"
            strokeWidth="1"
          />
          <circle cx="70" cy="264" r="9" fill="var(--color-heritage-accent)" />
          <circle cx="185" cy="264" r="9" fill="var(--color-action-primary-bg)" opacity=".9" />
          <circle cx="300" cy="264" r="9" fill="var(--color-heritage-accent)" />
          <circle cx="415" cy="264" r="9" fill="var(--color-action-primary-bg)" opacity=".9" />
          <circle cx="150" cy="340" r="7" fill="var(--color-heritage-accent)" opacity=".85" />
          <circle cx="230" cy="340" r="7" fill="var(--color-action-primary-bg)" opacity=".8" />
          <circle cx="335" cy="340" r="7" fill="var(--color-heritage-accent)" opacity=".85" />
        </g>
        <text
          x="240"
          y="386"
          textAnchor="middle"
          fill="var(--color-heritage-deep)"
          fontSize="10.5"
          letterSpacing="4"
          fontFamily="var(--font-body)"
        >
          THỦY TỔ · ĐỜI THỨ NHẤT · 1558
        </text>
      </svg>
      <figcaption className={styles.constCap}>Phả đồ tương tác — chạm để mở từng nhánh</figcaption>
    </figure>
  );
}
