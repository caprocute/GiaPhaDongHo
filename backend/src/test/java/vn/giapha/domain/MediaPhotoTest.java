package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.MediaAlbumTestSamples.*;
import static vn.giapha.domain.MediaPhotoTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class MediaPhotoTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(MediaPhoto.class);
        MediaPhoto mediaPhoto1 = getMediaPhotoSample1();
        MediaPhoto mediaPhoto2 = new MediaPhoto();
        assertThat(mediaPhoto1).isNotEqualTo(mediaPhoto2);

        mediaPhoto2.setId(mediaPhoto1.getId());
        assertThat(mediaPhoto1).isEqualTo(mediaPhoto2);

        mediaPhoto2 = getMediaPhotoSample2();
        assertThat(mediaPhoto1).isNotEqualTo(mediaPhoto2);
    }

    @Test
    void albumTest() {
        MediaPhoto mediaPhoto = getMediaPhotoRandomSampleGenerator();
        MediaAlbum mediaAlbumBack = getMediaAlbumRandomSampleGenerator();

        mediaPhoto.setAlbum(mediaAlbumBack);
        assertThat(mediaPhoto.getAlbum()).isEqualTo(mediaAlbumBack);

        mediaPhoto.album(null);
        assertThat(mediaPhoto.getAlbum()).isNull();
    }
}
