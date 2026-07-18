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
import vn.giapha.domain.ScholarshipAward;
import vn.giapha.domain.ScholarshipAwardRound;
import vn.giapha.domain.ScholarshipEntry;
import vn.giapha.donation.api.DonationStatuses;
import vn.giapha.repository.ClanEventRepository;
import vn.giapha.repository.DonationCampaignRepository;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.repository.PersonRepository;
import vn.giapha.repository.ScholarshipAwardRepository;
import vn.giapha.repository.ScholarshipAwardRoundRepository;
import vn.giapha.repository.ScholarshipEntryRepository;
import vn.giapha.scholarship.api.ScholarshipAwardRoundDTO;
import vn.giapha.scholarship.api.ScholarshipAwardRoundRequest;
import vn.giapha.scholarship.api.ScholarshipGrantAwardsRequest;
import vn.giapha.scholarship.api.ScholarshipReviewRequest;
import vn.giapha.scholarship.api.ScholarshipStatuses;
import vn.giapha.scholarship.events.ScholarshipApproved;
import vn.giapha.security.SecurityUtils;
import vn.giapha.service.dto.ScholarshipEntryDTO;
import vn.giapha.service.mapper.ScholarshipEntryMapper;

@Service
@Transactional
public class ScholarshipService {

    private static final Set<String> ADVANCED_LEVELS = Set.of("phd", "master");
    private static final Set<String> VALID_LEVELS = Set.of("phd", "master", "university", "highschool");
    private static final Set<String> ROUND_STATUSES = Set.of(
        ScholarshipStatuses.ROUND_DRAFT,
        ScholarshipStatuses.ROUND_OPEN,
        ScholarshipStatuses.ROUND_CLOSED
    );

    private final ScholarshipEntryRepository repository;
    private final ScholarshipAwardRoundRepository roundRepository;
    private final ScholarshipAwardRepository awardRepository;
    private final FamilyTreeRepository familyTreeRepository;
    private final PersonRepository personRepository;
    private final DonationCampaignRepository campaignRepository;
    private final ClanEventRepository clanEventRepository;
    private final ScholarshipEntryMapper mapper;
    private final ApplicationEventPublisher events;

