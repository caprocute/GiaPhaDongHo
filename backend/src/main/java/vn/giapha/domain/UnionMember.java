package vn.giapha.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * A UnionMember.
 */
@Entity
@Table(name = "union_member")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UnionMember implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "role", nullable = false)
    private String role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tree" }, allowSetters = true)
    private FamilyUnion union;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tree" }, allowSetters = true)
    private Person person;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public UnionMember id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRole() {
        return this.role;
    }

    public UnionMember role(String role) {
        this.setRole(role);
        return this;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public FamilyUnion getUnion() {
        return this.union;
    }

    public void setUnion(FamilyUnion familyUnion) {
        this.union = familyUnion;
    }

    public UnionMember union(FamilyUnion familyUnion) {
        this.setUnion(familyUnion);
        return this;
    }

    public Person getPerson() {
        return this.person;
    }

    public void setPerson(Person person) {
        this.person = person;
    }

    public UnionMember person(Person person) {
        this.setPerson(person);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UnionMember)) {
            return false;
        }
        return getId() != null && getId().equals(((UnionMember) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UnionMember{" +
            "id=" + getId() +
            ", role='" + getRole() + "'" +
            "}";
    }
}
