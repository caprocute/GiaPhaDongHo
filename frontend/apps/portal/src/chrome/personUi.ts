/** Chữ cái hiển thị avatar / bài vị từ họ tên Việt */
export function personInitial(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const last = parts[parts.length - 1] ?? "?";
  return last.slice(0, 1).toLocaleUpperCase("vi-VN");
}

export function formatViDate(iso?: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("vi-VN");
}
