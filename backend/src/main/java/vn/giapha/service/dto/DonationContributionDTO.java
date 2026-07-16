package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.DonationContribution} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DonationContributionDTO implements Serializable {

    private Long id;

    @NotNull
    private String donorName;

    private BigDecimal amount;

    private String kind;

    @Lob
    private String note;

    private Instant createdAt;

    private DonationCampaignDTO campaign;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDonorName() {
        return donorName;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
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

    public DonationCampaignDTO getCampaign() {
        return campaign;
    }

    public void setCampaign(DonationCampaignDTO campaign) {
        this.campaign = campaign;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DonationContributionDTO)) {
            return false;
        }

        DonationContributionDTO donationContributionDTO = (DonationContributionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, donationContributionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DonationContributionDTO{" +
            "id=" + getId() +
            ", donorName='" + getDonorName() + "'" +
            ", amount=" + getAmount() +
            ", kind='" + getKind() + "'" +
            ", note='" + getNote() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", campaign=" + getCampaign() +
            "}";
    }
}
