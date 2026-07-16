package vn.giapha.service.mapper;

import static vn.giapha.domain.NotificationOutboxAsserts.*;
import static vn.giapha.domain.NotificationOutboxTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class NotificationOutboxMapperTest {

    private NotificationOutboxMapper notificationOutboxMapper;

    @BeforeEach
    void setUp() {
        notificationOutboxMapper = new NotificationOutboxMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getNotificationOutboxSample1();
        var actual = notificationOutboxMapper.toEntity(notificationOutboxMapper.toDto(expected));
        assertNotificationOutboxAllPropertiesEquals(expected, actual);
    }
}
