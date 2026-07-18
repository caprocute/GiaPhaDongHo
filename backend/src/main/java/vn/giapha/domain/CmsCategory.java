package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * CMS + Media — npx generator-jhipster@9.2.0 jdl jdl/cms-media.jdl --no-interactive
 */
@Entity
@Table(name = "cms_category")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CmsCategory implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "slug", nullable = false, unique = true)
    private String slug;

    @NotNull
    @Column(name = "name", nullable = false)
    private String name;

    @Column(name = "layout")
    private String layout;

    @Column(name = "sort_order")
    private Integer sortOrder;

    @Column(name = "visible_on_nav")
    private Boolean visibleOnNav;

    @Column(name = "description")
    private String description;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CmsCategory id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return this.slug;
    }

    public CmsCategory slug(String slug) {
        this.setSlug(slug);
        return this;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getName() {
        return this.name;
    }

    public CmsCategory name(String name) {
        this.setName(name);
        return this;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getLayout() {
        return this.layout;
    }

    public CmsCategory layout(String layout) {
        this.setLayout(layout);
        return this;
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

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CmsCategory)) {
            return false;
        }
        return getId() != null && getId().equals(((CmsCategory) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CmsCategory{" +
            "id=" + getId() +
            ", slug='" + getSlug() + "'" +
            ", name='" + getName() + "'" +
            ", layout='" + getLayout() + "'" +
            "}";
    }
}
