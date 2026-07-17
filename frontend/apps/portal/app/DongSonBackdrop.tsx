type Props = { className?: string };

/** Nền hoa văn trống đồng / chim lạc cho section Bảng vàng (tham chiếu poster di sản). */
export function DongSonBackdrop({ className }: Props) {
  return (
    <div className={className} aria-hidden>
      <svg viewBox="0 0 1200 720" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="dsStroke" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--color-heritage-deep)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-heritage-accent)" stopOpacity={0.55} />
          </linearGradient>
        </defs>
        <g
          transform="translate(600 300)"
          opacity={0.22}
          fill="none"
          stroke="var(--color-heritage-deep)"
          strokeWidth={1.2}
        >
          <circle r={210} />
          <circle r={188} />
          <circle r={165} />
          <circle r={142} />
          <circle r={118} />
          <circle r={72} />
          <circle r={36} />
          <g stroke="var(--color-heritage-accent)" strokeWidth={1.4}>
            <line x1={0} y1={-28} x2={0} y2={28} />
            <line x1={-28} y1={0} x2={28} y2={0} />
            <line x1={-20} y1={-20} x2={20} y2={20} />
            <line x1={20} y1={-20} x2={-20} y2={20} />
          </g>
          <path
            d="M0-118 L8-128 L0-138 L-8-128 Z M83-83 L96-86 L99-72 L90-78 Z M118 0 L128-8 L138 0 L128 8 Z M83 83 L86 96 L72 99 L78 90 Z M0 118 L-8 128 L0 138 L8 128 Z M-83 83 L-96 86 L-99 72 L-90 78 Z M-118 0 L-128 8 L-138 0 L-128-8 Z M-83-83 L-86-96 L-72-99 L-78-90 Z"
            fill="var(--color-heritage-accent)"
            stroke="none"
            opacity={0.7}
          />
          <g fill="var(--color-heritage-deep)" stroke="none" opacity={0.85}>
            {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
              <g key={deg} transform={`rotate(${deg}) translate(0,-155) scale(0.9)`}>
                <path d="M0 0 C6-4 14-2 18 4 C12 2 8 6 4 10 C2 4-2 2 0 0 Z M-2 2 C-10-6-22-4-28 4 C-18 0-10 4-4 8 Z" />
              </g>
            ))}
          </g>
        </g>
        <g fill="none" stroke="url(#dsStroke)" strokeWidth={1.35} strokeLinecap="round">
          <path d="M40 520 C90 480 140 500 180 470 C220 500 280 460 340 490 C400 460 460 500 520 475" />
          <path d="M680 500 C740 460 800 490 860 455 C920 490 980 450 1140 480" />
          <path d="M60 580 L140 500 L220 560 L300 470 L400 550 L520 490 L620 560" />
          <path d="M700 570 L780 500 L860 555 L940 475 L1040 540 L1160 500" />
          <path d="M80 160 C120 140 150 155 190 130 C230 150 260 125 310 145" />
          <path d="M900 140 C940 120 980 145 1020 118 C1060 140 1100 115 1150 135" />
          <path d="M200 220 C240 200 270 230 320 205" />
          <path d="M850 210 C900 185 940 220 990 195" />
        </g>
        <g fill="var(--color-heritage-deep)" opacity={0.4}>
          <path
            transform="translate(160 240) scale(1.4)"
            d="M0 0 C8-5 18-3 24 5 C16 3 10 8 5 14 C3 6-3 3 0 0 Z M-3 3 C-14-8-30-5-38 6 C-24 1-14 6-5 11 Z"
          />
          <path
            transform="translate(980 250) scale(1.3) rotate(-20)"
            d="M0 0 C8-5 18-3 24 5 C16 3 10 8 5 14 C3 6-3 3 0 0 Z M-3 3 C-14-8-30-5-38 6 C-24 1-14 6-5 11 Z"
          />
          <path
            transform="translate(1050 180) scale(1.1) rotate(15)"
            d="M0 0 C8-5 18-3 24 5 C16 3 10 8 5 14 C3 6-3 3 0 0 Z M-3 3 C-14-8-30-5-38 6 C-24 1-14 6-5 11 Z"
          />
        </g>
      </svg>
    </div>
  );
}
