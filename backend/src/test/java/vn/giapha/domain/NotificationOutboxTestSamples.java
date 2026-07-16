package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class NotificationOutboxTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static NotificationOutbox getNotificationOutboxSample1() {
        return new NotificationOutbox().id(1L).channel("channel1").status("status1");
    }

    public static NotificationOutbox getNotificationOutboxSample2() {
        return new NotificationOutbox().id(2L).channel("channel2").status("status2");
    }

    public static NotificationOutbox getNotificationOutboxRandomSampleGenerator() {
        return new NotificationOutbox()
            .id(longCount.incrementAndGet())
            .channel(UUID.randomUUID().toString())
            .status(UUID.randomUUID().toString());
    }
}
