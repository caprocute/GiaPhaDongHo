package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class ClanEventDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClanEventDTO.class);
        ClanEventDTO clanEventDTO1 = new ClanEventDTO();
        clanEventDTO1.setId(1L);
        ClanEventDTO clanEventDTO2 = new ClanEventDTO();
        assertThat(clanEventDTO1).isNotEqualTo(clanEventDTO2);
        clanEventDTO2.setId(clanEventDTO1.getId());
        assertThat(clanEventDTO1).isEqualTo(clanEventDTO2);
        clanEventDTO2.setId(2L);
        assertThat(clanEventDTO1).isNotEqualTo(clanEventDTO2);
        clanEventDTO1.setId(null);
        assertThat(clanEventDTO1).isNotEqualTo(clanEventDTO2);
    }
}
