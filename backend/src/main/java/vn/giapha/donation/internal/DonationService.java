package vn.giapha.donation.internal;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.DonationCampaign;
import vn.giapha.domain.DonationContribution;
import vn.giapha.domain.FamilyTree;
import vn.giapha.donation.api.DonationStatuses;
import vn.giapha.donation.events.ContributionReceived;
import vn.giapha.repository.DonationCampaignRepository;
import vn.giapha.repository.DonationContributionRepository;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.service.dto.DonationCampaignDTO;
import vn.giapha.service.dto.DonationContributionDTO;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.mapper.DonationCampaignMapper;
import vn.giapha.service.mapper.DonationContributionMapper;
import vn.giapha.service.mapper.FamilyTreeMapper;

/**
 * Chiến dịch + đóng góp + sao kê / bảng vàng (R2.2 / F4).
 */
@Service
@Transactional
public class DonationService {

    private static final Logger LOG = LoggerFactory.getLogger(DonationService.class);

    private final DonationCampaignRepository campaignRepository;
    private final DonationContributionRepository contributionRepository;
    private final FamilyTreeRepository familyTreeRepository;
    private final DonationCampaignMapper campaignMapper;
    private final DonationContributionMapper contributionMapper;
    private final FamilyTreeMapper familyTreeMapper;
    private final VietQrBuilder vietQrBuilder;
    private final ApplicationEventPublisher events;

