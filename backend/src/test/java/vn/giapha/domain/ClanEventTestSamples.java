package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class ClanEventTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static ClanEvent getClanEventSample1() {
        return new ClanEvent().id(1L).title("title1").location("location1");
    }

    public static ClanEvent getClanEventSample2() {
        return new ClanEvent().id(2L).title("title2").location("location2");
    }

    public static ClanEvent getClanEventRandomSampleGenerator() {
        return new ClanEvent().id(longCount.incrementAndGet()).title(UUID.randomUUID().toString()).location(UUID.randomUUID().toString());
    }
}
