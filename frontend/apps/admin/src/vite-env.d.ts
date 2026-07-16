/// <reference types="vite/client" />
declare module "@giapha/tokens/tokens.css";
declare module "*.css";

interface ImportMetaEnv {
  readonly VITE_OIDC_AUTHORITY?: string;
  readonly VITE_OIDC_CLIENT_ID?: string;
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_DEFAULT_TREE_SLUG?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
