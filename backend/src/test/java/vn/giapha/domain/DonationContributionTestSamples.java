package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class DonationContributionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static DonationContribution getDonationContributionSample1() {
        return new DonationContribution().id(1L).donorName("donorName1").kind("kind1");
    }

    public static DonationContribution getDonationContributionSample2() {
        return new DonationContribution().id(2L).donorName("donorName2").kind("kind2");
    }

    public static DonationContribution getDonationContributionRandomSampleGenerator() {
        return new DonationContribution()
            .id(longCount.incrementAndGet())
            .donorName(UUID.randomUUID().toString())
            .kind(UUID.randomUUID().toString());
    }
}
