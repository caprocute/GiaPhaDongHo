export function fmtCurrency(val: number | string | null | undefined): string {
  const n = typeof val === "string" ? parseFloat(val) : (val ?? 0);
  if (isNaN(n)) return "—";
  if (Math.abs(n) >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)} tỷ`;
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)} tr`;
  return new Intl.NumberFormat("vi-VN").format(n) + " đ";
}

export function fmtDateShort(iso: string | null | undefined): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return "—";
  return d.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" });
}
