"use client";

import { useEffect, type ReactNode } from "react";
import { AuthProvider } from "@giapha/auth";
import { portalOidcConfig } from "./oidcConfig";

export function PortalAuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    localStorage.setItem("giapha.oidc.authority", portalOidcConfig.authority);
    localStorage.setItem("giapha.oidc.client_id", portalOidcConfig.clientId);
  }, []);

  return <AuthProvider config={portalOidcConfig}>{children}</AuthProvider>;
}
