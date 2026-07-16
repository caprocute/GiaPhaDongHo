package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.MediaAlbumTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class MediaAlbumTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(MediaAlbum.class);
        MediaAlbum mediaAlbum1 = getMediaAlbumSample1();
        MediaAlbum mediaAlbum2 = new MediaAlbum();
        assertThat(mediaAlbum1).isNotEqualTo(mediaAlbum2);

        mediaAlbum2.setId(mediaAlbum1.getId());
        assertThat(mediaAlbum1).isEqualTo(mediaAlbum2);

        mediaAlbum2 = getMediaAlbumSample2();
        assertThat(mediaAlbum1).isNotEqualTo(mediaAlbum2);
    }
}
