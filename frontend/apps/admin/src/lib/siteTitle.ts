const STORAGE_KEY = "giapha.admin.siteTitle";
const DEFAULT = "Họ Hoàng Trung Bính";

export function adminSiteTitle(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || DEFAULT;
  } catch {
    return DEFAULT;
  }
}
