package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.FamilyUnion} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class FamilyUnionDTO implements Serializable {

    private Long id;

    private Integer orderNo;

    @Lob
    private String marriageInfoJson;

    private FamilyTreeDTO tree;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Integer getOrderNo() {
        return orderNo;
    }

    public void setOrderNo(Integer orderNo) {
        this.orderNo = orderNo;
    }

    public String getMarriageInfoJson() {
        return marriageInfoJson;
    }

    public void setMarriageInfoJson(String marriageInfoJson) {
        this.marriageInfoJson = marriageInfoJson;
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
        if (!(o instanceof FamilyUnionDTO)) {
            return false;
        }

        FamilyUnionDTO familyUnionDTO = (FamilyUnionDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, familyUnionDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FamilyUnionDTO{" +
            "id=" + getId() +
            ", orderNo=" + getOrderNo() +
            ", marriageInfoJson='" + getMarriageInfoJson() + "'" +
            ", tree=" + getTree() +
            "}";
    }
}
