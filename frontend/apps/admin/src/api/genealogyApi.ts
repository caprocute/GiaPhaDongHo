import { apiFetch } from "./http";

export type PersonDto = {
  id?: number;
  code?: string;
  fullName?: string;
  lifeStatus?: string;
  generation?: number | null;
};

export type FamilyUnionDto = {
  id?: number;
  orderNo?: number | null;
  marriageInfoJson?: string | null;
};

export type UnionMemberDto = {
  id?: number;
  role: string;
  union?: { id: number } | null;
  person?: { id: number; code?: string; fullName?: string } | null;
};

export type UnionChildDto = {
  id?: number;
  orderNo?: number | null;
  union?: { id: number } | null;
  child?: { id: number; code?: string; fullName?: string } | null;
};

export function defaultTreeSlug(): string {
  const fromEnv = import.meta.env.VITE_DEFAULT_TREE_SLUG?.trim();
  if (fromEnv) return fromEnv;
  try {
    return localStorage.getItem("giapha.admin.treeSlug")?.trim() || "ho-hoang";
  } catch {
    return "ho-hoang";
  }
}

export function setStoredTreeSlug(slug: string) {
  localStorage.setItem("giapha.admin.treeSlug", slug.trim());
}

export async function listTreePersons(
  slug: string,
  token: string | null,
): Promise<PersonDto[]> {
  return apiFetch<PersonDto[]>(
    `/api/v1/trees/${encodeURIComponent(slug)}/persons?size=200&sort=code,asc`,
    { token },
  );
}

export async function listTreeUnions(
  slug: string,
  token: string | null,
): Promise<FamilyUnionDto[]> {
  return apiFetch<FamilyUnionDto[]>(
    `/api/v1/trees/${encodeURIComponent(slug)}/unions?size=200&sort=id,desc`,
    { token },
  );
}

export async function createTreeUnion(
  slug: string,
  dto: FamilyUnionDto,
  token: string | null,
): Promise<FamilyUnionDto> {
  return apiFetch<FamilyUnionDto>(`/api/v1/trees/${encodeURIComponent(slug)}/unions`, {
    method: "POST",
    body: dto,
    token,
  });
}

export async function listUnionMembers(token: string | null): Promise<UnionMemberDto[]> {
  return apiFetch<UnionMemberDto[]>("/api/union-members?eagerload=true", { token });
}

export async function createUnionMember(
  dto: UnionMemberDto,
  token: string | null,
): Promise<UnionMemberDto> {
  return apiFetch<UnionMemberDto>("/api/union-members", {
    method: "POST",
    body: dto,
    token,
  });
}

export async function deleteUnionMember(id: number, token: string | null): Promise<void> {
  await apiFetch<void>(`/api/union-members/${id}`, { method: "DELETE", token });
}

export async function listUnionChildren(token: string | null): Promise<UnionChildDto[]> {
  return apiFetch<UnionChildDto[]>("/api/union-children?eagerload=true", { token });
}

export async function createUnionChild(
  dto: UnionChildDto,
  token: string | null,
): Promise<UnionChildDto> {
  return apiFetch<UnionChildDto>("/api/union-children", {
    method: "POST",
    body: dto,
    token,
  });
}

export async function deleteUnionChild(id: number, token: string | null): Promise<void> {
  await apiFetch<void>(`/api/union-children/${id}`, { method: "DELETE", token });
}
