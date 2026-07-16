"use client";

import dynamic from "next/dynamic";

/** Client boundary — `ssr: false` không dùng được trong Server Component page. */
export const TreeClientLoader = dynamic(
  () => import("./TreeClient").then((m) => m.TreeClient),
  {
    ssr: false,
    loading: () => (
      <p style={{ color: "var(--color-text-muted)", fontFamily: "var(--font-body)" }}>
        Đang tải phả đồ…
      </p>
    ),
  },
);
