package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * A Chapter.
 */
@Entity
@Table(name = "chapter")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class Chapter implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "kind", nullable = false)
    private String kind;

    @NotNull
    @Column(name = "title", nullable = false)
    private String title;

    @Lob
    @Column(name = "body_html")
    private String bodyHtml;

    @Column(name = "version")
    private Integer version;

    @ManyToOne(fetch = FetchType.LAZY)
    private FamilyTree tree;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public Chapter id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKind() {
        return this.kind;
    }

    public Chapter kind(String kind) {
        this.setKind(kind);
        return this;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getTitle() {
        return this.title;
    }

    public Chapter title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBodyHtml() {
        return this.bodyHtml;
    }

    public Chapter bodyHtml(String bodyHtml) {
        this.setBodyHtml(bodyHtml);
        return this;
    }

    public void setBodyHtml(String bodyHtml) {
        this.bodyHtml = bodyHtml;
    }

    public Integer getVersion() {
        return this.version;
    }

    public Chapter version(Integer version) {
        this.setVersion(version);
        return this;
    }

    public void setVersion(Integer version) {
        this.version = version;
    }

    public FamilyTree getTree() {
        return this.tree;
    }

    public void setTree(FamilyTree familyTree) {
        this.tree = familyTree;
    }

    public Chapter tree(FamilyTree familyTree) {
        this.setTree(familyTree);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof Chapter)) {
            return false;
        }
        return getId() != null && getId().equals(((Chapter) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "Chapter{" +
            "id=" + getId() +
            ", kind='" + getKind() + "'" +
            ", title='" + getTitle() + "'" +
            ", bodyHtml='" + getBodyHtml() + "'" +
            ", version=" + getVersion() +
            "}";
    }
}
