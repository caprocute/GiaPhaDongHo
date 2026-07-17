import { apiFetch, apiFetchPage, type PageResult } from "./http";
import type { CmsCategoryDto, CmsCommentDto, CmsPostDto } from "./cmsTypes";

export async function listCmsPosts(
  token: string | null,
  page = 0,
  size = 20,
): Promise<PageResult<CmsPostDto>> {
  return apiFetchPage<CmsPostDto>(`/api/cms-posts?eagerload=true&sort=id,desc`, {
    token,
    page,
    size,
  });
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
  const page = await apiFetchPage<CmsCategoryDto>(`/api/cms-categories?sort=name,asc`, {
    token,
    page: 0,
    size: 200,
  });
  return page.content;
}

export async function listCmsComments(
  token: string | null,
  page = 0,
  size = 20,
): Promise<PageResult<CmsCommentDto>> {
  return apiFetchPage<CmsCommentDto>(`/api/cms-comments?eagerload=true&sort=id,desc`, {
    token,
    page,
    size,
  });
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
