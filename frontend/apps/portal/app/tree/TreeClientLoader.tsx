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
          flex: 1,
          display: "grid",
          placeItems: "center",
          color: "var(--color-text-muted)",
          fontFamily: "var(--font-body)",
          background: "var(--color-surface-page)",
          minHeight: "50vh",
        }}
      >
        Đang tải phả đồ…
      </div>
    ),
  },
);
