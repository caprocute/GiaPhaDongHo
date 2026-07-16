package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class DonationCampaignTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static DonationCampaign getDonationCampaignSample1() {
        return new DonationCampaign().id(1L).title("title1").status("status1");
    }

    public static DonationCampaign getDonationCampaignSample2() {
        return new DonationCampaign().id(2L).title("title2").status("status2");
    }

    public static DonationCampaign getDonationCampaignRandomSampleGenerator() {
        return new DonationCampaign()
            .id(longCount.incrementAndGet())
            .title(UUID.randomUUID().toString())
            .status(UUID.randomUUID().toString());
    }
}
