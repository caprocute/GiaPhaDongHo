package vn.giapha.domain;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import java.io.Serial;
import java.io.Serializable;

/**
 * A MediaPhoto.
 */
@Entity
@Table(name = "media_photo")
@SuppressWarnings("common-java:DuplicatedBlocks")
public class MediaPhoto implements Serializable {

    @Serial
    private static final long serialVersionUID = 1L;

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "sequenceGenerator")
    @SequenceGenerator(name = "sequenceGenerator")
    @Column(name = "id")
    private Long id;

    @NotNull
    @Column(name = "object_key", nullable = false)
    private String objectKey;

    @Column(name = "caption")
    private String caption;

    @Column(name = "blurhash")
    private String blurhash;

    @Column(name = "view_count")
    private Long viewCount;

    @ManyToOne(fetch = FetchType.LAZY)
    private MediaAlbum album;

    // jhipster-needle-entity-add-field - JHipster will add fields here

    public Long getId() {
        return this.id;
    }

    public MediaPhoto id(Long id) {
        this.setId(id);
        return this;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getObjectKey() {
        return this.objectKey;
    }

    public MediaPhoto objectKey(String objectKey) {
        this.setObjectKey(objectKey);
        return this;
    }

    public void setObjectKey(String objectKey) {
        this.objectKey = objectKey;
    }

    public String getCaption() {
        return this.caption;
    }

    public MediaPhoto caption(String caption) {
        this.setCaption(caption);
        return this;
    }

    public void setCaption(String caption) {
        this.caption = caption;
    }

    public String getBlurhash() {
        return this.blurhash;
    }

    public MediaPhoto blurhash(String blurhash) {
        this.setBlurhash(blurhash);
        return this;
    }

    public void setBlurhash(String blurhash) {
        this.blurhash = blurhash;
    }

    public Long getViewCount() {
        return this.viewCount;
    }

    public MediaPhoto viewCount(Long viewCount) {
        this.setViewCount(viewCount);
        return this;
    }

    public void setViewCount(Long viewCount) {
        this.viewCount = viewCount;
    }

    public MediaAlbum getAlbum() {
        return this.album;
    }

    public void setAlbum(MediaAlbum mediaAlbum) {
        this.album = mediaAlbum;
    }

    public MediaPhoto album(MediaAlbum mediaAlbum) {
        this.setAlbum(mediaAlbum);
        return this;
    }

    // jhipster-needle-entity-add-getters-setters - JHipster will add getters and setters here

    @Override
    public boolean equals(Object o) {
        if (this == o) {
            return true;
        }
        if (!(o instanceof MediaPhoto)) {
            return false;
        }
        return getId() != null && getId().equals(((MediaPhoto) o).getId());
    }

    @Override
    public int hashCode() {
        // see https://vladmihalcea.com/how-to-implement-equals-and-hashcode-using-the-jpa-entity-identifier/
        return getClass().hashCode();
    }

    // prettier-ignore
    @Override
    public String toString() {
        return "MediaPhoto{" +
            "id=" + getId() +
            ", objectKey='" + getObjectKey() + "'" +
            ", caption='" + getCaption() + "'" +
            ", blurhash='" + getBlurhash() + "'" +
            ", viewCount=" + getViewCount() +
            "}";
    }
}
