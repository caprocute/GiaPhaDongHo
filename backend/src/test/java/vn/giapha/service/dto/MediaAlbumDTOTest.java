package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class MediaAlbumDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(MediaAlbumDTO.class);
        MediaAlbumDTO mediaAlbumDTO1 = new MediaAlbumDTO();
        mediaAlbumDTO1.setId(1L);
        MediaAlbumDTO mediaAlbumDTO2 = new MediaAlbumDTO();
        assertThat(mediaAlbumDTO1).isNotEqualTo(mediaAlbumDTO2);
        mediaAlbumDTO2.setId(mediaAlbumDTO1.getId());
        assertThat(mediaAlbumDTO1).isEqualTo(mediaAlbumDTO2);
        mediaAlbumDTO2.setId(2L);
        assertThat(mediaAlbumDTO1).isNotEqualTo(mediaAlbumDTO2);
        mediaAlbumDTO1.setId(null);
        assertThat(mediaAlbumDTO1).isNotEqualTo(mediaAlbumDTO2);
    }
}
