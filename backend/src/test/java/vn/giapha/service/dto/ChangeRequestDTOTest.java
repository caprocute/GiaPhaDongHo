package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class ChangeRequestDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ChangeRequestDTO.class);
        ChangeRequestDTO changeRequestDTO1 = new ChangeRequestDTO();
        changeRequestDTO1.setId(1L);
        ChangeRequestDTO changeRequestDTO2 = new ChangeRequestDTO();
        assertThat(changeRequestDTO1).isNotEqualTo(changeRequestDTO2);
        changeRequestDTO2.setId(changeRequestDTO1.getId());
        assertThat(changeRequestDTO1).isEqualTo(changeRequestDTO2);
        changeRequestDTO2.setId(2L);
        assertThat(changeRequestDTO1).isNotEqualTo(changeRequestDTO2);
        changeRequestDTO1.setId(null);
        assertThat(changeRequestDTO1).isNotEqualTo(changeRequestDTO2);
    }
}
