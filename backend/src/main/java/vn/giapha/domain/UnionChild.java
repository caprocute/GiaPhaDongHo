package vn.giapha.domain;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * A UnionChild.
 */
@Entity
@Table(name = "union_child")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class UnionChild implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "order_no")
    private Integer orderNo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tree" }, allowSetters = true)
    private FamilyUnion union;

    @ManyToOne(fetch = FetchType.LAZY)
    @JsonIgnoreProperties(value = { "tree" }, allowSetters = true)
    private Person child;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public UnionChild id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getOrderNo() {
        return this.orderNo;
    }

    public UnionChild orderNo(Integer orderNo) {
        this.setOrderNo(orderNo);
        return this;
    }

    public void setOrderNo(Integer orderNo) {
        this.orderNo = orderNo;
    }

    public FamilyUnion getUnion() {
        return this.union;
    }

    public void setUnion(FamilyUnion familyUnion) {
        this.union = familyUnion;
    }

    public UnionChild union(FamilyUnion familyUnion) {
        this.setUnion(familyUnion);
        return this;
    }

    public Person getChild() {
        return this.child;
    }

    public void setChild(Person person) {
        this.child = person;
    }

    public UnionChild child(Person person) {
        this.setChild(person);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof UnionChild)) {
            return false;
        }
        return getId() != null && getId().equals(((UnionChild) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "UnionChild{" +
            "id=" + getId() +
            ", orderNo=" + getOrderNo() +
            "}";
    }
}
