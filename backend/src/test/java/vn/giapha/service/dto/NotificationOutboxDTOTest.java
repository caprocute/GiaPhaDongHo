package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class NotificationOutboxDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(NotificationOutboxDTO.class);
        NotificationOutboxDTO notificationOutboxDTO1 = new NotificationOutboxDTO();
        notificationOutboxDTO1.setId(1L);
        NotificationOutboxDTO notificationOutboxDTO2 = new NotificationOutboxDTO();
        assertThat(notificationOutboxDTO1).isNotEqualTo(notificationOutboxDTO2);
        notificationOutboxDTO2.setId(notificationOutboxDTO1.getId());
        assertThat(notificationOutboxDTO1).isEqualTo(notificationOutboxDTO2);
        notificationOutboxDTO2.setId(2L);
        assertThat(notificationOutboxDTO1).isNotEqualTo(notificationOutboxDTO2);
        notificationOutboxDTO1.setId(null);
        assertThat(notificationOutboxDTO1).isNotEqualTo(notificationOutboxDTO2);
    }
}
