import { API_BASE, TREE_SLUG } from "./config";

export type TreeSettings = {
  slug?: string;
  displayName?: string;
  shortName?: string | null;
  provinceCode?: string | null;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  description?: string | null;
  seoKeywords?: string[];
  bankName?: string | null;
  bankBranch?: string | null;
  bankAccountNo?: string | null;
  bankAccountName?: string | null;
  socialFacebook?: string | null;
  socialZalo?: string | null;
  brandPalette?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  tree?: {
    maxNodesDefault?: number;
    publicTree?: boolean;
    maskLivingBirthDate?: boolean;
    allowSelfDeclare?: boolean;
    allowTreeExport?: boolean;
    codePrefix?: string;
  };
  notify?: {
    remindDaysBefore?: number;
    channelEmail?: boolean;
    channelZalo?: boolean;
  };
  calendar?: {
    timezone?: string;
    showLeapMonthLabel?: boolean;
  };
  auth?: {
    publicRegistration?: boolean;
    autoActivate?: boolean;
    captchaEnabled?: boolean;
    requireTerms?: boolean;
  };
  privacy?: {
    defaultLivingPrivacy?: string;
  };
  zalo?: {
    configured?: boolean;
    mode?: string;
  };
};

const FALLBACK: TreeSettings = {
  displayName: "Họ Hoàng Trung Bính",
  description: "Trang thông tin họ Hoàng thôn Trung Bính — gia phả, ngày giỗ, di sản dòng tộc",
  tree: {
    maxNodesDefault: 43,
    publicTree: true,
    maskLivingBirthDate: true,
    allowSelfDeclare: true,
    allowTreeExport: false,
    codePrefix: "A",
  },
  notify: { remindDaysBefore: 7, channelEmail: true, channelZalo: false },
  calendar: { timezone: "Asia/Ho_Chi_Minh", showLeapMonthLabel: true },
  auth: {
    publicRegistration: true,
    autoActivate: true,
    captchaEnabled: false,
    requireTerms: true,
  },
  privacy: { defaultLivingPrivacy: "members" },
  zalo: { mode: "off" },
};

export function footerContactLines(s: TreeSettings): string {
  const lines: string[] = [];
  if (s.contactName) lines.push(`Người chịu trách nhiệm: ${s.contactName}`);
  if (s.address) lines.push(s.address);
  if (s.contactPhone) lines.push(s.contactPhone);
  if (s.contactEmail) lines.push(s.contactEmail);
  const bankBits = [s.bankName, s.bankBranch, s.bankAccountNo, s.bankAccountName].filter(Boolean);
  if (bankBits.length) lines.push(`Quỹ công đức: ${bankBits.join(" · ")}`);
  return lines.join("\n") || "Liên hệ ban quản trị dòng họ";
}

/** Kênh Zalo chỉ hiện khi settings bật kênh và chế độ không phải Tắt. */
export function isZaloChannelSuggested(s: TreeSettings): boolean {
  if (s.notify?.channelZalo !== true) return false;
  const mode = (s.zalo?.mode ?? "off").toLowerCase();
  return mode !== "off";
}

export async function fetchTreeSettings(): Promise<TreeSettings> {
  if (!API_BASE) return FALLBACK;
  try {
    const res = await fetch(`${API_BASE}/api/v1/trees/${encodeURIComponent(TREE_SLUG)}/settings`, {
      headers: { Accept: "application/json" },
      next: { revalidate: 60 },
    } as RequestInit);
    if (!res.ok) return FALLBACK;
    const data = (await res.json()) as TreeSettings;
    return {
      ...FALLBACK,
      ...data,
      tree: { ...FALLBACK.tree, ...data.tree },
      notify: { ...FALLBACK.notify, ...data.notify },
      calendar: { ...FALLBACK.calendar, ...data.calendar },
      auth: { ...FALLBACK.auth, ...data.auth },
      privacy: { ...FALLBACK.privacy, ...data.privacy },
      zalo: { ...FALLBACK.zalo, ...data.zalo },
    };
  } catch {
    return FALLBACK;
  }
}