    public ScholarshipService(
        ScholarshipEntryRepository repository,
        ScholarshipAwardRoundRepository roundRepository,
        ScholarshipAwardRepository awardRepository,
        FamilyTreeRepository familyTreeRepository,
        PersonRepository personRepository,
        DonationCampaignRepository campaignRepository,
        ClanEventRepository clanEventRepository,
        ScholarshipEntryMapper mapper,
        ApplicationEventPublisher events
    ) {
        this.repository = repository;
        this.roundRepository = roundRepository;
        this.awardRepository = awardRepository;
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

        BigDecimal awardedFromAwards = awardRepository.sumAmountByTreeSlug(slug);
        BigDecimal awardedTotal = awardedFromAwards != null ? awardedFromAwards : BigDecimal.ZERO;
        if (awardedTotal.signum() == 0) {
            awardedTotal = all
                .stream()
                .map(ScholarshipEntry::getAwardAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        }

        ScholarshipAwardRound openRound = findLatestOpenRound(slug);
        Map<String, Object> out = new HashMap<>();
        out.put("pendingCount", pending);
        out.put("approvedCount", approved);
        out.put("rejectedCount", rejected);
        out.put("awaitingAwardCount", awaitingAward);
        out.put("totalCount", all.size());
        out.put("advancedDegreeCount", advanced);
        out.put("awardedTotal", awardedTotal);

        if (openRound == null) {
            out.put("awardRoundId", null);
            out.put("awardRoundLabel", null);
            out.put("awardRoundStatus", null);
            out.put("awardRoundDefaultAmount", null);
            out.put("awardRoundOpenFrom", null);
            out.put("awardRoundOpenTo", null);
            out.put("fundCampaignId", null);
            out.put("fundTitle", null);
            out.put("fundRaisedAmount", BigDecimal.ZERO);
            out.put("fundGoalAmount", null);
            out.put("fundRemaining", BigDecimal.ZERO);
            out.put("fundStatus", null);
            return out;
        }

        DonationCampaign fund = openRound.getFundCampaign();
        BigDecimal fundRaised = fund != null && fund.getRaisedAmount() != null ? fund.getRaisedAmount() : BigDecimal.ZERO;
        BigDecimal spentOnFund = BigDecimal.ZERO;
        if (fund != null && fund.getId() != null) {
            BigDecimal spent = awardRepository.sumAmountByFundCampaignId(fund.getId());
            spentOnFund = spent != null ? spent : BigDecimal.ZERO;
        }
        BigDecimal fundRemaining = fundRaised.subtract(spentOnFund);
        if (fundRemaining.signum() < 0) {
            fundRemaining = BigDecimal.ZERO;
        }

        out.put("awardRoundId", openRound.getId());
        out.put("awardRoundLabel", openRound.getTitle());
        out.put("awardRoundStatus", openRound.getStatus());
        out.put("awardRoundDefaultAmount", openRound.getDefaultAmount());
        out.put("awardRoundOpenFrom", openRound.getOpenFrom());
        out.put("awardRoundOpenTo", openRound.getOpenTo());
        out.put("fundCampaignId", fund != null ? fund.getId() : null);
        out.put("fundTitle", fund != null ? fund.getTitle() : null);
        out.put("fundRaisedAmount", fundRaised);
        out.put("fundGoalAmount", fund != null ? fund.getGoalAmount() : null);
        out.put("fundRemaining", fundRemaining);
        out.put("fundStatus", fund != null ? fund.getStatus() : null);
        return out;
    }

    @Transactional(readOnly = true)
    public List<ScholarshipAwardRoundDTO> listRounds(String slug) {
        return roundRepository.findByTreeSlug(slug).stream().map(this::toRoundDto).toList();
    }

    public ScholarshipAwardRoundDTO createRound(String slug, ScholarshipAwardRoundRequest body) {
        FamilyTree tree = requireTree(slug);
        if (body == null || trimToNull(body.getTitle()) == null) {
            throw new IllegalArgumentException("Nhập tên đợt trao học bổng");
        }
        if (body.getFundCampaignId() == null) {
            throw new IllegalArgumentException("Chọn quỹ khuyến học làm nguồn tiền cho đợt");
        }
        ScholarshipAwardRound round = new ScholarshipAwardRound();
        round.setTree(tree);
        round.setCreatedAt(Instant.now());
        round.setCreatedBy(currentUser());
        applyRoundBody(slug, round, body, true);
        return toRoundDto(roundRepository.save(round));
    }

    public ScholarshipAwardRoundDTO updateRound(String slug, Long id, ScholarshipAwardRoundRequest body) {
        ScholarshipAwardRound round = requireRound(slug, id);
        if (body == null) {
            throw new IllegalArgumentException("Thiếu dữ liệu đợt trao");
        }
        applyRoundBody(slug, round, body, false);
        return toRoundDto(roundRepository.save(round));
    }

    public void deleteRound(String slug, Long id) {
        ScholarshipAwardRound round = requireRound(slug, id);
        if (awardRepository.countByRoundId(round.getId()) > 0) {
            throw new IllegalArgumentException("Không xóa đợt đã có suất trao — hãy đóng đợt thay vì xóa");
        }
        roundRepository.delete(round);
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
        if (awardRepository.existsByEntry_Id(id) || (e.getAwardAmount() != null && e.getAwardAmount().signum() > 0)) {
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
     * Trao suất trong đợt đang mở: tạo ScholarshipAward + denormalize awardAmount trên entry.
     */
    public Map<String, Object> grantAwards(String slug, Long roundId, ScholarshipGrantAwardsRequest body) {
        ScholarshipAwardRound round = requireRound(slug, roundId);
        if (!ScholarshipStatuses.ROUND_OPEN.equalsIgnoreCase(nullToEmpty(round.getStatus()))) {
            throw new IllegalArgumentException("Chỉ trao suất khi đợt đang mở");
        }
        if (round.getFundCampaign() == null) {
            throw new IllegalArgumentException("Đợt chưa gắn quỹ khuyến học — sửa đợt và chọn quỹ");
        }
        if (body == null || body.getEntryIds() == null || body.getEntryIds().isEmpty()) {
            throw new IllegalArgumentException("Chọn ít nhất một hồ sơ đã vào bảng vàng để trao học bổng");
        }
        BigDecimal amount = body.getAmount();
        if (amount == null || amount.signum() <= 0) {
            amount = round.getDefaultAmount();
        }
        if (amount == null || amount.signum() <= 0) {
            throw new IllegalArgumentException("Nhập số tiền mỗi suất học bổng");
        }
        amount = amount.setScale(2, RoundingMode.HALF_UP);
        String note = trimToNull(body.getNote());
        String actor = currentUser();
        Instant now = Instant.now();
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
            if (awardRepository.existsByRound_IdAndEntry_Id(round.getId(), e.getId())) {
                skipped++;
                continue;
            }
            if (awardRepository.existsByEntry_Id(e.getId()) || (e.getAwardAmount() != null && e.getAwardAmount().signum() > 0)) {
                skipped++;
                continue;
            }
            ScholarshipAward award = new ScholarshipAward();
            award.setRound(round);
            award.setEntry(e);
            award.setAmount(amount);
            award.setAwardedAt(now);
            award.setAwardedBy(actor);
            award.setNote(note);
            awardRepository.save(award);
            e.setAwardAmount(amount);
            e.setAwardedAt(now);
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

        Long honorEventId = round.getHonorEvent() != null ? round.getHonorEvent().getId() : null;
        String honorEventTitle = round.getHonorEvent() != null ? round.getHonorEvent().getTitle() : null;
        if (body.isCreateHonorEvent() && honorEventId == null) {
            honorEventTitle = trimToNull(body.getHonorEventTitle());
            if (honorEventTitle == null) {
                honorEventTitle = "Lễ vinh danh — " + round.getTitle();
            }
            ClanEvent event = new ClanEvent();
            event.setTree(requireTree(slug));
            event.setTitle(honorEventTitle);
            event.setStartSolar(LocalDate.now(ZoneOffset.UTC).plusMonths(1).atStartOfDay().toInstant(ZoneOffset.UTC));
            event.setLocation(trimToNull(body.getHonorEventLocation()));
            event.setChecklistJson(
                "{\"items\":[{\"label\":\"Công bố bảng vàng\",\"done\":true},{\"label\":\"Trao học bổng\",\"done\":true}]}"
            );
            ClanEvent savedEvent = clanEventRepository.save(event);
            honorEventId = savedEvent.getId();
            round.setHonorEvent(savedEvent);
            roundRepository.save(round);
        }

        Map<String, Object> out = new HashMap<>();
        out.put("awardedCount", awarded);
        out.put("skippedCount", skipped);
        out.put("amountPerSlot", amount);
        out.put("roundId", round.getId());
        out.put("roundTitle", round.getTitle());
        out.put("honorEventId", honorEventId);
        out.put("honorEventTitle", honorEventTitle);
        return out;
    }

    private void applyRoundBody(String slug, ScholarshipAwardRound round, ScholarshipAwardRoundRequest body, boolean creating) {
        if (trimToNull(body.getTitle()) != null) {
            round.setTitle(body.getTitle().trim());
        } else if (creating) {
            throw new IllegalArgumentException("Nhập tên đợt trao học bổng");
        }
        if (body.getCode() != null) {
            round.setCode(trimToNull(body.getCode()));
        }
        if (body.getOpenFrom() != null || creating) {
            round.setOpenFrom(body.getOpenFrom());
        }
        if (body.getOpenTo() != null || creating) {
            round.setOpenTo(body.getOpenTo());
        }
        if (body.getDefaultAmount() != null) {
            if (body.getDefaultAmount().signum() < 0) {
                throw new IllegalArgumentException("Số tiền gợi ý không hợp lệ");
            }
            round.setDefaultAmount(body.getDefaultAmount().setScale(2, RoundingMode.HALF_UP));
        }
        if (body.getNote() != null) {
            round.setNote(trimToNull(body.getNote()));
        }
        if (body.getFundCampaignId() != null) {
            round.setFundCampaign(requireScholarshipFund(slug, body.getFundCampaignId()));
        } else if (creating) {
            throw new IllegalArgumentException("Chọn quỹ khuyến học làm nguồn tiền cho đợt");
        }
        if (body.getHonorEventId() != null) {
            ClanEvent event = clanEventRepository
                .findById(body.getHonorEventId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sự kiện vinh danh"));
            if (event.getTree() == null || !slug.equals(event.getTree().getSlug())) {
                throw new IllegalArgumentException("Sự kiện không thuộc cây này");
            }
            round.setHonorEvent(event);
        }
        String status = normalizeRoundStatus(body.getStatus());
        if (status != null) {
            String prev = nullToEmpty(round.getStatus());
            round.setStatus(status);
            if (ScholarshipStatuses.ROUND_CLOSED.equals(status) && !ScholarshipStatuses.ROUND_CLOSED.equalsIgnoreCase(prev)) {
                round.setClosedAt(Instant.now());
                round.setClosedBy(currentUser());
            }
            if (!ScholarshipStatuses.ROUND_CLOSED.equals(status) && ScholarshipStatuses.ROUND_CLOSED.equalsIgnoreCase(prev)) {
                round.setClosedAt(null);
                round.setClosedBy(null);
            }
        } else if (creating) {
            round.setStatus(ScholarshipStatuses.ROUND_OPEN);
        }
    }

    private DonationCampaign requireScholarshipFund(String slug, Long campaignId) {
        DonationCampaign c = campaignRepository
            .findOneWithEagerRelationships(campaignId)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy quỹ"));
        if (c.getTree() == null || !slug.equals(c.getTree().getSlug())) {
            throw new IllegalArgumentException("Quỹ không thuộc cây này");
        }
        if (!DonationStatuses.PURPOSE_SCHOLARSHIP.equalsIgnoreCase(nullToEmpty(c.getPurpose()))) {
            throw new IllegalArgumentException("Chỉ chọn chiến dịch có mục đích «Quỹ khuyến học»");
        }
        return c;
    }

    private ScholarshipAwardRound findLatestOpenRound(String slug) {
        List<ScholarshipAwardRound> open = roundRepository.findByTreeSlugAndStatus(slug, ScholarshipStatuses.ROUND_OPEN);
        return open.isEmpty() ? null : open.get(0);
    }

    private ScholarshipAwardRoundDTO toRoundDto(ScholarshipAwardRound r) {
        ScholarshipAwardRoundDTO dto = new ScholarshipAwardRoundDTO();
        dto.setId(r.getId());
        dto.setTitle(r.getTitle());
        dto.setCode(r.getCode());
        dto.setOpenFrom(r.getOpenFrom());
        dto.setOpenTo(r.getOpenTo());
        dto.setDefaultAmount(r.getDefaultAmount());
        dto.setStatus(r.getStatus());
        dto.setNote(r.getNote());
        dto.setCreatedAt(r.getCreatedAt());
        dto.setClosedAt(r.getClosedAt());
        dto.setCreatedBy(r.getCreatedBy());
        dto.setClosedBy(r.getClosedBy());
        if (r.getFundCampaign() != null) {
            dto.setFundCampaignId(r.getFundCampaign().getId());
            dto.setFundCampaignTitle(r.getFundCampaign().getTitle());
        }
        if (r.getHonorEvent() != null) {
            dto.setHonorEventId(r.getHonorEvent().getId());
            dto.setHonorEventTitle(r.getHonorEvent().getTitle());
        }
        if (r.getId() != null) {
            dto.setAwardCount(awardRepository.countByRoundId(r.getId()));
        }
        return dto;
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
        if (e.getId() != null && awardRepository.existsByEntry_Id(e.getId())) {
            return false;
        }
        return e.getAwardAmount() == null || e.getAwardAmount().signum() <= 0;
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

    private ScholarshipAwardRound requireRound(String slug, Long id) {
        ScholarshipAwardRound r = roundRepository
            .findOneWithRelations(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đợt trao"));
        if (r.getTree() == null || !slug.equals(r.getTree().getSlug())) {
            throw new IllegalArgumentException("Đợt trao không thuộc cây");
        }
        return r;
    }

    private static String normalizeRoundStatus(String status) {
        String v = trimToNull(status);
        if (v == null) {
            return null;
        }
        String lower = v.toLowerCase(Locale.ROOT);
        if (!ROUND_STATUSES.contains(lower)) {
            throw new IllegalArgumentException("Trạng thái đợt không hợp lệ (nháp / đang mở / đã đóng)");
        }
        return lower;
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

    private static String currentUser() {
        return SecurityUtils.getCurrentUserLogin().orElse("system");
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
