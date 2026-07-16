/** Icon SVG gọn — stroke theo currentColor, dùng trong toolbar phả đồ */
type IconProps = { className?: string; title?: string };

const svgProps = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
};

export function IconLayers({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M12 3 3 8l9 5 9-5-9-5Z" />
      <path d="m3 14 9 5 9-5" />
      <path d="m3 10 9 5 9-5" />
    </svg>
  );
}

export function IconUserTree({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="6" r="2.5" />
      <path d="M12 8.5v4M8 20v-4a4 4 0 0 1 8 0v4" />
      <path d="M7 14h10" />
    </svg>
  );
}

export function IconHome({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6.5 10.5V20h11V10.5" />
    </svg>
  );
}

export function IconFrame({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="1" />
      <path d="M8 8h8v8H8z" opacity="0.45" />
    </svg>
  );
}

export function IconFrameOff({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="4" y="4" width="16" height="16" rx="1" strokeDasharray="3 3" />
      <path d="M7 17 17 7" />
    </svg>
  );
}

export function IconSvg({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M8 8 4 12l4 4" />
      <path d="m16 8 4 4-4 4" />
      <path d="m13.5 6-3 12" />
    </svg>
  );
}

export function IconImage({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <rect x="4" y="5" width="16" height="14" rx="1.5" />
      <circle cx="9" cy="10" r="1.5" fill="currentColor" stroke="none" />
      <path d="m7 16 3.5-3.5L14 15l2-2 3 3" />
    </svg>
  );
}

export function IconPdf({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <path d="M8 3h6l4 4v14H8V3Z" />
      <path d="M14 3v4h4" />
      <path d="M10 13h6M10 17h4" />
    </svg>
  );
}

export function IconProfile({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="12" cy="9" r="3.2" />
      <path d="M6 19c1.4-3 3.5-4.5 6-4.5s4.6 1.5 6 4.5" />
    </svg>
  );
}

export function IconBranch({ className }: IconProps) {
  return (
    <svg {...svgProps} className={className}>
      <circle cx="7" cy="6" r="2" />
      <circle cx="17" cy="12" r="2" />
      <circle cx="10" cy="19" r="2" />
      <path d="M7 8v5a4 4 0 0 0 4 4M9 12h6" />
    </svg>
  );
}
