"use client";

import {
  User,
  UserManager,
  WebStorageStateStore,
  type UserManagerSettings,
} from "oidc-client-ts";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createUserManagerSettings, type OidcAppConfig } from "./config";

type AuthState = {
  user: User | null;
  loading: boolean;
  error: string | null;
  /** Redirect Hosted Login Keycloak (fallback / silent renew callback). */
  login: () => Promise<void>;
  /** Đăng nhập trong app — Resource Owner Password (portal + admin CRM). */
  loginWithPassword: (username: string, password: string) => Promise<User>;
  /** Đăng xuất local — không điều hướng sang Keycloak. */
  logout: () => Promise<void>;
  getAccessToken: () => Promise<string | null>;
  completeSignIn: () => Promise<User | null>;
};

const AuthContext = createContext<AuthState | null>(null);

function mapPasswordGrantError(err: unknown): string {
  const msg = err instanceof Error ? err.message : String(err);
  const lower = msg.toLowerCase();
  if (lower.includes("invalid_grant") || lower.includes("invalid user credentials")) {
    return "Sai tên đăng nhập hoặc mật khẩu.";
  }
  if (lower.includes("unauthorized_client") || lower.includes("unauthorized")) {
    return "Client chưa bật Direct Access Grants — đồng bộ realm Keycloak.";
  }
  if (lower.includes("failed to fetch") || lower.includes("network")) {
    return "Không kết nối được máy chủ xác thực. Kiểm tra tunnel Keycloak.";
  }
  return msg || "Đăng nhập thất bại.";
}

export function AuthProvider({
  config,
  children,
}: {
  config: OidcAppConfig;
  children: ReactNode;
}) {
  const manager = useMemo(() => {
    const settings: UserManagerSettings = {
      ...createUserManagerSettings(config),
    };
    if (typeof window !== "undefined") {
      settings.userStore = new WebStorageStateStore({ store: window.localStorage });
    }
    return new UserManager(settings);
  }, [config]);

  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    void manager
      .getUser()
      .then((u) => {
        if (!cancelled) {
          setUser(u && !u.expired ? u : null);
          setLoading(false);
        }
      })
      .catch((e: unknown) => {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "OIDC lỗi");
          setLoading(false);
        }
      });

    const onUserLoaded = (u: User) => setUser(u);
    const onUserUnloaded = () => setUser(null);
    const onSilentRenewError = (e: Error) => setError(e.message);

    manager.events.addUserLoaded(onUserLoaded);
    manager.events.addUserUnloaded(onUserUnloaded);
    manager.events.addSilentRenewError(onSilentRenewError);

    return () => {
      cancelled = true;
      manager.events.removeUserLoaded(onUserLoaded);
      manager.events.removeUserUnloaded(onUserUnloaded);
      manager.events.removeSilentRenewError(onSilentRenewError);
    };
  }, [manager]);

  const login = useCallback(async () => {
    setError(null);
    await manager.signinRedirect();
  }, [manager]);

  const loginWithPassword = useCallback(
    async (username: string, password: string) => {
      setError(null);
      try {
        const u = await manager.signinResourceOwnerCredentials({
          username: username.trim(),
          password,
        });
        setUser(u);
        return u;
      } catch (e: unknown) {
        const mapped = mapPasswordGrantError(e);
        setError(mapped);
        throw new Error(mapped);
      }
    },
    [manager],
  );

  const logout = useCallback(async () => {
    setError(null);
    await manager.removeUser();
    setUser(null);
  }, [manager]);

  const getAccessToken = useCallback(async () => {
    const u = await manager.getUser();
    if (!u || u.expired) {
      try {
        const renewed = await manager.signinSilent();
        return renewed?.access_token ?? null;
      } catch {
        return null;
      }
    }
    return u.access_token;
  }, [manager]);

  const completeSignIn = useCallback(async () => {
    const u = await manager.signinRedirectCallback();
    setUser(u);
    return u;
  }, [manager]);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      login,
      loginWithPassword,
      logout,
      getAccessToken,
      completeSignIn,
    }),
    [user, loading, error, login, loginWithPassword, logout, getAccessToken, completeSignIn],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth phải dùng trong AuthProvider");
  }
  return ctx;
}

export async function handleSilentRenew(config: OidcAppConfig): Promise<void> {
  const manager = new UserManager(createUserManagerSettings(config));
  await manager.signinSilentCallback();
}
