package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class MediaPhotoDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(MediaPhotoDTO.class);
        MediaPhotoDTO mediaPhotoDTO1 = new MediaPhotoDTO();
        mediaPhotoDTO1.setId(1L);
        MediaPhotoDTO mediaPhotoDTO2 = new MediaPhotoDTO();
        assertThat(mediaPhotoDTO1).isNotEqualTo(mediaPhotoDTO2);
        mediaPhotoDTO2.setId(mediaPhotoDTO1.getId());
        assertThat(mediaPhotoDTO1).isEqualTo(mediaPhotoDTO2);
        mediaPhotoDTO2.setId(2L);
        assertThat(mediaPhotoDTO1).isNotEqualTo(mediaPhotoDTO2);
        mediaPhotoDTO1.setId(null);
        assertThat(mediaPhotoDTO1).isNotEqualTo(mediaPhotoDTO2);
    }
}
