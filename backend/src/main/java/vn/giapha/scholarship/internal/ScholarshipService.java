package vn.giapha.scholarship.internal;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;
import java.util.Set;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.ClanEvent;
import vn.giapha.domain.DonationCampaign;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.Person;
import vn.giapha.domain.ScholarshipEntry;
import vn.giapha.donation.api.DonationStatuses;
import vn.giapha.repository.ClanEventRepository;
import vn.giapha.repository.DonationCampaignRepository;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.repository.PersonRepository;
import vn.giapha.repository.ScholarshipEntryRepository;
import vn.giapha.scholarship.api.ScholarshipAwardRoundRequest;
import vn.giapha.scholarship.api.ScholarshipReviewRequest;
import vn.giapha.scholarship.api.ScholarshipStatuses;
import vn.giapha.scholarship.events.ScholarshipApproved;
import vn.giapha.service.dto.ScholarshipEntryDTO;
import vn.giapha.service.mapper.ScholarshipEntryMapper;

@Service
@Transactional
public class ScholarshipService {

    private static final Set<String> ADVANCED_LEVELS = Set.of("phd", "master");
    private static final Set<String> VALID_LEVELS = Set.of("phd", "master", "university", "highschool");

    private final ScholarshipEntryRepository repository;
    private final FamilyTreeRepository familyTreeRepository;
    private final PersonRepository personRepository;
    private final DonationCampaignRepository campaignRepository;
    private final ClanEventRepository clanEventRepository;
    private final ScholarshipEntryMapper mapper;
    private final ApplicationEventPublisher events;

