import { apiFetch, apiFetchPage, type PageResult } from "./http";

export type MediaAlbumDto = {
  id?: number;
  title: string;
  description?: string | null;
  coverObjectKey?: string | null;
};

export type MediaPhotoDto = {
  id?: number;
  objectKey: string;
  caption?: string | null;
  blurhash?: string | null;
  viewCount?: number | null;
  album?: MediaAlbumDto | null;
};

export type UploadResponse = {
  photoId: number;
  objectKey: string;
  presignedGetUrl: string;
  imgproxyUrl: string;
};

export async function listMediaAlbums(
  token: string | null,
  page = 0,
  size = 50,
): Promise<PageResult<MediaAlbumDto>> {
  return apiFetchPage<MediaAlbumDto>("/api/media-albums?eagerload=true&sort=title,asc", {
    token,
    page,
    size,
  });
}

export async function createMediaAlbum(
  dto: MediaAlbumDto,
  token: string | null,
): Promise<MediaAlbumDto> {
  return apiFetch<MediaAlbumDto>("/api/media-albums", { method: "POST", body: dto, token });
}

export async function deleteMediaAlbum(id: number, token: string | null): Promise<void> {
  await apiFetch<void>(`/api/media-albums/${id}`, { method: "DELETE", token });
}

export async function listMediaPhotos(
  token: string | null,
  page = 0,
  size = 20,
): Promise<PageResult<MediaPhotoDto>> {
  return apiFetchPage<MediaPhotoDto>("/api/media-photos?eagerload=true&sort=id,desc", {
    token,
    page,
    size,
  });
}

export async function deleteMediaPhoto(id: number, token: string | null): Promise<void> {
  await apiFetch<void>(`/api/media-photos/${id}`, { method: "DELETE", token });
}

export async function uploadMediaPhoto(
  file: File,
  opts: { albumId?: number; caption?: string },
  token: string | null,
): Promise<UploadResponse> {
  const form = new FormData();
  form.append("file", file);
  if (opts.albumId != null) form.append("albumId", String(opts.albumId));
  if (opts.caption?.trim()) form.append("caption", opts.caption.trim());
  return apiFetch<UploadResponse>("/api/v1/media/upload", {
    method: "POST",
    formData: form,
    token,
  });
}
