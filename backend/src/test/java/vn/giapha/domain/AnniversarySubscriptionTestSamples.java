package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class AnniversarySubscriptionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static AnniversarySubscription getAnniversarySubscriptionSample1() {
        return new AnniversarySubscription().id(1L).userId("userId1").daysBefore(1).channels("channels1");
    }

    public static AnniversarySubscription getAnniversarySubscriptionSample2() {
        return new AnniversarySubscription().id(2L).userId("userId2").daysBefore(2).channels("channels2");
    }

    public static AnniversarySubscription getAnniversarySubscriptionRandomSampleGenerator() {
        return new AnniversarySubscription()
            .id(longCount.incrementAndGet())
            .userId(UUID.randomUUID().toString())
            .daysBefore(intCount.incrementAndGet())
            .channels(UUID.randomUUID().toString());
    }
}
