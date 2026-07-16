package vn.giapha.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * A DonationContribution.
 */
@Entity
@Table(name = "donation_contribution")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class DonationContribution implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "donor_name", nullable = false)
    private String donorName;

    @Column(name = "amount", precision = 21, scale = 2)
    private BigDecimal amount;

    @Column(name = "kind")
    private String kind;

    @Lob
    @Column(name = "note")
    private String note;

    @Column(name = "created_at")
    private Instant createdAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tree" }, allowSetters = true)
    private DonationCampaign campaign;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public DonationContribution id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getDonorName() {
        return this.donorName;
    }

    public DonationContribution donorName(String donorName) {
        this.setDonorName(donorName);
        return this;
    }

    public void setDonorName(String donorName) {
        this.donorName = donorName;
    }

    public BigDecimal getAmount() {
        return this.amount;
    }

    public DonationContribution amount(BigDecimal amount) {
        this.setAmount(amount);
        return this;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getKind() {
        return this.kind;
    }

    public DonationContribution kind(String kind) {
        this.setKind(kind);
        return this;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getNote() {
        return this.note;
    }

    public DonationContribution note(String note) {
        this.setNote(note);
        return this;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public DonationContribution createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public DonationCampaign getCampaign() {
        return this.campaign;
    }

    public void setCampaign(DonationCampaign donationCampaign) {
        this.campaign = donationCampaign;
    }

    public DonationContribution campaign(DonationCampaign donationCampaign) {
        this.setCampaign(donationCampaign);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof DonationContribution)) {
            return false;
        }
        return getId() != null && getId().equals(((DonationContribution) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "DonationContribution{" +
            "id=" + getId() +
            ", donorName='" + getDonorName() + "'" +
            ", amount=" + getAmount() +
            ", kind='" + getKind() + "'" +
            ", note='" + getNote() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            "}";
    }
}
