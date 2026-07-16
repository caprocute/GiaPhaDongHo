import type { OidcAppConfig } from "@giapha/auth";

const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:5173";

export const adminOidcConfig: OidcAppConfig = {
  authority:
    import.meta.env.VITE_OIDC_AUTHORITY ?? "http://localhost:18086/realms/jhipster",
  clientId: import.meta.env.VITE_OIDC_CLIENT_ID ?? "giapha_admin",
  redirectUri: `${origin}/auth/callback`,
  silentRedirectUri: `${origin}/silent-renew.html`,
  postLogoutRedirectUri: origin,
};

/** Đồng bộ cho silent-renew.html đọc từ localStorage. */
export function persistOidcHints() {
  localStorage.setItem("giapha.oidc.authority", adminOidcConfig.authority);
  localStorage.setItem("giapha.oidc.client_id", adminOidcConfig.clientId);
}
