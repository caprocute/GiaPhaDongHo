package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * A DonationCampaign.
 */
@Entity
@Table(name = "donation_campaign")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DonationCampaign implements Serializable {

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

    @Column(name = "goal_amount", precision = 21, scale = 2)
    private BigDecimal goalAmount;

    @Column(name = "raised_amount", precision = 21, scale = 2)
    private BigDecimal raisedAmount;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "vietqr_payload")
    private String vietqrPayload;

    @Column(name = "status")
    private String status;

    /** general | scholarship */
    @Column(name = "purpose")
    private String purpose;

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public DonationCampaign id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return this.title;
    }

    public DonationCampaign title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public BigDecimal getGoalAmount() {
        return this.goalAmount;
    }

    public DonationCampaign goalAmount(BigDecimal goalAmount) {
        this.setGoalAmount(goalAmount);
        return this;
    }

    public void setGoalAmount(BigDecimal goalAmount) {
        this.goalAmount = goalAmount;
    }

    public BigDecimal getRaisedAmount() {
        return this.raisedAmount;
    }

    public DonationCampaign raisedAmount(BigDecimal raisedAmount) {
        this.setRaisedAmount(raisedAmount);
        return this;
    }

    public void setRaisedAmount(BigDecimal raisedAmount) {
        this.raisedAmount = raisedAmount;
    }

    public String getVietqrPayload() {
        return this.vietqrPayload;
    }

    public DonationCampaign vietqrPayload(String vietqrPayload) {
        this.setVietqrPayload(vietqrPayload);
        return this;
    }

    public void setVietqrPayload(String vietqrPayload) {
        this.vietqrPayload = vietqrPayload;
    }

    public String getStatus() {
        return this.status;
    }

    public DonationCampaign status(String status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPurpose() {
        return this.purpose;
    }

    public DonationCampaign purpose(String purpose) {
        this.setPurpose(purpose);
        return this;
    }

    public void setPurpose(String purpose) {
        this.purpose = purpose;
    }

    public FamilyTree getTree() {
        return this.tree;
    }

    public void setTree(FamilyTree familyTree) {
        this.tree = familyTree;
    }

    public DonationCampaign tree(FamilyTree familyTree) {
        this.setTree(familyTree);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DonationCampaign)) {
            return false;
        }
        return getId() != null && getId().equals(((DonationCampaign) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DonationCampaign{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", goalAmount=" + getGoalAmount() +
            ", raisedAmount=" + getRaisedAmount() +
            ", vietqrPayload='" + getVietqrPayload() + "'" +
            ", status='" + getStatus() + "'" +
            ", purpose='" + getPurpose() + "'" +
            "}";
    }
}
