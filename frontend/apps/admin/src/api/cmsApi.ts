import { apiFetch } from "./http";
import type { CmsCategoryDto, CmsCommentDto, CmsPostDto } from "./cmsTypes";

const PAGE = "page=0&size=200&eagerload=true";

export async function listCmsPosts(token: string | null): Promise<CmsPostDto[]> {
  return apiFetch<CmsPostDto[]>(`/api/cms-posts?${PAGE}&sort=id,desc`, { token });
}

export async function getCmsPost(id: number, token: string | null): Promise<CmsPostDto> {
  return apiFetch<CmsPostDto>(`/api/cms-posts/${id}?eagerload=true`, { token });
}

export async function createCmsPost(dto: CmsPostDto, token: string | null): Promise<CmsPostDto> {
  return apiFetch<CmsPostDto>("/api/cms-posts", { method: "POST", body: dto, token });
}

export async function updateCmsPost(
  id: number,
  dto: CmsPostDto,
  token: string | null,
): Promise<CmsPostDto> {
  return apiFetch<CmsPostDto>(`/api/cms-posts/${id}`, { method: "PUT", body: dto, token });
}

export async function deleteCmsPost(id: number, token: string | null): Promise<void> {
  await apiFetch<void>(`/api/cms-posts/${id}`, { method: "DELETE", token });
}

export async function listCmsCategories(token: string | null): Promise<CmsCategoryDto[]> {
  return apiFetch<CmsCategoryDto[]>(`/api/cms-categories?page=0&size=200&sort=name,asc`, { token });
}

export async function listCmsComments(token: string | null): Promise<CmsCommentDto[]> {
  return apiFetch<CmsCommentDto[]>(`/api/cms-comments?${PAGE}&sort=id,desc`, { token });
}

export async function patchCmsComment(
  id: number,
  dto: CmsCommentDto,
  token: string | null,
): Promise<CmsCommentDto> {
  return apiFetch<CmsCommentDto>(`/api/cms-comments/${id}`, {
    method: "PATCH",
    body: dto,
    token,
  });
}

export async function deleteCmsComment(id: number, token: string | null): Promise<void> {
  await apiFetch<void>(`/api/cms-comments/${id}`, { method: "DELETE", token });
}
