package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;
import java.time.Instant;

/**
 * A CmsPost.
 */
@Entity
@Table(name = "cms_post")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CmsPost implements Serializable {

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
    @Column(name = "title", nullable = false)
    private String title;

    @Lob
    @Column(name = "summary")
    private String summary;

    @Lob
    @Column(name = "body_html")
    private String bodyHtml;

    @Column(name = "status")
    private String status;

    @Column(name = "published_at")
    private Instant publishedAt;

    @Column(name = "view_count")
    private Long viewCount;

    @Column(name = "author_name")
    private String authorName;

    @ManyToOne(fetch = FetchType.LAZY)
    private CmsCategory category;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public CmsPost id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getSlug() {
        return this.slug;
    }

    public CmsPost slug(String slug) {
        this.setSlug(slug);
        return this;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTitle() {
        return this.title;
    }

    public CmsPost title(String title) {
        this.setTitle(title);
        return this;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return this.summary;
    }

    public CmsPost summary(String summary) {
        this.setSummary(summary);
        return this;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getBodyHtml() {
        return this.bodyHtml;
    }

    public CmsPost bodyHtml(String bodyHtml) {
        this.setBodyHtml(bodyHtml);
        return this;
    }

    public void setBodyHtml(String bodyHtml) {
        this.bodyHtml = bodyHtml;
    }

    public String getStatus() {
        return this.status;
    }

    public CmsPost status(String status) {
        this.setStatus(status);
        return this;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getPublishedAt() {
        return this.publishedAt;
    }

    public CmsPost publishedAt(Instant publishedAt) {
        this.setPublishedAt(publishedAt);
        return this;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Long getViewCount() {
        return this.viewCount;
    }

    public CmsPost viewCount(Long viewCount) {
        this.setViewCount(viewCount);
        return this;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public String getAuthorName() {
        return this.authorName;
    }

    public CmsPost authorName(String authorName) {
        this.setAuthorName(authorName);
        return this;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public CmsCategory getCategory() {
        return this.category;
    }

    public void setCategory(CmsCategory cmsCategory) {
        this.category = cmsCategory;
    }

    public CmsPost category(CmsCategory cmsCategory) {
        this.setCategory(cmsCategory);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CmsPost)) {
            return false;
        }
        return getId() != null && getId().equals(((CmsPost) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CmsPost{" +
            "id=" + getId() +
            ", slug='" + getSlug() + "'" +
            ", title='" + getTitle() + "'" +
            ", summary='" + getSummary() + "'" +
            ", bodyHtml='" + getBodyHtml() + "'" +
            ", status='" + getStatus() + "'" +
            ", publishedAt='" + getPublishedAt() + "'" +
            ", viewCount=" + getViewCount() +
            ", authorName='" + getAuthorName() + "'" +
            "}";
    }
}
