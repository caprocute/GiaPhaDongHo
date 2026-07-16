package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.DonationCampaign} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DonationCampaignDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    private BigDecimal goalAmount;

    private BigDecimal raisedAmount;

    @Lob
    private String vietqrPayload;

    private String status;

    private FamilyTreeDTO tree;

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

    public BigDecimal getGoalAmount() {
        return goalAmount;
    }

    public void setGoalAmount(BigDecimal goalAmount) {
        this.goalAmount = goalAmount;
    }

    public BigDecimal getRaisedAmount() {
        return raisedAmount;
    }

    public void setRaisedAmount(BigDecimal raisedAmount) {
        this.raisedAmount = raisedAmount;
    }

    public String getVietqrPayload() {
        return vietqrPayload;
    }

    public void setVietqrPayload(String vietqrPayload) {
        this.vietqrPayload = vietqrPayload;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public FamilyTreeDTO getTree() {
        return tree;
    }

    public void setTree(FamilyTreeDTO tree) {
        this.tree = tree;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DonationCampaignDTO)) {
            return false;
        }

        DonationCampaignDTO donationCampaignDTO = (DonationCampaignDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, donationCampaignDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DonationCampaignDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", goalAmount=" + getGoalAmount() +
            ", raisedAmount=" + getRaisedAmount() +
            ", vietqrPayload='" + getVietqrPayload() + "'" +
            ", status='" + getStatus() + "'" +
            ", tree=" + getTree() +
            "}";
    }
}
