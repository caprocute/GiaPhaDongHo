package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class DeathAnniversaryDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(DeathAnniversaryDTO.class);
        DeathAnniversaryDTO deathAnniversaryDTO1 = new DeathAnniversaryDTO();
        deathAnniversaryDTO1.setId(1L);
        DeathAnniversaryDTO deathAnniversaryDTO2 = new DeathAnniversaryDTO();
        assertThat(deathAnniversaryDTO1).isNotEqualTo(deathAnniversaryDTO2);
        deathAnniversaryDTO2.setId(deathAnniversaryDTO1.getId());
        assertThat(deathAnniversaryDTO1).isEqualTo(deathAnniversaryDTO2);
        deathAnniversaryDTO2.setId(2L);
        assertThat(deathAnniversaryDTO1).isNotEqualTo(deathAnniversaryDTO2);
        deathAnniversaryDTO1.setId(null);
        assertThat(deathAnniversaryDTO1).isNotEqualTo(deathAnniversaryDTO2);
    }
}
