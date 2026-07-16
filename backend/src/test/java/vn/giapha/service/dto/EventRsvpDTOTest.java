package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class EventRsvpDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(EventRsvpDTO.class);
        EventRsvpDTO eventRsvpDTO1 = new EventRsvpDTO();
        eventRsvpDTO1.setId(1L);
        EventRsvpDTO eventRsvpDTO2 = new EventRsvpDTO();
        assertThat(eventRsvpDTO1).isNotEqualTo(eventRsvpDTO2);
        eventRsvpDTO2.setId(eventRsvpDTO1.getId());
        assertThat(eventRsvpDTO1).isEqualTo(eventRsvpDTO2);
        eventRsvpDTO2.setId(2L);
        assertThat(eventRsvpDTO1).isNotEqualTo(eventRsvpDTO2);
        eventRsvpDTO1.setId(null);
        assertThat(eventRsvpDTO1).isNotEqualTo(eventRsvpDTO2);
    }
}
