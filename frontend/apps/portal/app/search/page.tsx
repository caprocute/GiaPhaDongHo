import { Suspense } from "react";
import { SearchClient } from "./SearchClient";

export default function SearchPage() {
  return (
    <Suspense fallback={<p>Đang tải tìm kiếm…</p>}>
      <SearchClient />
    </Suspense>
  );
}
