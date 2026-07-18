package vn.giapha.service.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.CmsCategory} entity.
 */
@Schema(description = "CMS + Media — npx generator-jhipster@9.2.0 jdl jdl/cms-media.jdl --no-interactive")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CmsCategoryDTO implements Serializable {

    private Long id;

    @NotNull
    private String slug;

    @NotNull
    private String name;

    private String layout;

    private Integer sortOrder;

    private Boolean visibleOnNav;

    private String description;

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

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLayout() {
        return layout;
    }

    public void setLayout(String layout) {
        this.layout = layout;
    }

    public Integer getSortOrder() {
        return sortOrder;
    }

    public void setSortOrder(Integer sortOrder) {
        this.sortOrder = sortOrder;
    }

    public Boolean getVisibleOnNav() {
        return visibleOnNav;
    }

    public void setVisibleOnNav(Boolean visibleOnNav) {
        this.visibleOnNav = visibleOnNav;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CmsCategoryDTO)) {
            return false;
        }

        CmsCategoryDTO cmsCategoryDTO = (CmsCategoryDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, cmsCategoryDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CmsCategoryDTO{" +
            "id=" + getId() +
            ", slug='" + getSlug() + "'" +
            ", name='" + getName() + "'" +
            ", layout='" + getLayout() + "'" +
            "}";
    }
}
