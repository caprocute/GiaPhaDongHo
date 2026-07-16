package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.NotificationOutboxTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class NotificationOutboxTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(NotificationOutbox.class);
        NotificationOutbox notificationOutbox1 = getNotificationOutboxSample1();
        NotificationOutbox notificationOutbox2 = new NotificationOutbox();
        assertThat(notificationOutbox1).isNotEqualTo(notificationOutbox2);

        notificationOutbox2.setId(notificationOutbox1.getId());
        assertThat(notificationOutbox1).isEqualTo(notificationOutbox2);

        notificationOutbox2 = getNotificationOutboxSample2();
        assertThat(notificationOutbox1).isNotEqualTo(notificationOutbox2);
    }
}
