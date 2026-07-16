package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

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

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

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
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
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
            "}";
    }
}
