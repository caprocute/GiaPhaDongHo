"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./HomeSearch.module.css";

export function HomeSearch() {
  const router = useRouter();
  const [q, setQ] = useState("");

  return (
    <form
      className={styles.search}
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        const term = q.trim();
        router.push(term ? `/search?q=${encodeURIComponent(term)}` : "/search");
      }}
    >
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Tìm tổ tiên theo tên hoặc mã hiệu… (vd: Hoàng Văn Thành, A7)"
        aria-label="Tìm trong gia phả"
      />
      <button type="submit">Tìm kiếm</button>
    </form>
  );
}
