package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * Suất học bổng đã trao trong một đợt (SRS-12c).
 */
@Entity
@Table(
    name = "scholarship_award",
    uniqueConstraints = @UniqueConstraint(name = "ux_sch_award__round_entry", columnNames = { "round_id", "entry_id" })
)
public class ScholarshipAward implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "amount", precision = 21, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(name = "awarded_at")
    private Instant awardedAt;

    @Column(name = "awarded_by")
    private String awardedBy;

    @Column(name = "note")
    private String note;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id")
    private ScholarshipAwardRound round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id")
    private ScholarshipEntry entry;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public Instant getAwardedAt() {
        return awardedAt;
    }

    public void setAwardedAt(Instant awardedAt) {
        this.awardedAt = awardedAt;
    }

    public String getAwardedBy() {
        return awardedBy;
    }

    public void setAwardedBy(String awardedBy) {
        this.awardedBy = awardedBy;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public ScholarshipAwardRound getRound() {
        return round;
    }

    public void setRound(ScholarshipAwardRound round) {
        this.round = round;
    }

    public ScholarshipEntry getEntry() {
        return entry;
    }

    public void setEntry(ScholarshipEntry entry) {
        this.entry = entry;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (!(o instanceof ScholarshipAward)) return false;
        return id != null && id.equals(((ScholarshipAward) o).id);
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }
}
