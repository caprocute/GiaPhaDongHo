package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class DeathAnniversaryTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static DeathAnniversary getDeathAnniversarySample1() {
        return new DeathAnniversary().id(1L).lunarDay(1).lunarMonth(1).canChi("canChi1").note("note1");
    }

    public static DeathAnniversary getDeathAnniversarySample2() {
        return new DeathAnniversary().id(2L).lunarDay(2).lunarMonth(2).canChi("canChi2").note("note2");
    }

    public static DeathAnniversary getDeathAnniversaryRandomSampleGenerator() {
        return new DeathAnniversary()
            .id(longCount.incrementAndGet())
            .lunarDay(intCount.incrementAndGet())
            .lunarMonth(intCount.incrementAndGet())
            .canChi(UUID.randomUUID().toString())
            .note(UUID.randomUUID().toString());
    }
}
