export class ApiError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function apiBase(): string {
  return (import.meta.env.VITE_API_BASE_URL ?? "").replace(/\/$/, "");
}

export type PageResult<T> = {
  content: T[];
  /** Trang 0-based (Spring) */
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

type ApiFetchOptions = {
  method?: string;
  body?: unknown;
  token?: string | null;
  /** FormData / Blob — không set Content-Type (browser tự boundary). */
  formData?: FormData;
};

async function request(path: string, options: ApiFetchOptions = {}): Promise<Response> {
  const base = apiBase();
  if (!base) {
    throw new ApiError(0, "Chưa cấu hình địa chỉ API (VITE_API_BASE_URL).");
  }

  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined && !options.formData) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  let body: BodyInit | undefined;
  if (options.formData) {
    body = options.formData;
  } else if (options.body !== undefined) {
    body = JSON.stringify(options.body);
  }

  return fetch(`${base}${path}`, {
    method: options.method ?? "GET",
    headers,
    body,
  });
}

async function readError(res: Response): Promise<never> {
  let detail = res.statusText;
  try {
    const text = await res.text();
    if (text) detail = text.slice(0, 280);
  } catch {
    /* ignore */
  }
  throw new ApiError(res.status, detail || `HTTP ${res.status}`);
}

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const res = await request(path, options);

  if (res.status === 204) {
    return undefined as T;
  }

  if (!res.ok) {
    await readError(res);
  }

  return (await res.json()) as T;
}

/** Đọc body mảng + header phân trang JHipster (`X-Total-Count`). */
export async function apiFetchPage<T>(
  path: string,
  options: ApiFetchOptions & { page?: number; size?: number } = {},
): Promise<PageResult<T>> {
  const page = options.page ?? 0;
  const size = options.size ?? 20;
  const sep = path.includes("?") ? "&" : "?";
  const pagedPath = `${path}${sep}page=${page}&size=${size}`;
  const res = await request(pagedPath, options);

  if (!res.ok) {
    await readError(res);
  }

  const content = (await res.json()) as T[];
  const totalHeader = res.headers.get("X-Total-Count") ?? res.headers.get("x-total-count");
  const totalElements = totalHeader ? Number(totalHeader) : content.length;
  const totalPages = Math.max(1, Math.ceil((Number.isFinite(totalElements) ? totalElements : 0) / size) || 1);

  return {
    content: Array.isArray(content) ? content : [],
    page,
    size,
    totalElements: Number.isFinite(totalElements) ? totalElements : content.length,
    totalPages: content.length === 0 && (!totalHeader || totalElements === 0) ? 1 : totalPages,
  };
}

/** Phân trang client khi API chưa hỗ trợ Pageable. */
export function slicePage<T>(items: T[], page: number, size: number): PageResult<T> {
  const totalElements = items.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / size) || 1);
  const safePage = Math.min(Math.max(0, page), totalPages - 1);
  const start = safePage * size;
  return {
    content: items.slice(start, start + size),
    page: safePage,
    size,
    totalElements,
    totalPages,
  };
}
