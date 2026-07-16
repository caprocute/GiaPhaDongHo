package vn.giapha.service.dto;

import jakarta.persistence.Lob;
import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.MediaAlbum} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class MediaAlbumDTO implements Serializable {

    private Long id;

    @NotNull
    private String title;

    @Lob
    private String description;

    private String coverObjectKey;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCoverObjectKey() {
        return coverObjectKey;
    }

    public void setCoverObjectKey(String coverObjectKey) {
        this.coverObjectKey = coverObjectKey;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MediaAlbumDTO)) {
            return false;
        }

        MediaAlbumDTO mediaAlbumDTO = (MediaAlbumDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, mediaAlbumDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MediaAlbumDTO{" +
            "id=" + getId() +
            ", title='" + getTitle() + "'" +
            ", description='" + getDescription() + "'" +
            ", coverObjectKey='" + getCoverObjectKey() + "'" +
            "}";
    }
}
