package vn.giapha.domain;

import jakarta.persistence.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * Entity lõi phả hệ — sinh bằng: npx generator-jhipster@9.2.0 jdl jdl/genealogy.jdl --no-interactive
 */
@Entity
@Table(name = "family_tree")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class FamilyTree implements Serializable {

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
    @Column(name = "surname", nullable = false)
    private String surname;

    @Column(name = "branch_name")
    private String branchName;

    @Column(name = "province_code")
    private String provinceCode;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "meta_json")
    private String metaJson;

    @JdbcTypeCode(SqlTypes.LONGVARCHAR)
    @Column(name = "stats_cache_json")
    private String statsCacheJson;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public FamilyTree id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return this.slug;
    }

    public FamilyTree slug(String slug) {
        this.setSlug(slug);
        return this;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getSurname() {
        return this.surname;
    }

    public FamilyTree surname(String surname) {
        this.setSurname(surname);
        return this;
    }

    public void setSurname(String surname) {
        this.surname = surname;
    }

    public String getBranchName() {
        return this.branchName;
    }

    public FamilyTree branchName(String branchName) {
        this.setBranchName(branchName);
        return this;
    }

    public void setBranchName(String branchName) {
        this.branchName = branchName;
    }

    public String getProvinceCode() {
        return this.provinceCode;
    }

    public FamilyTree provinceCode(String provinceCode) {
        this.setProvinceCode(provinceCode);
        return this;
    }

    public void setProvinceCode(String provinceCode) {
        this.provinceCode = provinceCode;
    }

    public String getMetaJson() {
        return this.metaJson;
    }

    public FamilyTree metaJson(String metaJson) {
        this.setMetaJson(metaJson);
        return this;
    }

    public void setMetaJson(String metaJson) {
        this.metaJson = metaJson;
    }

    public String getStatsCacheJson() {
        return this.statsCacheJson;
    }

    public FamilyTree statsCacheJson(String statsCacheJson) {
        this.setStatsCacheJson(statsCacheJson);
        return this;
    }

    public void setStatsCacheJson(String statsCacheJson) {
        this.statsCacheJson = statsCacheJson;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof FamilyTree)) {
            return false;
        }
        return getId() != null && getId().equals(((FamilyTree) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "FamilyTree{" +
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
