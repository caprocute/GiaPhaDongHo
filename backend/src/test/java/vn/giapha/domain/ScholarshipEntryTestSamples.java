package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ScholarshipEntryTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static ScholarshipEntry getScholarshipEntrySample1() {
        return new ScholarshipEntry().id(1L).personName("personName1").achievement("achievement1").year(1).status("status1");
    }

    public static ScholarshipEntry getScholarshipEntrySample2() {
        return new ScholarshipEntry().id(2L).personName("personName2").achievement("achievement2").year(2).status("status2");
    }

    public static ScholarshipEntry getScholarshipEntryRandomSampleGenerator() {
        return new ScholarshipEntry()
            .id(longCount.incrementAndGet())
            .personName(UUID.randomUUID().toString())
            .achievement(UUID.randomUUID().toString())
            .year(intCount.incrementAndGet())
            .status(UUID.randomUUID().toString());
    }
}
