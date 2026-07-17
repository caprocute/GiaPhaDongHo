const STORAGE_KEY = "giapha.admin.siteTitle";
const DEFAULT = "Họ Hoàng Trung Bính";

export function adminSiteTitle(): string {
  try {
    return localStorage.getItem(STORAGE_KEY)?.trim() || DEFAULT;
  } catch {
    return DEFAULT;
  }
}

export function persistAdminSiteTitle(title: string): void {
  try {
    localStorage.setItem(STORAGE_KEY, title.trim() || DEFAULT);
    window.dispatchEvent(new Event("giapha-site-title"));
  } catch {
    /* ignore */
  }
}
