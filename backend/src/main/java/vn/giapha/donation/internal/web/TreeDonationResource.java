package vn.giapha.donation.internal.web;

import jakarta.validation.Valid;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.donation.internal.DonationService;
import vn.giapha.service.dto.DonationCampaignDTO;
import vn.giapha.service.dto.DonationContributionDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * Quỹ công đức theo cây — TK-08 / F4.
 */
@RestController
@RequestMapping("/api/v1/trees/{slug}")
public class TreeDonationResource {

    private static final Logger LOG = LoggerFactory.getLogger(TreeDonationResource.class);

    private final DonationService donationService;

    public TreeDonationResource(DonationService donationService) {
        this.donationService = donationService;
    }

    @GetMapping("/donation-campaigns")
    public List<Map<String, Object>> listPublic(
        @PathVariable String slug,
        @RequestParam(name = "status", required = false) String status
    ) {
        LOG.debug("GET donation-campaigns tree={}", slug);
        return donationService.listCampaigns(slug, status, true);
    }

    @GetMapping("/donation-campaigns/admin")
    @RequiresPermission("donation:campaign:read")
    public List<Map<String, Object>> listAdmin(
        @PathVariable String slug,
        @RequestParam(name = "status", required = false) String status
    ) {
        return donationService.listCampaigns(slug, status, false);
    }

    @GetMapping("/donation-campaigns/{id}")
    public Map<String, Object> getOne(
        @PathVariable String slug,
        @PathVariable Long id,
        @RequestParam(name = "amount", required = false) BigDecimal amount
    ) {
        try {
            return donationService.getCampaign(slug, id, amount, true);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "donationCampaign", "notfound");
        }
    }

    @PostMapping("/donation-campaigns")
    @RequiresPermission("donation:campaign:write")
    public DonationCampaignDTO create(@PathVariable String slug, @Valid @RequestBody DonationCampaignDTO body) {
        body.setId(null);
        try {
            return donationService.upsertCampaign(slug, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "donationCampaign", "invalid");
        }
    }

    @PutMapping("/donation-campaigns/{id}")
    @RequiresPermission("donation:campaign:write")
    public DonationCampaignDTO update(
        @PathVariable String slug,
        @PathVariable Long id,
        @Valid @RequestBody DonationCampaignDTO body
    ) {
        body.setId(id);
        try {
            return donationService.upsertCampaign(slug, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "donationCampaign", "invalid");
        }
    }

    /** Sao kê công khai — chỉ đóng góp đã xác nhận (không lộ pending). */
    @GetMapping("/donation-campaigns/{id}/contributions")
    public List<DonationContributionDTO> listByCampaignPublic(@PathVariable String slug, @PathVariable Long id) {
        try {
            return donationService.listContributions(slug, id, true);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "donationContribution", "invalid");
        }
    }

    /** Sao kê nội bộ (kèm pending) — thủ quỹ / genealogy admin. */
    @GetMapping("/donation-campaigns/{id}/contributions/admin")
    @RequiresPermission("donation:contribution:read")
    public List<DonationContributionDTO> listByCampaignAdmin(@PathVariable String slug, @PathVariable Long id) {
        try {
            return donationService.listContributions(slug, id, false);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "donationContribution", "invalid");
        }
    }

    @GetMapping("/honor-board")
    public List<DonationContributionDTO> honorBoard(@PathVariable String slug) {
        return donationService.listContributions(slug, null, true);
    }

    @PostMapping("/donation-campaigns/{id}/contributions")
    @RequiresPermission("donation:contribution:write")
    public DonationContributionDTO record(
        @PathVariable String slug,
        @PathVariable Long id,
        @Valid @RequestBody DonationContributionDTO body,
        @RequestParam(name = "confirm", defaultValue = "true") boolean confirm
    ) {
        try {
            return donationService.recordContribution(slug, id, body, confirm);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "donationContribution", "invalid");
        }
    }

    @PostMapping("/donation-contributions/{id}/confirm")
    @RequiresPermission("donation:contribution:write")
    public DonationContributionDTO confirm(@PathVariable String slug, @PathVariable Long id) {
        try {
            return donationService.confirmContribution(slug, id);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "donationContribution", "invalid");
        }
    }

    @GetMapping(value = "/donation-contributions/{id}/receipt", produces = MediaType.TEXT_HTML_VALUE)
    @RequiresPermission("donation:contribution:read")
    public ResponseEntity<String> receipt(@PathVariable String slug, @PathVariable Long id) {
        try {
            return ResponseEntity.ok().contentType(MediaType.TEXT_HTML).body(donationService.receiptHtml(slug, id));
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "donationContribution", "invalid");
        }
    }
}
