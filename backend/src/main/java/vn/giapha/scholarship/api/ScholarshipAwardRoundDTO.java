package vn.giapha.scholarship.api;

import java.math.BigDecimal;
import java.time.Instant;

/** Đợt trao học bổng — master data (SRS-12c). */
public class ScholarshipAwardRoundDTO {

    private Long id;
    private String title;
    private String code;
    private Long fundCampaignId;
    private String fundCampaignTitle;
    private Instant openFrom;
    private Instant openTo;
    private BigDecimal defaultAmount;
    private String status;
    private String note;
    private Long honorEventId;
    private String honorEventTitle;
    private Instant createdAt;
    private Instant closedAt;
    private String createdBy;
    private String closedBy;
    private Long awardCount;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public Long getFundCampaignId() {
        return fundCampaignId;
    }

    public void setFundCampaignId(Long fundCampaignId) {
        this.fundCampaignId = fundCampaignId;
    }

    public String getFundCampaignTitle() {
        return fundCampaignTitle;
    }

    public void setFundCampaignTitle(String fundCampaignTitle) {
        this.fundCampaignTitle = fundCampaignTitle;
    }

    public Instant getOpenFrom() {
        return openFrom;
    }

    public void setOpenFrom(Instant openFrom) {
        this.openFrom = openFrom;
    }

    public Instant getOpenTo() {
        return openTo;
    }

    public void setOpenTo(Instant openTo) {
        this.openTo = openTo;
    }

    public BigDecimal getDefaultAmount() {
        return defaultAmount;
    }

    public void setDefaultAmount(BigDecimal defaultAmount) {
        this.defaultAmount = defaultAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Long getHonorEventId() {
        return honorEventId;
    }

    public void setHonorEventId(Long honorEventId) {
        this.honorEventId = honorEventId;
    }

    public String getHonorEventTitle() {
        return honorEventTitle;
    }

    public void setHonorEventTitle(String honorEventTitle) {
        this.honorEventTitle = honorEventTitle;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getClosedAt() {
        return closedAt;
    }

    public void setClosedAt(Instant closedAt) {
        this.closedAt = closedAt;
    }

    public String getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(String createdBy) {
        this.createdBy = createdBy;
    }

    public String getClosedBy() {
        return closedBy;
    }

    public void setClosedBy(String closedBy) {
        this.closedBy = closedBy;
    }

    public Long getAwardCount() {
        return awardCount;
    }

    public void setAwardCount(Long awardCount) {
        this.awardCount = awardCount;
    }
}
