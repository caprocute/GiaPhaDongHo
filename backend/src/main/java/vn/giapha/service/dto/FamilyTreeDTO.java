package vn.giapha.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.FamilyTree} entity.
 */
@Schema(description = "Entity lõi phả hệ — sinh bằng: npx generator-jhipster@9.2.0 jdl jdl/genealogy.jdl --no-interactive")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class FamilyTreeDTO implements Serializable {

    private Long id;

    @NotNull
    private String slug;

    @NotNull
    private String surname;

    private String branchName;

    private String provinceCode;

    @Lob
    private String metaJson;

    @Lob
    private String statsCacheJson;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getSurname() {
        return surname;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getBranchName() {
        return branchName;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getProvinceCode() {
        return provinceCode;
    }

    public void setProvinceCode(String provinceCode) {
        this.provinceCode = provinceCode;
    }

    public String getMetaJson() {
        return metaJson;
    }

    public void setMetaJson(String metaJson) {
        this.metaJson = metaJson;
    }

    public String getStatsCacheJson() {
        return statsCacheJson;
    }

    public void setStatsCacheJson(String statsCacheJson) {
        this.statsCacheJson = statsCacheJson;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FamilyTreeDTO)) {
            return false;
        }

        FamilyTreeDTO familyTreeDTO = (FamilyTreeDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, familyTreeDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FamilyTreeDTO{" +
            "id=" + getId() +
            ", slug='" + getSlug() + "'" +
            ", surname='" + getSurname() + "'" +
            ", branchName='" + getBranchName() + "'" +
            ", provinceCode='" + getProvinceCode() + "'" +
            ", metaJson='" + getMetaJson() + "'" +
            ", statsCacheJson='" + getStatsCacheJson() + "'" +
            "}";
    }
}
