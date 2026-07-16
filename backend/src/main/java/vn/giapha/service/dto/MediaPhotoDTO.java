package vn.giapha.service.dto;

import jakarta.validation.constraints.*;
import java.io.Serializable;
import java.util.Objects;

/**
 * A DTO for the {@link vn.giapha.domain.MediaPhoto} entity.
 */
@SuppressWarnings("common-java:DuplicatedBlocks")
public class MediaPhotoDTO implements Serializable {

    private Long id;

    @NotNull
    private String objectKey;

    private String caption;

    private String blurhash;

    private Long viewCount;

    private MediaAlbumDTO album;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getObjectKey() {
        return objectKey;
    }

    public void setObjectKey(String objectKey) {
        this.objectKey = objectKey;
    }

    public String getCaption() {
        return caption;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public String getBlurhash() {
        return blurhash;
    }

    public void setBlurhash(String blurhash) {
        this.blurhash = blurhash;
    }

    public Long getViewCount() {
        return viewCount;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public MediaAlbumDTO getAlbum() {
        return album;
    }

    public void setAlbum(MediaAlbumDTO album) {
        this.album = album;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MediaPhotoDTO)) {
            return false;
        }

        MediaPhotoDTO mediaPhotoDTO = (MediaPhotoDTO) o;
        if (this.id == null) {
            return false;
        }
        return Objects.equals(this.id, mediaPhotoDTO.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(this.id);
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MediaPhotoDTO{" +
            "id=" + getId() +
            ", objectKey='" + getObjectKey() + "'" +
            ", caption='" + getCaption() + "'" +
            ", blurhash='" + getBlurhash() + "'" +
            ", viewCount=" + getViewCount() +
            ", album=" + getAlbum() +
            "}";
    }
}
