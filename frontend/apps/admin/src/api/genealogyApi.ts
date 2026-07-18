import { apiFetch, apiFetchPage, type PageResult } from "./http";

export type PersonDto = {
  id?: number;
  code?: string | null;
  fullName?: string | null;
  tenHuy?: string | null;
  gender?: string | null;
  lifeStatus?: string | null;
  generation?: number | null;
  birthSolar?: string | null;
  birthLunarJson?: string | null;
  deathSolar?: string | null;
  deathLunarJson?: string | null;
  privacy?: string | null;
  notes?: string | null;
};

export type FamilyUnionDto = {
  id?: number;
  orderNo?: number | null;
  marriageInfoJson?: string | null;
  tree?: { id?: number } | null;
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
  query?: string,
  page = 0,
  size = 20,
): Promise<PageResult<PersonDto>> {
  const q = query?.trim() ? `&query=${encodeURIComponent(query.trim())}` : "";
  return apiFetchPage<PersonDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/persons?sort=code,asc${q}`,
    { token, page, size },
  );
}

export async function getTreePerson(
  slug: string,
  code: string,
  token: string | null,
): Promise<PersonDto> {
  return apiFetch<PersonDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/persons/${encodeURIComponent(code)}`,
    { token },
  );
}

export async function getPersonById(id: number, token: string | null): Promise<PersonDto> {
  return apiFetch<PersonDto>(`/api/people/${id}`, { token });
}

export async function createTreePerson(
  slug: string,
  dto: PersonDto,
  token: string | null,
  opts?: { parentCode?: string; spouse?: boolean },
): Promise<PersonDto> {
  const params = new URLSearchParams();
  if (opts?.parentCode) params.set("parentCode", opts.parentCode);
  if (opts?.spouse) params.set("spouse", "true");
  const qs = params.toString() ? `?${params}` : "";
  return apiFetch<PersonDto>(`/api/v1/trees/${encodeURIComponent(slug)}/persons${qs}`, {
    method: "POST",
    body: dto,
    token,
  });
}

export async function updateTreePerson(
  slug: string,
  code: string,
  dto: PersonDto,
  token: string | null,
): Promise<PersonDto> {
  return apiFetch<PersonDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/persons/${encodeURIComponent(code)}`,
    { method: "PUT", body: dto, token },
  );
}

export async function deletePersonById(id: number, token: string | null): Promise<void> {
  await apiFetch<void>(`/api/people/${id}`, { method: "DELETE", token });
}

export type ChangeRequestDto = {
  id?: number;
  requesterUserId?: string;
  entityType?: string;
  summary?: string | null;
  diffJson?: string;
  status?: string | null;
  reviewerNote?: string | null;
  createdAt?: string | null;
  reviewedAt?: string | null;
  person?: PersonDto | null;
};

export async function listChangeRequests(
  slug: string,
  status: string | undefined,
  token: string | null,
  page = 0,
  size = 20,
): Promise<PageResult<ChangeRequestDto>> {
  const q = status ? `status=${encodeURIComponent(status)}&` : "";
  return apiFetchPage<ChangeRequestDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/change-requests?${q}sort=id,desc`,
    { token, page, size },
  );
}

export async function reviewChangeRequest(
  slug: string,
  id: number,
  action: "approve" | "reject",
  reviewerNote: string | undefined,
  token: string | null,
): Promise<ChangeRequestDto> {
  return apiFetch<ChangeRequestDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/change-requests/${id}/${action}`,
    { method: "POST", body: { reviewerNote }, token },
  );
}

export type DonationCampaignDto = {
  id?: number;
  title: string;
  goalAmount?: number | string | null;
  raisedAmount?: number | string | null;
  vietqrPayload?: string | null;
  status?: string | null;
};

export type DonationCampaignView = {
  campaign: DonationCampaignDto;
  qrImageUrl?: string | null;
  transferContent?: string | null;
};

export type DonationContributionDto = {
  id?: number;
  donorName: string;
  amount?: number | string | null;
  kind?: string | null;
  status?: string | null;
  isPublic?: boolean | null;
  note?: string | null;
  createdAt?: string | null;
  confirmedAt?: string | null;
  confirmedBy?: string | null;
};

export async function listDonationCampaignsAdmin(
  slug: string,
  token: string | null,
  page = 0,
  size = 20,
): Promise<PageResult<DonationCampaignView>> {
  return apiFetchPage<DonationCampaignView>(
    `/api/v1/trees/${encodeURIComponent(slug)}/donation-campaigns/admin`,
    { token, page, size },
  );
}

export async function upsertDonationCampaign(
  slug: string,
  dto: DonationCampaignDto,
  token: string | null,
): Promise<DonationCampaignDto> {
  if (dto.id != null) {
    return apiFetch<DonationCampaignDto>(
      `/api/v1/trees/${encodeURIComponent(slug)}/donation-campaigns/${dto.id}`,
      { method: "PUT", body: dto, token },
    );
  }
  return apiFetch<DonationCampaignDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/donation-campaigns`,
    { method: "POST", body: dto, token },
  );
}