    public ScholarshipService(
        ScholarshipEntryRepository repository,
        FamilyTreeRepository familyTreeRepository,
        PersonRepository personRepository,
        DonationCampaignRepository campaignRepository,
        ClanEventRepository clanEventRepository,
        ScholarshipEntryMapper mapper,
        ApplicationEventPublisher events
    ) {
        this.repository = repository;
        this.familyTreeRepository = familyTreeRepository;
        this.personRepository = personRepository;
        this.campaignRepository = campaignRepository;
        this.clanEventRepository = clanEventRepository;
        this.mapper = mapper;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<ScholarshipEntryDTO> honorBoard(String slug) {
        return repository.findByTreeSlugAndStatus(slug, ScholarshipStatuses.APPROVED).stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ScholarshipEntryDTO> listAdmin(String slug, String status, String level, Integer year, String q) {
        List<ScholarshipEntry> rows = repository.findByTreeSlug(slug);
        String statusKey = status == null || status.isBlank() ? "all" : status.trim().toLowerCase(Locale.ROOT);
        String levelFilter = normalizeLevel(level);
        String query = q == null ? "" : q.trim().toLowerCase(Locale.ROOT);
        return rows
            .stream()
            .filter(e -> matchesStatusFilter(e, statusKey))
            .filter(e -> levelFilter == null || levelFilter.equalsIgnoreCase(nullToEmpty(e.getLevel())))
            .filter(e -> year == null || Objects.equals(year, e.getYear()))
            .filter(e -> query.isEmpty() || matchesQuery(e, query))
            .map(mapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats(String slug) {
        FamilyTree tree = requireTree(slug);
        List<ScholarshipEntry> all = repository.findByTreeSlug(slug);
        long pending = all.stream().filter(e -> ScholarshipStatuses.NOMINATED.equalsIgnoreCase(nullToEmpty(e.getStatus()))).count();
        long approved = all.stream().filter(e -> ScholarshipStatuses.APPROVED.equalsIgnoreCase(nullToEmpty(e.getStatus()))).count();
        long rejected = all.stream().filter(e -> ScholarshipStatuses.REJECTED.equalsIgnoreCase(nullToEmpty(e.getStatus()))).count();
        long awaitingAward = all.stream().filter(this::isAwaitingAward).count();
        long advanced = all
            .stream()
            .filter(e -> ScholarshipStatuses.APPROVED.equalsIgnoreCase(nullToEmpty(e.getStatus())))
            .filter(e -> ADVANCED_LEVELS.contains(nullToEmpty(e.getLevel()).toLowerCase(Locale.ROOT)))
            .count();
        BigDecimal awardedTotal = all
            .stream()
            .map(ScholarshipEntry::getAwardAmount)
            .filter(Objects::nonNull)
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Object> fund = resolveScholarshipFund(tree.getId());
        BigDecimal fundRaised = (BigDecimal) fund.getOrDefault("raisedAmount", BigDecimal.ZERO);
        BigDecimal fundRemaining = fundRaised.subtract(awardedTotal);
        if (fundRemaining.signum() < 0) {
            fundRemaining = BigDecimal.ZERO;
        }

        Map<String, Object> out = new HashMap<>();
        out.put("pendingCount", pending);
        out.put("approvedCount", approved);
        out.put("rejectedCount", rejected);
        out.put("awaitingAwardCount", awaitingAward);
        out.put("totalCount", all.size());
        out.put("advancedDegreeCount", advanced);
        out.put("awardedTotal", awardedTotal);
        out.put("fundCampaignId", fund.get("id"));
        out.put("fundTitle", fund.get("title"));
        out.put("fundRaisedAmount", fundRaised);
        out.put("fundGoalAmount", fund.get("goalAmount"));
        out.put("fundRemaining", fundRemaining);
        out.put("fundStatus", fund.get("status"));
        int y = LocalDate.now(ZoneOffset.UTC).getYear();
        out.put("awardRoundLabel", "Đợt " + ((LocalDate.now(ZoneOffset.UTC).getMonthValue() <= 6) ? "1" : "2") + "/" + y);
        return out;
    }

    /**
     * Thành viên cổng thông tin đề cử → chờ duyệt.
     */
    public ScholarshipEntryDTO nominate(String slug, ScholarshipEntryDTO dto) {
        return createEntry(slug, dto, ScholarshipStatuses.NOMINATED, false);
    }

    /**
     * Quản trị thêm/sửa hồ sơ khuyến học.
     * {@code publishNow=true} → vào bảng vàng ngay; ngược lại chờ duyệt.
     */
    public ScholarshipEntryDTO upsertAdmin(String slug, ScholarshipEntryDTO dto, boolean publishNow) {
        if (dto.getPersonName() == null || dto.getPersonName().isBlank()) {
            throw new IllegalArgumentException("Họ tên người được đề cử bắt buộc");
        }
        if (dto.getAchievement() == null || dto.getAchievement().isBlank()) {
            throw new IllegalArgumentException("Thành tích bắt buộc");
        }
        if (dto.getId() != null) {
            ScholarshipEntry e = requireEntry(slug, dto.getId());
            boolean wasApproved = ScholarshipStatuses.APPROVED.equalsIgnoreCase(nullToEmpty(e.getStatus()));
            fillFields(slug, e, dto);
            if (publishNow) {
                e.setStatus(ScholarshipStatuses.APPROVED);
            }
            ScholarshipEntry saved = repository.save(e);
            if (!wasApproved && ScholarshipStatuses.APPROVED.equalsIgnoreCase(nullToEmpty(saved.getStatus()))) {
                events.publishEvent(new ScholarshipApproved(saved.getId(), slug, saved.getPersonName(), saved.getYear()));
            }
            return mapper.toDto(saved);
        }
        return createEntry(slug, dto, publishNow ? ScholarshipStatuses.APPROVED : ScholarshipStatuses.NOMINATED, publishNow);
    }

    public void deleteAdmin(String slug, Long id) {
        ScholarshipEntry e = requireEntry(slug, id);
        if (e.getAwardAmount() != null && e.getAwardAmount().signum() > 0) {
            throw new IllegalArgumentException("Không xóa hồ sơ đã trao học bổng — hãy điều chỉnh ghi chú hoặc số tiền thay vì xóa");
        }
        repository.delete(e);
    }

    /**
     * Duyệt vào bảng vàng / từ chối — không gắn số tiền (tiền thuộc bước trao học bổng).
     */
    public ScholarshipEntryDTO review(String slug, Long id, boolean approve, ScholarshipReviewRequest body) {
        ScholarshipEntry e = requireEntry(slug, id);
        if (body != null && body.getReviewNote() != null && !body.getReviewNote().isBlank()) {
            e.setReviewNote(body.getReviewNote().trim());
        }
        if (approve) {
            e.setStatus(ScholarshipStatuses.APPROVED);
            ScholarshipEntry saved = repository.save(e);
            events.publishEvent(new ScholarshipApproved(saved.getId(), slug, saved.getPersonName(), saved.getYear()));
            return mapper.toDto(saved);
        }
        e.setStatus(ScholarshipStatuses.REJECTED);
        return mapper.toDto(repository.save(e));
    }

    /**
     * Trao học bổng: nguồn = quỹ khuyến học (tham chiếu); đích = ghi awardAmount trên hồ sơ đã vào bảng vàng.
     * Chỉ chấp nhận entry status=approved và chưa có số tiền trao.
     */
    public Map<String, Object> awardRound(String slug, ScholarshipAwardRoundRequest body) {
        if (body == null || body.getEntryIds() == null || body.getEntryIds().isEmpty()) {
            throw new IllegalArgumentException("Chọn ít nhất một hồ sơ đã vào bảng vàng để trao học bổng");
        }
        BigDecimal defaultAmount = body.getDefaultAwardAmount();
        if (defaultAmount == null || defaultAmount.signum() <= 0) {
            throw new IllegalArgumentException("Nhập số tiền mỗi suất học bổng");
        }
        FamilyTree tree = requireTree(slug);
        String note = trimToNull(body.getReviewNote());
        BigDecimal amount = defaultAmount.setScale(2, RoundingMode.HALF_UP);
        int awarded = 0;
        int skipped = 0;
        for (Long id : body.getEntryIds()) {
            if (id == null) {
                continue;
            }
            ScholarshipEntry e = requireEntry(slug, id);
            if (!ScholarshipStatuses.APPROVED.equalsIgnoreCase(nullToEmpty(e.getStatus()))) {
                skipped++;
                continue;
            }
            if (e.getAwardAmount() != null && e.getAwardAmount().signum() > 0) {
                skipped++;
                continue;
            }
            e.setAwardAmount(amount);
            e.setAwardedAt(Instant.now());
            if (note != null) {
                e.setReviewNote(note);
            }
            repository.save(e);
            awarded++;
        }
        if (awarded == 0) {
            throw new IllegalArgumentException(
                "Không trao được suất nào — chỉ trao cho hồ sơ đã vào bảng vàng và chưa ghi nhận tiền"
            );
        }

        Long honorEventId = null;
        String honorEventTitle = null;
        if (body.isCreateHonorEvent()) {
            int year = LocalDate.now(ZoneOffset.UTC).getYear();
            honorEventTitle = trimToNull(body.getHonorEventTitle());
            if (honorEventTitle == null) {
                honorEventTitle = "Lễ vinh danh khuyến học " + year;
            }
            ClanEvent event = new ClanEvent();
            event.setTree(tree);
            event.setTitle(honorEventTitle);
            event.setStartSolar(LocalDate.now(ZoneOffset.UTC).plusMonths(1).atStartOfDay().toInstant(ZoneOffset.UTC));
            event.setLocation(trimToNull(body.getHonorEventLocation()));
            event.setChecklistJson(
                "{\"items\":[{\"label\":\"Công bố bảng vàng\",\"done\":true},{\"label\":\"Trao học bổng\",\"done\":true}]}"
            );
            honorEventId = clanEventRepository.save(event).getId();
        }

        Map<String, Object> out = new HashMap<>();
        out.put("awardedCount", awarded);
        out.put("skippedCount", skipped);
        out.put("amountPerSlot", amount);
        out.put("honorEventId", honorEventId);
        out.put("honorEventTitle", honorEventTitle);
        return out;
    }

    private ScholarshipEntryDTO createEntry(String slug, ScholarshipEntryDTO dto, String status, boolean publishEvent) {
        FamilyTree tree = requireTree(slug);
        if (dto.getPersonName() == null || dto.getPersonName().isBlank()) {
            throw new IllegalArgumentException("Họ tên người được đề cử bắt buộc");
        }
        if (dto.getAchievement() == null || dto.getAchievement().isBlank()) {
            throw new IllegalArgumentException("Thành tích bắt buộc");
        }
        ScholarshipEntry e = new ScholarshipEntry();
        e.setTree(tree);
        e.setStatus(status);
        fillFields(slug, e, dto);
        ScholarshipEntry saved = repository.save(e);
        if (publishEvent || ScholarshipStatuses.APPROVED.equalsIgnoreCase(status)) {
            events.publishEvent(new ScholarshipApproved(saved.getId(), slug, saved.getPersonName(), saved.getYear()));
        }
        return mapper.toDto(saved);
    }

    private void fillFields(String slug, ScholarshipEntry e, ScholarshipEntryDTO dto) {
        e.setPersonName(dto.getPersonName().trim());
        e.setAchievement(dto.getAchievement().trim());
        e.setYear(dto.getYear());
        e.setPersonCode(trimToNull(dto.getPersonCode()));
        e.setLevel(normalizeLevel(dto.getLevel()));
        e.setSchoolOrField(trimToNull(dto.getSchoolOrField()));
        e.setMedalNote(trimToNull(dto.getMedalNote()));
        e.setLineageNote(trimToNull(dto.getLineageNote()));
        if (dto.getReviewNote() != null) {
            e.setReviewNote(trimToNull(dto.getReviewNote()));
        }
        linkPerson(slug, e);
    }

    private boolean matchesStatusFilter(ScholarshipEntry e, String statusKey) {
        if ("all".equals(statusKey)) {
            return true;
        }
        if ("awaiting_award".equals(statusKey)) {
            return isAwaitingAward(e);
        }
        return statusKey.equalsIgnoreCase(nullToEmpty(e.getStatus()));
    }

    private boolean isAwaitingAward(ScholarshipEntry e) {
        if (!ScholarshipStatuses.APPROVED.equalsIgnoreCase(nullToEmpty(e.getStatus()))) {
            return false;
        }
        return e.getAwardAmount() == null || e.getAwardAmount().signum() <= 0;
    }

    private Map<String, Object> resolveScholarshipFund(Long treeId) {
        List<DonationCampaign> campaigns = campaignRepository.findByTreeId(treeId);
        DonationCampaign match = campaigns
            .stream()
            .filter(c -> DonationStatuses.PURPOSE_SCHOLARSHIP.equalsIgnoreCase(nullToEmpty(c.getPurpose())))
            .filter(c -> c.getStatus() == null || !DonationStatuses.CAMPAIGN_CLOSED.equalsIgnoreCase(c.getStatus()))
            .findFirst()
            .orElseGet(() ->
                campaigns
                    .stream()
                    .filter(c -> DonationStatuses.PURPOSE_SCHOLARSHIP.equalsIgnoreCase(nullToEmpty(c.getPurpose())))
                    .findFirst()
                    .orElse(null)
            );
        Map<String, Object> fund = new HashMap<>();
        if (match == null) {
            fund.put("id", null);
            fund.put("title", null);
            fund.put("raisedAmount", BigDecimal.ZERO);
            fund.put("goalAmount", null);
            fund.put("status", null);
            fund.put("purpose", null);
            return fund;
        }
        fund.put("id", match.getId());
        fund.put("title", match.getTitle());
        fund.put("raisedAmount", match.getRaisedAmount() != null ? match.getRaisedAmount() : BigDecimal.ZERO);
        fund.put("goalAmount", match.getGoalAmount());
        fund.put("status", match.getStatus());
        fund.put("purpose", match.getPurpose());
        return fund;
    }

    private void linkPerson(String slug, ScholarshipEntry e) {
        if (e.getPersonCode() == null || e.getPersonCode().isBlank()) {
            return;
        }
        personRepository
            .findByTree_SlugAndCodeIgnoreCase(slug, e.getPersonCode().trim())
            .ifPresent(p -> applyPerson(e, p));
    }

    private static void applyPerson(ScholarshipEntry e, Person p) {
        e.setPerson(p);
        if (e.getPersonCode() == null || e.getPersonCode().isBlank()) {
            e.setPersonCode(p.getCode());
        }
        if (e.getPersonName() == null || e.getPersonName().isBlank()) {
            e.setPersonName(p.getFullName());
        }
        if ((e.getLineageNote() == null || e.getLineageNote().isBlank()) && p.getGeneration() != null) {
            e.setLineageNote("Đời " + p.getGeneration());
        }
    }

    private FamilyTree requireTree(String slug) {
        return familyTreeRepository.findBySlug(slug).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cây"));
    }

    private ScholarshipEntry requireEntry(String slug, Long id) {
        ScholarshipEntry e = repository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề cử"));
        if (e.getTree() == null || !slug.equals(e.getTree().getSlug())) {
            throw new IllegalArgumentException("Đề cử không thuộc cây");
        }
        return e;
    }

    private static boolean matchesQuery(ScholarshipEntry e, String query) {
        return nullToEmpty(e.getPersonName()).toLowerCase(Locale.ROOT).contains(query) ||
            nullToEmpty(e.getPersonCode()).toLowerCase(Locale.ROOT).contains(query) ||
            nullToEmpty(e.getAchievement()).toLowerCase(Locale.ROOT).contains(query) ||
            nullToEmpty(e.getSchoolOrField()).toLowerCase(Locale.ROOT).contains(query);
    }

    private static String normalizeLevel(String level) {
        String v = trimToNull(level);
        if (v == null) {
            return null;
        }
        String lower = v.toLowerCase(Locale.ROOT);
        if (!VALID_LEVELS.contains(lower)) {
            return lower;
        }
        return lower;
    }

    private static String trimToNull(String s) {
        if (s == null) {
            return null;
        }
        String t = s.trim();
        return t.isEmpty() ? null : t;
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
