import { apiFetch } from "./http";

export type ManagedUserDto = {
  id: string;
  username?: string | null;
  email?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  displayName?: string | null;
  enabled?: boolean;
  emailVerified?: boolean;
  createdTimestamp?: number | null;
  realmRoles?: string[];
};

export type RoleOptionDto = {
  code: string;
  label: string;
  description: string;
};

export type LoginEventDto = {
  type?: string | null;
  time?: number | null;
  ipAddress?: string | null;
  error?: string | null;
};

export async function getUserAdminStatus(token: string | null): Promise<{ available: boolean }> {
  return apiFetch<{ available: boolean }>("/api/v1/admin/users/status", { token });
}

export async function listManagedUsers(
  token: string | null,
  opts: { q?: string; enabled?: boolean; page?: number; size?: number } = {},
): Promise<ManagedUserDto[]> {
  const params = new URLSearchParams();
  if (opts.q?.trim()) params.set("q", opts.q.trim());
  if (opts.enabled != null) params.set("enabled", String(opts.enabled));
  params.set("page", String(opts.page ?? 0));
  params.set("size", String(opts.size ?? 20));
  const qs = params.toString();
  return apiFetch<ManagedUserDto[]>(`/api/v1/admin/users?${qs}`, { token });
}

export async function listRoleOptions(token: string | null): Promise<RoleOptionDto[]> {
  return apiFetch<RoleOptionDto[]>("/api/v1/admin/users/roles", { token });
}

export async function getManagedUser(id: string, token: string | null): Promise<ManagedUserDto> {
  return apiFetch<ManagedUserDto>(`/api/v1/admin/users/${encodeURIComponent(id)}`, { token });
}

export async function approveManagedUser(id: string, token: string | null): Promise<ManagedUserDto> {
  return apiFetch<ManagedUserDto>(`/api/v1/admin/users/${encodeURIComponent(id)}/approve`, {
    method: "POST",
    token,
  });
}

export async function lockManagedUser(id: string, token: string | null): Promise<ManagedUserDto> {
  return apiFetch<ManagedUserDto>(`/api/v1/admin/users/${encodeURIComponent(id)}/lock`, {
    method: "POST",
    token,
  });
}

export async function activateManagedUser(id: string, token: string | null): Promise<ManagedUserDto> {
  return apiFetch<ManagedUserDto>(`/api/v1/admin/users/${encodeURIComponent(id)}/activate`, {
    method: "POST",
    token,
  });
}

export async function setManagedUserRoles(
  id: string,
  roles: string[],
  token: string | null,
): Promise<ManagedUserDto> {
  return apiFetch<ManagedUserDto>(`/api/v1/admin/users/${encodeURIComponent(id)}/roles`, {
    method: "PUT",
    body: { roles },
    token,
  });
}

export async function resetManagedUserPassword(
  id: string,
  temporaryPassword: string,
  token: string | null,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/api/v1/admin/users/${encodeURIComponent(id)}/reset-password`,
    {
      method: "POST",
      body: { temporaryPassword },
      token,
    },
  );
}

export async function getManagedUserLoginHistory(
  id: string,
  token: string | null,
): Promise<LoginEventDto[]> {
  return apiFetch<LoginEventDto[]>(
    `/api/v1/admin/users/${encodeURIComponent(id)}/login-history`,
    { token },
  );
}