export async function listCampaignContributions(
  slug: string,
  campaignId: number,
  token: string | null,
  page = 0,
  size = 20,
  filter?: { status?: string; kind?: string; search?: string },
): Promise<PageResult<DonationContributionDto>> {
  const q = new URLSearchParams();
  if (filter?.status) q.set("status", filter.status);
  if (filter?.kind) q.set("kind", filter.kind);
  if (filter?.search) q.set("search", filter.search);
  const qs = q.toString() ? `?${q.toString()}` : "";
  return apiFetchPage<DonationContributionDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/donation-campaigns/${campaignId}/contributions/admin${qs}`,
    { token, page, size },
  );
}

export async function confirmContribution(
  slug: string,
  campaignId: number,
  contribId: number,
  token: string | null,
): Promise<DonationContributionDto> {
  return apiFetch<DonationContributionDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/donation-campaigns/${campaignId}/contributions/${contribId}/confirm`,
    { method: "PATCH", token },
  );
}

export async function rejectContribution(
  slug: string,
  campaignId: number,
  contribId: number,
  token: string | null,
): Promise<DonationContributionDto> {
  return apiFetch<DonationContributionDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/donation-campaigns/${campaignId}/contributions/${contribId}/reject`,
    { method: "PATCH", token },
  );
}

export async function recordDonationContribution(
  slug: string,
  campaignId: number,
  dto: DonationContributionDto,
  token: string | null,
  confirm = true,
): Promise<DonationContributionDto> {
  const q = confirm ? "?confirm=true" : "?confirm=false";
  return apiFetch<DonationContributionDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/donation-campaigns/${campaignId}/contributions${q}`,
    { method: "POST", body: dto, token },
  );
}

export type ClanEventDto = {
  id?: number;
  title: string;
  startSolar?: string | null;
  lunarJson?: string | null;
  location?: string | null;
  checklistJson?: string | null;
};

export type ClanEventView = {
  event: ClanEventDto;
  albumId?: number | null;
  stats?: { households?: number; people?: number; vehicles?: number };
};

export type EventRsvpDto = {
  id?: number;
  householdName: string;
  headcount?: number | null;
  vehicles?: number | null;
  assignment?: string | null;
};

export async function listClanEvents(
  slug: string,
  token: string | null,
  page = 0,
  size = 20,
): Promise<PageResult<ClanEventView>> {
  return apiFetchPage<ClanEventView>(`/api/v1/trees/${encodeURIComponent(slug)}/events`, {
    token,
    page,
    size,
  });
}

export async function upsertClanEvent(
  slug: string,
  dto: ClanEventDto,
  token: string | null,
): Promise<ClanEventDto> {
  if (dto.id != null) {
    return apiFetch<ClanEventDto>(
      `/api/v1/trees/${encodeURIComponent(slug)}/events/${dto.id}`,
      { method: "PUT", body: dto, token },
    );
  }
  return apiFetch<ClanEventDto>(`/api/v1/trees/${encodeURIComponent(slug)}/events`, {
    method: "POST",
    body: dto,
    token,
  });
}

export async function listEventRsvps(
  slug: string,
  eventId: number,
  token: string | null,
  page = 0,
  size = 50,
): Promise<PageResult<EventRsvpDto>> {
  return apiFetchPage<EventRsvpDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/events/${eventId}/rsvps`,
    { token, page, size },
  );
}

export async function assignEventRsvp(
  slug: string,
  rsvpId: number,
  assignment: string,
  token: string | null,
): Promise<EventRsvpDto> {
  return apiFetch<EventRsvpDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/event-rsvps/${rsvpId}/assignment`,
    { method: "PUT", body: { assignment }, token },
  );
}

