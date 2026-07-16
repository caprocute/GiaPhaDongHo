"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input } from "@giapha/ui";

export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
      }}
      style={{
        display: "flex",
        maxWidth: 520,
        border: "1px solid var(--color-heritage-line)",
        background: "var(--color-surface-card)",
        boxShadow: "var(--shadow-md)",
      }}
    >
      <Input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm theo tên hoặc mã hiệu…"
        aria-label="Tìm tổ tiên"
        style={{ flex: 1, border: "none", background: "transparent" }}
      />
      <Button type="submit" style={{ borderRadius: 0 }}>
        Tìm
      </Button>
    </form>
  );
}
