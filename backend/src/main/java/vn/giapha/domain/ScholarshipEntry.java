package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * A ScholarshipEntry.
 */
@Entity
@Table(name = "scholarship_entry")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ScholarshipEntry implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "person_name", nullable = false)
    private String personName;

    @NotNull
    @Column(name = "achievement", nullable = false)
    private String achievement;

    @Column(name = "year")
    private Integer year;

    @Column(name = "status")
    private String status;

    @Column(name = "person_code")
    private String personCode;

    @Column(name = "level")
    private String level;

    @Column(name = "school_or_field")
    private String schoolOrField;

    @Column(name = "medal_note")
    private String medalNote;

    @Column(name = "lineage_note")
    private String lineageNote;

    @Column(name = "review_note")
    private String reviewNote;

    @Column(name = "award_amount", precision = 21, scale = 2)
    private BigDecimal awardAmount;

    @Column(name = "awarded_at")
    private Instant awardedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

    @ManyToOne(fetch = FetchType.LAZY)
    private Person person;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ScholarshipEntry id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPersonName() {
        return this.personName;
    }

    public ScholarshipEntry personName(String personName) {
        this.setPersonName(personName);
        return this;
    }

    public void setPersonName(String personName) {
        this.personName = personName;
    }

    public String getAchievement() {
        return this.achievement;
    }

    public ScholarshipEntry achievement(String achievement) {
        this.setAchievement(achievement);
        return this;
    }

    public void setAchievement(String achievement) {
        this.achievement = achievement;
    }

    public Integer getYear() {
        return this.year;
    }

    public ScholarshipEntry year(Integer year) {
        this.setYear(year);
        return this;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getStatus() {
        return this.status;
    }

    public ScholarshipEntry status(String status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPersonCode() {
        return this.personCode;
    }

    public ScholarshipEntry personCode(String personCode) {
        this.setPersonCode(personCode);
        return this;
    }

    public void setPersonCode(String personCode) {
        this.personCode = personCode;
    }

    public String getLevel() {
        return this.level;
    }

    public ScholarshipEntry level(String level) {
        this.setLevel(level);
        return this;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getSchoolOrField() {
        return this.schoolOrField;
    }

    public ScholarshipEntry schoolOrField(String schoolOrField) {
        this.setSchoolOrField(schoolOrField);
        return this;
    }

    public void setSchoolOrField(String schoolOrField) {
        this.schoolOrField = schoolOrField;
    }

    public String getMedalNote() {
        return this.medalNote;
    }

    public ScholarshipEntry medalNote(String medalNote) {
        this.setMedalNote(medalNote);
        return this;
    }

    public void setMedalNote(String medalNote) {
        this.medalNote = medalNote;
    }

    public String getLineageNote() {
        return this.lineageNote;
    }

    public ScholarshipEntry lineageNote(String lineageNote) {
        this.setLineageNote(lineageNote);
        return this;
    }

    public void setLineageNote(String lineageNote) {
        this.lineageNote = lineageNote;
    }

    public String getReviewNote() {
        return this.reviewNote;
    }

    public ScholarshipEntry reviewNote(String reviewNote) {
        this.setReviewNote(reviewNote);
        return this;
    }

    public void setReviewNote(String reviewNote) {
        this.reviewNote = reviewNote;
    }

    public BigDecimal getAwardAmount() {
        return this.awardAmount;
    }

    public ScholarshipEntry awardAmount(BigDecimal awardAmount) {
        this.setAwardAmount(awardAmount);
        return this;
    }

    public void setAwardAmount(BigDecimal awardAmount) {
        this.awardAmount = awardAmount;
    }

    public Instant getAwardedAt() {
        return this.awardedAt;
    }

    public ScholarshipEntry awardedAt(Instant awardedAt) {
        this.setAwardedAt(awardedAt);
        return this;
    }

    public void setAwardedAt(Instant awardedAt) {
        this.awardedAt = awardedAt;
    }

    public FamilyTree getTree() {
        return this.tree;
    }

    public void setTree(FamilyTree familyTree) {
        this.tree = familyTree;
    }

    public ScholarshipEntry tree(FamilyTree familyTree) {
        this.setTree(familyTree);
        return this;
    }

    public Person getPerson() {
        return this.person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }

    public ScholarshipEntry person(Person person) {
        this.setPerson(person);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ScholarshipEntry)) {
            return false;
        }
        return getId() != null && getId().equals(((ScholarshipEntry) o).getId());
    }

    @Override
    public int hashCode() {
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ScholarshipEntry{" +
            "id=" + getId() +
            ", personName='" + getPersonName() + "'" +
            ", achievement='" + getAchievement() + "'" +
            ", year=" + getYear() +
            ", status='" + getStatus() + "'" +
            ", personCode='" + getPersonCode() + "'" +
            ", level='" + getLevel() + "'" +
            ", schoolOrField='" + getSchoolOrField() + "'" +
            ", medalNote='" + getMedalNote() + "'" +
            ", lineageNote='" + getLineageNote() + "'" +
            ", reviewNote='" + getReviewNote() + "'" +
            ", awardAmount=" + getAwardAmount() +
            ", awardedAt='" + getAwardedAt() + "'" +
            "}";
    }
}
