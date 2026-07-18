export type ApiPerson = {
  id: number;
  code: string;
  fullName: string;
  tenHuy?: string;
  gender?: string;
  lifeStatus?: string;
  generation?: number;
  lineagePath?: string;
  birthSolar?: string;
  deathSolar?: string;
  biography?: string;
  privacy?: string;
};

export type ApiCategory = {
  id?: number;
  slug: string;
  name: string;
  description?: string | null;
  layout?: string | null;
  sortOrder?: number | null;
  visibleOnNav?: boolean | null;
};

export type ApiPost = {
  id?: number;
  slug: string;
  title: string;
  summary?: string;
  bodyHtml?: string;
  publishedAt?: string;
  authorName?: string;
  viewCount?: number;
  coverObjectKey?: string | null;
  category?: { slug?: string; name?: string; description?: string | null };
};

export type ApiAnniversary = {
  id: number;
  lunarDay: number;
  lunarMonth: number;
  leapMonth?: boolean;
  canChi?: string;
  note?: string;
  person?: { code?: string; fullName?: string };
};
