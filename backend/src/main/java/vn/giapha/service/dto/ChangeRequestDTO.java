package vn.giapha.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.ChangeRequest} entity.
 */
@Schema(
    description = "R2 modules — npx generator-jhipster@9.2.0 jdl jdl/r2-modules.jdl --no-interactive\nFamilyTree / Person đã generate ở genealogy.jdl → builtInEntity."
)
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChangeRequestDTO implements Serializable {

    private Long id;

    @NotNull
    private String requesterUserId;

    @NotNull
    private String entityType;

    private String summary;

    @Lob
    private String diffJson;

    private String status;

    @Lob
    private String reviewerNote;

    private Instant createdAt;

    private Instant reviewedAt;

    private FamilyTreeDTO tree;

    private PersonDTO person;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequesterUserId() {
        return requesterUserId;
    }

    public void setRequesterUserId(String requesterUserId) {
        this.requesterUserId = requesterUserId;
    }

    public String getEntityType() {
        return entityType;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDiffJson() {
        return diffJson;
    }

    public void setDiffJson(String diffJson) {
        this.diffJson = diffJson;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReviewerNote() {
        return reviewerNote;
    }

    public void setReviewerNote(String reviewerNote) {
        this.reviewerNote = reviewerNote;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getReviewedAt() {
        return reviewedAt;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
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
        if (!(o instanceof ChangeRequestDTO)) {
            return false;
        }

        ChangeRequestDTO changeRequestDTO = (ChangeRequestDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, changeRequestDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChangeRequestDTO{" +
            "id=" + getId() +
            ", requesterUserId='" + getRequesterUserId() + "'" +
            ", entityType='" + getEntityType() + "'" +
            ", summary='" + getSummary() + "'" +
            ", diffJson='" + getDiffJson() + "'" +
            ", status='" + getStatus() + "'" +
            ", reviewerNote='" + getReviewerNote() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", reviewedAt='" + getReviewedAt() + "'" +
            ", tree=" + getTree() +
            ", person=" + getPerson() +
            "}";
    }
}
