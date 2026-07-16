package vn.giapha.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
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

    private FamilyTreeDTO tree;

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
            ", tree=" + getTree() +
            "}";
    }
}
