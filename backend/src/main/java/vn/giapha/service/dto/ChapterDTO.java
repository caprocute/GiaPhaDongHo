package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.Chapter} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class ChapterDTO implements Serializable {

    private Long id;

    @NotNull
    private String kind;

    @NotNull
    private String title;

    @Lob
    private String bodyHtml;

    private Integer version;

    private FamilyTreeDTO tree;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getKind() {
        return kind;
    }

    public void setKind(String kind) {
        this.kind = kind;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getBodyHtml() {
        return bodyHtml;
    }

    public void setBodyHtml(String bodyHtml) {
        this.bodyHtml = bodyHtml;
    }

    public Integer getVersion() {
        return version;
    }

    public void setVersion(Integer version) {
        this.version = version;
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
        if (!(o instanceof ChapterDTO)) {
            return false;
        }

        ChapterDTO chapterDTO = (ChapterDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, chapterDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "ChapterDTO{" +
            "id=" + getId() +
            ", kind='" + getKind() + "'" +
            ", title='" + getTitle() + "'" +
            ", bodyHtml='" + getBodyHtml() + "'" +
            ", version=" + getVersion() +
            ", tree=" + getTree() +
            "}";
    }
}
