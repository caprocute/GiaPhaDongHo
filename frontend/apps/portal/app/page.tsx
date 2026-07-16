import { Button } from "@giapha/ui";
import Link from "next/link";

export default function HomePage() {
  return (
    <section style={{ maxWidth: "960px", margin: "0 auto", textAlign: "center" }}>
      <h1
        style={{
          fontFamily: "var(--font-display)",
          fontSize: "var(--font-size-xl)",
          marginBottom: "var(--spacing-md)",
        }}
      >
        GiaPhaHub — Di sản sống
      </h1>
      <p style={{ color: "var(--color-text-muted)", marginBottom: "var(--spacing-lg)" }}>
        Kết nối thế hệ, lưu giữ phả đồ và ngày giỗ trong một nền tảng duy nhất.
      </p>
      <Link href="/search">
        <Button>Tìm tổ tiên của bạn</Button>
      </Link>
    </section>
  );
}
