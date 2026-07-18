package vn.giapha.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.math.BigDecimal;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.ScholarshipEntry} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ScholarshipEntryDTO implements Serializable {

    private Long id;

    @NotNull
    private String personName;

    @NotNull
    private String achievement;

    private Integer year;

    private String status;

    private String personCode;

    private String level;

    private String schoolOrField;

    private String medalNote;

    private String lineageNote;

    private String reviewNote;

    private BigDecimal awardAmount;

    private Instant awardedAt;

    private FamilyTreeDTO tree;

    private PersonDTO person;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getPersonName() {
        return personName;
    }

    public void setPersonName(String personName) {
        this.personName = personName;
    }

    public String getAchievement() {
        return achievement;
    }

    public void setAchievement(String achievement) {
        this.achievement = achievement;
    }

    public Integer getYear() {
        return year;
    }

    public void setYear(Integer year) {
        this.year = year;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getPersonCode() {
        return personCode;
    }

    public void setPersonCode(String personCode) {
        this.personCode = personCode;
    }

    public String getLevel() {
        return level;
    }

    public void setLevel(String level) {
        this.level = level;
    }

    public String getSchoolOrField() {
        return schoolOrField;
    }

    public void setSchoolOrField(String schoolOrField) {
        this.schoolOrField = schoolOrField;
    }

    public String getMedalNote() {
        return medalNote;
    }

    public void setMedalNote(String medalNote) {
        this.medalNote = medalNote;
    }

    public String getLineageNote() {
        return lineageNote;
    }

    public void setLineageNote(String lineageNote) {
        this.lineageNote = lineageNote;
    }

    public String getReviewNote() {
        return reviewNote;
    }

    public void setReviewNote(String reviewNote) {
        this.reviewNote = reviewNote;
    }

    public BigDecimal getAwardAmount() {
        return awardAmount;
    }

    public void setAwardAmount(BigDecimal awardAmount) {
        this.awardAmount = awardAmount;
    }

    public Instant getAwardedAt() {
        return awardedAt;
    }

    public void setAwardedAt(Instant awardedAt) {
        this.awardedAt = awardedAt;
    }

    public FamilyTreeDTO getTree() {
        return tree;
    }

    public void setTree(FamilyTreeDTO tree) {
        this.tree = tree;
    }

    public PersonDTO getPerson() {
        return person;
    }

    public void setPerson(PersonDTO person) {
        this.person = person;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ScholarshipEntryDTO)) {
            return false;
        }

        ScholarshipEntryDTO scholarshipEntryDTO = (ScholarshipEntryDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, scholarshipEntryDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ScholarshipEntryDTO{" +
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
            ", tree=" + getTree() +
            ", person=" + getPerson() +
            "}";
    }
}
