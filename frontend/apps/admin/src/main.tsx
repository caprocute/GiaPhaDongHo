import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@giapha/auth";
import "@giapha/tokens/tokens.css";
import { App } from "./App";
import { adminOidcConfig } from "./auth/oidcConfig";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider config={adminOidcConfig}>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
