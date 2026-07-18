package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.CmsPost} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CmsPostDTO implements Serializable {

    private Long id;

    @NotNull
    private String slug;

    @NotNull
    private String title;

    @Lob
    private String summary;

    @Lob
    private String bodyHtml;

    private String status;

    private Instant publishedAt;

    private Long viewCount;

    private String authorName;

    private String coverObjectKey;

    private CmsCategoryDTO category;

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

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getSummary() {
        return summary;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public String getBodyHtml() {
        return bodyHtml;
    }

    public void setBodyHtml(String bodyHtml) {
        this.bodyHtml = bodyHtml;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public void setPublishedAt(Instant publishedAt) {
        this.publishedAt = publishedAt;
    }

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getCoverObjectKey() {
        return coverObjectKey;
    }

    public void setCoverObjectKey(String coverObjectKey) {
        this.coverObjectKey = coverObjectKey;
    }

    public CmsCategoryDTO getCategory() {
        return category;
    }

    public void setCategory(CmsCategoryDTO category) {
        this.category = category;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CmsPostDTO)) {
            return false;
        }

        CmsPostDTO cmsPostDTO = (CmsPostDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, cmsPostDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CmsPostDTO{" +
            "id=" + getId() +
            ", slug='" + getSlug() + "'" +
            ", title='" + getTitle() + "'" +
            ", summary='" + getSummary() + "'" +
            ", bodyHtml='" + getBodyHtml() + "'" +
            ", status='" + getStatus() + "'" +
            ", publishedAt='" + getPublishedAt() + "'" +
            ", viewCount=" + getViewCount() +
            ", authorName='" + getAuthorName() + "'" +
            ", category=" + getCategory() +
            "}";
    }
}
