package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ChangeRequestTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static ChangeRequest getChangeRequestSample1() {
        return new ChangeRequest()
            .id(1L)
            .requesterUserId("requesterUserId1")
            .entityType("entityType1")
            .summary("summary1")
            .status("status1");
    }

    public static ChangeRequest getChangeRequestSample2() {
        return new ChangeRequest()
            .id(2L)
            .requesterUserId("requesterUserId2")
            .entityType("entityType2")
            .summary("summary2")
            .status("status2");
    }

    public static ChangeRequest getChangeRequestRandomSampleGenerator() {
        return new ChangeRequest()
            .id(longCount.incrementAndGet())
            .requesterUserId(UUID.randomUUID().toString())
            .entityType(UUID.randomUUID().toString())
            .summary(UUID.randomUUID().toString())
            .status(UUID.randomUUID().toString());
    }
}