    public DonationService(
        DonationCampaignRepository campaignRepository,
        DonationContributionRepository contributionRepository,
        FamilyTreeRepository familyTreeRepository,
        DonationCampaignMapper campaignMapper,
        DonationContributionMapper contributionMapper,
        FamilyTreeMapper familyTreeMapper,
        VietQrBuilder vietQrBuilder,
        ApplicationEventPublisher events
    ) {
        this.campaignRepository = campaignRepository;
        this.contributionRepository = contributionRepository;
        this.familyTreeRepository = familyTreeRepository;
        this.campaignMapper = campaignMapper;
        this.contributionMapper = contributionMapper;
        this.familyTreeMapper = familyTreeMapper;
        this.vietQrBuilder = vietQrBuilder;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listCampaigns(String treeSlug, String status, boolean publicOnly) {
        FamilyTree tree = requireTree(treeSlug);
        String st = status == null || status.isBlank() ? null : status.trim();
        List<DonationCampaign> rows = campaignRepository.findByTreeIdAndOptionalStatus(tree.getId(), st);
        return rows
            .stream()
            .filter(c -> !publicOnly || isPublicCampaign(c))
            .map(c -> toCampaignView(c, null))
            .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getCampaign(String treeSlug, Long id, BigDecimal qrAmount, boolean publicOnly) {
        DonationCampaign c = requireCampaign(treeSlug, id);
        if (publicOnly && !isPublicCampaign(c)) {
            throw new IllegalArgumentException("Chiến dịch chưa mở");
        }
        return toCampaignView(c, qrAmount);
    }

    public DonationCampaignDTO upsertCampaign(String treeSlug, DonationCampaignDTO dto) {
        FamilyTree tree = requireTree(treeSlug);
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("title bắt buộc");
        }
        dto.setId(dto.getId());
        if (dto.getStatus() == null || dto.getStatus().isBlank()) {
            dto.setStatus(DonationStatuses.CAMPAIGN_OPEN);
        }
        if (dto.getRaisedAmount() == null) {
            dto.setRaisedAmount(BigDecimal.ZERO);
        }
        String purpose = DonationStatuses.normalizePurpose(dto.getPurpose());
        dto.setPurpose(purpose);
        FamilyTreeDTO treeDto = familyTreeMapper.toDto(tree);
        dto.setTree(treeDto);

        DonationCampaign entity;
        if (dto.getId() != null) {
            entity = requireCampaign(treeSlug, dto.getId());
            entity.setTitle(dto.getTitle().trim());
            entity.setGoalAmount(dto.getGoalAmount());
            entity.setVietqrPayload(dto.getVietqrPayload());
            entity.setStatus(dto.getStatus().trim().toLowerCase(Locale.ROOT));
            entity.setPurpose(purpose);
            // raisedAmount chỉ cập nhật qua record/confirm contribution — không nhận từ client
        } else {
            entity = campaignMapper.toEntity(dto);
            entity.setId(null);
            entity.setTree(tree);
            entity.setTitle(dto.getTitle().trim());
            entity.setRaisedAmount(BigDecimal.ZERO);
            entity.setPurpose(purpose);
        }
        return campaignMapper.toDto(campaignRepository.save(entity));
    }

    public DonationContributionDTO recordContribution(String treeSlug, Long campaignId, DonationContributionDTO dto, boolean confirm) {
        DonationCampaign campaign = requireCampaign(treeSlug, campaignId);
        if (dto.getDonorName() == null || dto.getDonorName().isBlank()) {
            throw new IllegalArgumentException("donorName bắt buộc");
        }
        String kind = dto.getKind() == null || dto.getKind().isBlank()
            ? (confirm ? DonationStatuses.KIND_MONEY : DonationStatuses.KIND_PENDING)
            : dto.getKind().trim().toLowerCase(Locale.ROOT);

        DonationContribution entity = contributionMapper.toEntity(dto);
        entity.setId(null);
        entity.setCampaign(campaign);
        entity.setDonorName(dto.getDonorName().trim());
        entity.setKind(kind);
        entity.setCreatedAt(Instant.now());
        if (entity.getAmount() == null) {
            entity.setAmount(BigDecimal.ZERO);
        }
        entity = contributionRepository.save(entity);

        if (confirm || !DonationStatuses.KIND_PENDING.equals(kind)) {
            applyRaised(campaign, entity.getAmount());
            events.publishEvent(
                new ContributionReceived(entity.getId(), campaign.getId(), entity.getDonorName(), entity.getAmount(), entity.getKind())
            );
        }
        LOG.info("donation contribution id={} campaign={} kind={}", entity.getId(), campaignId, kind);
        return contributionMapper.toDto(entity);
    }

    public DonationContributionDTO confirmContribution(String treeSlug, Long contributionId) {
        DonationContribution c = requireContribution(treeSlug, contributionId);
        if (!DonationStatuses.KIND_PENDING.equalsIgnoreCase(c.getKind())) {
            return contributionMapper.toDto(c);
        }
        c.setKind(DonationStatuses.KIND_MONEY);
        c = contributionRepository.save(c);
        applyRaised(c.getCampaign(), c.getAmount());
        events.publishEvent(
            new ContributionReceived(c.getId(), c.getCampaign().getId(), c.getDonorName(), c.getAmount(), c.getKind())
        );
        return contributionMapper.toDto(c);
    }

    @Transactional(readOnly = true)
    public List<DonationContributionDTO> listContributions(String treeSlug, Long campaignId, boolean honorOnly) {
        requireTree(treeSlug);
        List<DonationContribution> rows;
        if (campaignId != null) {
            requireCampaign(treeSlug, campaignId);
            rows = contributionRepository.findByCampaignIdOrderByCreatedAtDesc(campaignId);
        } else {
            rows = contributionRepository.findByTreeSlugOrderByCreatedAtDesc(treeSlug);
        }
        return rows
            .stream()
            .filter(c -> !honorOnly || isHonor(c))
            .map(contributionMapper::toDto)
            .toList();
    }

    @Transactional(readOnly = true)
    public String receiptHtml(String treeSlug, Long contributionId) {
        DonationContribution c = requireContribution(treeSlug, contributionId);
        DonationCampaign camp = c.getCampaign();
        String amount = c.getAmount() == null ? "0" : c.getAmount().toPlainString();
        return """
            <!DOCTYPE html><html lang="vi"><head><meta charset="utf-8"/><title>Biên nhận #%d</title>
            <style>body{font-family:serif;max-width:32rem;margin:2rem auto;color:#222}
            h1{font-size:1.25rem} .muted{color:#666} table{width:100%%;border-collapse:collapse}
            td{padding:.35rem 0;border-bottom:1px solid #ddd}</style></head><body>
            <h1>Biên nhận công đức</h1>
            <p class="muted">Mã #%d · %s</p>
            <table>
            <tr><td>Chiến dịch</td><td>%s</td></tr>
            <tr><td>Người công đức</td><td>%s</td></tr>
            <tr><td>Số tiền / giá trị</td><td>%s</td></tr>
            <tr><td>Loại</td><td>%s</td></tr>
            <tr><td>Ghi chú</td><td>%s</td></tr>
            </table>
            <p class="muted">In trang này để lưu biên nhận (R2.2).</p>
            <script>window.print&&setTimeout(()=>window.print(),400)</script>
            </body></html>
            """.formatted(
            c.getId(),
            c.getId(),
            c.getCreatedAt() == null ? "" : c.getCreatedAt().toString(),
            escape(camp != null ? camp.getTitle() : ""),
            escape(c.getDonorName()),
            escape(amount),
            escape(c.getKind()),
            escape(c.getNote() == null ? "" : c.getNote())
        );
    }

    private void applyRaised(DonationCampaign campaign, BigDecimal amount) {
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            return;
        }
        BigDecimal raised = campaign.getRaisedAmount() == null ? BigDecimal.ZERO : campaign.getRaisedAmount();
        campaign.setRaisedAmount(raised.add(amount));
        campaignRepository.save(campaign);
    }

