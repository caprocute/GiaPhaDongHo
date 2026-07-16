package vn.giapha.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

/**
 * R2 modules — npx generator-jhipster@9.2.0 jdl jdl/r2-modules.jdl --no-interactive
 * FamilyTree / Person đã generate ở genealogy.jdl → builtInEntity.
 */
@Entity
@Table(name = "change_request")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChangeRequest implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "requester_user_id", nullable = false)
    private String requesterUserId;

    @NotNull
    @Column(name = "entity_type", nullable = false)
    private String entityType;

    @Column(name = "summary")
    private String summary;

    @Lob
    @Column(name = "diff_json", nullable = false)
    private String diffJson;

    @Column(name = "status")
    private String status;

    @Lob
    @Column(name = "reviewer_note")
    private String reviewerNote;

    @Column(name = "created_at")
    private Instant createdAt;

    @Column(name = "reviewed_at")
    private Instant reviewedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tree" }, allowSetters = true)
    private Person person;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public ChangeRequest id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRequesterUserId() {
        return this.requesterUserId;
    }

    public ChangeRequest requesterUserId(String requesterUserId) {
        this.setRequesterUserId(requesterUserId);
        return this;
    }

    public void setRequesterUserId(String requesterUserId) {
        this.requesterUserId = requesterUserId;
    }

    public String getEntityType() {
        return this.entityType;
    }

    public ChangeRequest entityType(String entityType) {
        this.setEntityType(entityType);
        return this;
    }

    public void setEntityType(String entityType) {
        this.entityType = entityType;
    }

    public String getSummary() {
        return this.summary;
    }

    public ChangeRequest summary(String summary) {
        this.setSummary(summary);
        return this;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getDiffJson() {
        return this.diffJson;
    }

    public ChangeRequest diffJson(String diffJson) {
        this.setDiffJson(diffJson);
        return this;
    }

    public void setDiffJson(String diffJson) {
        this.diffJson = diffJson;
    }

    public String getStatus() {
        return this.status;
    }

    public ChangeRequest status(String status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getReviewerNote() {
        return this.reviewerNote;
    }

    public ChangeRequest reviewerNote(String reviewerNote) {
        this.setReviewerNote(reviewerNote);
        return this;
    }

    public void setReviewerNote(String reviewerNote) {
        this.reviewerNote = reviewerNote;
    }

    public Instant getCreatedAt() {
        return this.createdAt;
    }

    public ChangeRequest createdAt(Instant createdAt) {
        this.setCreatedAt(createdAt);
        return this;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getReviewedAt() {
        return this.reviewedAt;
    }

    public ChangeRequest reviewedAt(Instant reviewedAt) {
        this.setReviewedAt(reviewedAt);
        return this;
    }

    public void setReviewedAt(Instant reviewedAt) {
        this.reviewedAt = reviewedAt;
    }

    public FamilyTree getTree() {
        return this.tree;
    }

    public void setTree(FamilyTree familyTree) {
        this.tree = familyTree;
    }

    public ChangeRequest tree(FamilyTree familyTree) {
        this.setTree(familyTree);
        return this;
    }

    public Person getPerson() {
        return this.person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }

    public ChangeRequest person(Person person) {
        this.setPerson(person);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof ChangeRequest)) {
            return false;
        }
        return getId() != null && getId().equals(((ChangeRequest) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChangeRequest{" +
            "id=" + getId() +
            ", requesterUserId='" + getRequesterUserId() + "'" +
            ", entityType='" + getEntityType() + "'" +
            ", summary='" + getSummary() + "'" +
            ", diffJson='" + getDiffJson() + "'" +
            ", status='" + getStatus() + "'" +
            ", reviewerNote='" + getReviewerNote() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", reviewedAt='" + getReviewedAt() + "'" +
            "}";
    }
}
