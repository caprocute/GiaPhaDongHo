"use client";

import dynamic from "next/dynamic";

/** Client boundary — `ssr: false` không dùng được trong Server Component page. */
export const TreeClientLoader = dynamic(
  () => import("./TreeClient").then((m) => m.TreeClient),
  {
    ssr: false,
    loading: () => (
      <div
        style={{
          padding: "48px 24px",
          textAlign: "center",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          background: "var(--color-surface-page)",
        }}
      >
        Đang tải phả đồ…
      </div>
    ),
  },
);