    private Map<String, Object> toCampaignView(DonationCampaign c, BigDecimal qrAmount) {
        DonationCampaignDTO dto = campaignMapper.toDto(c);
        String transfer = "CONG DUC " + (c.getId() == null ? "" : c.getId());
        String qr = vietQrBuilder.buildImageUrl(c.getVietqrPayload(), qrAmount, transfer);
        Map<String, Object> m = new HashMap<>();
        m.put("campaign", dto);
        m.put("qrImageUrl", qr);
        m.put("transferContent", transfer);
        return m;
    }

    private static boolean isPublicCampaign(DonationCampaign c) {
        String s = c.getStatus() == null ? "" : c.getStatus().toLowerCase(Locale.ROOT);
        return DonationStatuses.CAMPAIGN_OPEN.equals(s) || "active".equals(s) || "published".equals(s);
    }

    private static boolean isHonor(DonationContribution c) {
        return c.getKind() != null && !DonationStatuses.KIND_PENDING.equalsIgnoreCase(c.getKind());
    }

    private FamilyTree requireTree(String slug) {
        return familyTreeRepository
            .findBySlug(slug)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cây slug=" + slug));
    }

    private DonationCampaign requireCampaign(String treeSlug, Long id) {
        DonationCampaign c = campaignRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy chiến dịch id=" + id));
        if (c.getTree() == null || c.getTree().getSlug() == null || !c.getTree().getSlug().equals(treeSlug)) {
            throw new IllegalArgumentException("Chiến dịch không thuộc cây " + treeSlug);
        }
        return c;
    }

    private DonationContribution requireContribution(String treeSlug, Long id) {
        DonationContribution c = contributionRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đóng góp id=" + id));
        if (c.getCampaign() == null || c.getCampaign().getId() == null) {
            throw new IllegalArgumentException("Đóng góp thiếu chiến dịch");
        }
        DonationCampaign camp = requireCampaign(treeSlug, c.getCampaign().getId());
        c.setCampaign(camp);
        return c;
    }

    private static String escape(String s) {
        if (s == null) {
            return "";
        }
        return s
            .replace("&", "&amp;")
            .replace("<", "&lt;")
            .replace(">", "&gt;")
            .replace("\"", "&quot;");
    }
}
