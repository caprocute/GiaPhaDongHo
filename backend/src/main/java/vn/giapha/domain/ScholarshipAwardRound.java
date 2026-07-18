package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Đợt trao học bổng — master data (SRS-12c).
 */
@Entity
@Table(name = "scholarship_award_round")
public class ScholarshipAwardRound implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "title", nullable = false)
    private String title;

    @Column(name = "code")
    private String code;

    @Column(name = "open_from")
    private Instant openFrom;

    @Column(name = "open_to")
    private Instant openTo;

    @Column(name = "default_amount", precision = 21, scale = 2)
    private BigDecimal defaultAmount;

    @Column(name = "status")
    private String status;

    @Column(name = "note")
    private String note;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "closed_at")
    private Instant closedAt;

    @Column(name = "created_by")
    private String createdBy;

    @Column(name = "closed_by")
    private String closedBy;

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "fund_campaign_id")
    private DonationCampaign fundCampaign;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "honor_event_id")
    private ClanEvent honorEvent;

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

    public FamilyTree getTree() {
        return tree;
    }

    public void setTree(FamilyTree tree) {
        this.tree = tree;
    }

    public DonationCampaign getFundCampaign() {
        return fundCampaign;
    }

    public void setFundCampaign(DonationCampaign fundCampaign) {
        this.fundCampaign = fundCampaign;
    }

    public ClanEvent getHonorEvent() {
        return honorEvent;
    }

    public void setHonorEvent(ClanEvent honorEvent) {
        this.honorEvent = honorEvent;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ScholarshipAwardRound)) return false;
        return id != null && id.equals(((ScholarshipAwardRound) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