export type NotificationOutboxDto = {
  id?: number;
  channel?: string;
  payloadJson?: string;
  status?: string | null;
  createdAt?: string | null;
  sentAt?: string | null;
};

export async function listNotificationOutbox(
  slug: string,
  status: string | undefined,
  token: string | null,
  page = 0,
  size = 20,
): Promise<PageResult<NotificationOutboxDto>> {
  const q = status ? `status=${encodeURIComponent(status)}&` : "";
  return apiFetchPage<NotificationOutboxDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/notification-outbox?${q}`,
    { token, page, size },
  );
}

export async function dispatchNotificationOutbox(
  slug: string,
  token: string | null,
): Promise<{ processed: number }> {
  return apiFetch<{ processed: number }>(
    `/api/v1/trees/${encodeURIComponent(slug)}/notification-outbox/dispatch`,
    { method: "POST", body: {}, token },
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

export async function updateFamilyUnion(
  id: number,
  dto: FamilyUnionDto,
  token: string | null,
): Promise<FamilyUnionDto> {
  return apiFetch<FamilyUnionDto>(`/api/family-unions/${id}`, {
    method: "PUT",
    body: { ...dto, id },
    token,
  });
}

export async function deleteFamilyUnion(id: number, token: string | null): Promise<void> {
  await apiFetch<void>(`/api/family-unions/${id}`, { method: "DELETE", token });
}

export type TreeFeatureSettings = {
  maxNodesDefault?: number;
  publicTree?: boolean;
  maskLivingBirthDate?: boolean;
  allowSelfDeclare?: boolean;
  allowTreeExport?: boolean;
  codePrefix?: string;
};

export type NotifySettings = {
  remindDaysBefore?: number;
  /** Giờ gửi nhắc trong ngày (0–23). */
  remindHour?: number;
  channelEmail?: boolean;
  channelZalo?: boolean;
  channelWeb?: boolean;
};

export type CalendarSettings = {
  timezone?: string;
  showLeapMonthLabel?: boolean;
};

export type AuthSettings = {
  publicRegistration?: boolean;
  autoActivate?: boolean;
  captchaEnabled?: boolean;
  requireTerms?: boolean;
};

export type PrivacySettings = {
  /** members | public | private */
  defaultLivingPrivacy?: string;
};

export type SmtpSettings = {
  configured?: boolean;
  host?: string | null;
  port?: number;
  tls?: boolean;
  username?: string | null;
  fromEmail?: string | null;
  fromName?: string | null;
  /** Chỉ gửi khi đổi; để trống = giữ mật khẩu cũ. */
  password?: string | null;
};

export type ZaloSettings = {
  configured?: boolean;
  /** off | dry_run | live */
  mode?: string;
  oaId?: string | null;
  appId?: string | null;
  accessToken?: string | null;
};

export type WebhookSettings = {
  enabled?: boolean;
  url?: string | null;
  secret?: string | null;
  secretConfigured?: boolean;
};

export type BackupSettings = {
  enabled?: boolean;
  /** daily | weekly */
  schedule?: string;
  runAt?: string;
};

export type TreeSettingsDto = {
  slug?: string;
  displayName?: string;
  shortName?: string | null;
  provinceCode?: string | null;
  address?: string | null;
  contactName?: string | null;
  contactPhone?: string | null;
  contactEmail?: string | null;
  description?: string | null;
  seoKeywords?: string[];
  bankName?: string | null;
  bankBranch?: string | null;
  bankAccountNo?: string | null;
  bankAccountName?: string | null;
  socialFacebook?: string | null;
  socialZalo?: string | null;
  brandPalette?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  tree?: TreeFeatureSettings;
  notify?: NotifySettings;
  calendar?: CalendarSettings;
  auth?: AuthSettings;
  privacy?: PrivacySettings;
  smtp?: SmtpSettings;
  zalo?: ZaloSettings;
  webhook?: WebhookSettings;
  backup?: BackupSettings;
};

export async function getTreeSettings(
  slug: string,
  token?: string | null,
): Promise<TreeSettingsDto> {
  return apiFetch<TreeSettingsDto>(`/api/v1/trees/${encodeURIComponent(slug)}/settings`, {
    token: token ?? null,
  });
}

export async function updateTreeSettings(
  slug: string,
  dto: TreeSettingsDto,
  token: string | null,
): Promise<TreeSettingsDto> {
  return apiFetch<TreeSettingsDto>(`/api/v1/trees/${encodeURIComponent(slug)}/settings`, {
    method: "PUT",
    body: dto,
    token,
  });
}

export async function testTreeSmtp(
  slug: string,
  to: string | undefined,
  token: string | null,
): Promise<{ message: string }> {
  return apiFetch<{ message: string }>(
    `/api/v1/trees/${encodeURIComponent(slug)}/settings/smtp/test`,
    {
      method: "POST",
      body: to ? { to } : {},
      token,
    },
  );
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

export type ScholarshipEntryDto = {
  id?: number;
  personName: string;
  achievement: string;
  year?: number | null;
  status?: string | null;
  personCode?: string | null;
  level?: string | null;
  schoolOrField?: string | null;
  medalNote?: string | null;
  lineageNote?: string | null;
  reviewNote?: string | null;
  awardAmount?: number | string | null;
  awardedAt?: string | null;
  person?: { id?: number; code?: string; fullName?: string } | null;
};

export type ScholarshipStats = {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  awaitingAwardCount?: number;
  totalCount: number;
  advancedDegreeCount: number;
  awardedTotal: number | string;
  fundCampaignId?: number | null;
  fundTitle?: string | null;
  fundRaisedAmount?: number | string | null;
  fundGoalAmount?: number | string | null;
  fundRemaining?: number | string | null;
  fundStatus?: string | null;
  awardRoundLabel?: string | null;
};

export type ScholarshipReviewBody = {
  reviewNote?: string;
};

export type ScholarshipAwardRoundBody = {
  entryIds: number[];
  defaultAwardAmount: number;
  reviewNote?: string;
  createHonorEvent?: boolean;
  honorEventTitle?: string;
  honorEventLocation?: string;
};

export async function listScholarshipAdmin(
  slug: string,
  token: string | null,
  page = 0,
  size = 20,
  filter?: { status?: string; level?: string; year?: number; q?: string },
): Promise<PageResult<ScholarshipEntryDto>> {
  const q = new URLSearchParams();
  if (filter?.status && filter.status !== "all") q.set("status", filter.status);
  if (filter?.level) q.set("level", filter.level);
  if (filter?.year != null) q.set("year", String(filter.year));
  if (filter?.q) q.set("q", filter.q);
  const qs = q.toString() ? `?${q.toString()}` : "";
  return apiFetchPage<ScholarshipEntryDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin${qs}`,
    { token, page, size },
  );
}

