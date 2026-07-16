import type { OidcAppConfig } from "@giapha/auth";

const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";

export const portalOidcConfig: OidcAppConfig = {
  authority:
    process.env.NEXT_PUBLIC_OIDC_AUTHORITY ?? "http://localhost:18086/realms/jhipster",
  clientId: process.env.NEXT_PUBLIC_OIDC_CLIENT_ID ?? "giapha_portal",
  redirectUri: `${origin}/auth/callback`,
  silentRedirectUri: `${origin}/silent-renew.html`,
  postLogoutRedirectUri: origin,
};
