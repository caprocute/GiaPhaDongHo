package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.time.Instant;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.CmsComment} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class CmsCommentDTO implements Serializable {

    private Long id;

    private String authorName;

    @Lob
    private String body;

    private String status;

    private Instant createdAt;

    private CmsPostDTO post;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getAuthorName() {
        return authorName;
    }

    public void setAuthorName(String authorName) {
        this.authorName = authorName;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public CmsPostDTO getPost() {
        return post;
    }

    public void setPost(CmsPostDTO post) {
        this.post = post;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof CmsCommentDTO)) {
            return false;
        }

        CmsCommentDTO cmsCommentDTO = (CmsCommentDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, cmsCommentDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "CmsCommentDTO{" +
            "id=" + getId() +
            ", authorName='" + getAuthorName() + "'" +
            ", body='" + getBody() + "'" +
            ", status='" + getStatus() + "'" +
            ", createdAt='" + getCreatedAt() + "'" +
            ", post=" + getPost() +
            "}";
    }
}