export async function getScholarshipStats(
  slug: string,
  token: string | null,
): Promise<ScholarshipStats> {
  return apiFetch<ScholarshipStats>(
    `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/stats`,
    { token },
  );
}

export async function reviewScholarshipEntry(
  slug: string,
  id: number,
  action: "approve" | "reject",
  body: ScholarshipReviewBody | undefined,
  token: string | null,
): Promise<ScholarshipEntryDto> {
  return apiFetch<ScholarshipEntryDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/${id}/${action}`,
    { method: "POST", body: body ?? {}, token },
  );
}

export async function awardScholarshipRound(
  slug: string,
  body: ScholarshipAwardRoundBody,
  token: string | null,
): Promise<{
  awardedCount: number;
  skippedCount?: number;
  amountPerSlot?: number | string;
  honorEventId?: number | null;
  honorEventTitle?: string | null;
}> {
  return apiFetch(
    `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/award-round`,
    { method: "POST", body, token },
  );
}

export async function upsertScholarshipAdmin(
  slug: string,
  dto: ScholarshipEntryDto,
  token: string | null,
  publishNow = false,
): Promise<ScholarshipEntryDto> {
  const q = publishNow ? "?publishNow=true" : "?publishNow=false";
  if (dto.id != null) {
    return apiFetch<ScholarshipEntryDto>(
      `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin/${dto.id}${q}`,
      { method: "PUT", body: dto, token },
    );
  }
  return apiFetch<ScholarshipEntryDto>(
    `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin${q}`,
    { method: "POST", body: dto, token },
  );
}

export async function deleteScholarshipAdmin(
  slug: string,
  id: number,
  token: string | null,
): Promise<void> {
  await apiFetch<void>(
    `/api/v1/trees/${encodeURIComponent(slug)}/scholarship-entries/admin/${id}`,
    { method: "DELETE", token },
  );
}
