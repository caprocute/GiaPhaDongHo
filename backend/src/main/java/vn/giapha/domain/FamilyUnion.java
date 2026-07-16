package vn.giapha.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import java.io.Serial;
import java.io.Serializable;

/**
 * A FamilyUnion.
 */
@Entity
@Table(name = "family_union")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class FamilyUnion implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @Column(name = "order_no")
    private Integer orderNo;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "marriage_info_json")
    private String marriageInfoJson;

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public FamilyUnion id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getOrderNo() {
        return this.orderNo;
    }

    public FamilyUnion orderNo(Integer orderNo) {
        this.setOrderNo(orderNo);
        return this;
    }

    public void setOrderNo(Integer orderNo) {
        this.orderNo = orderNo;
    }

    public String getMarriageInfoJson() {
        return this.marriageInfoJson;
    }

    public FamilyUnion marriageInfoJson(String marriageInfoJson) {
        this.setMarriageInfoJson(marriageInfoJson);
        return this;
    }

    public void setMarriageInfoJson(String marriageInfoJson) {
        this.marriageInfoJson = marriageInfoJson;
    }

    public FamilyTree getTree() {
        return this.tree;
    }

    public void setTree(FamilyTree familyTree) {
        this.tree = familyTree;
    }

    public FamilyUnion tree(FamilyTree familyTree) {
        this.setTree(familyTree);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FamilyUnion)) {
            return false;
        }
        return getId() != null && getId().equals(((FamilyUnion) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FamilyUnion{" +
            "id=" + getId() +
            ", orderNo=" + getOrderNo() +
            ", marriageInfoJson='" + getMarriageInfoJson() + "'" +
            "}";
    }
}
