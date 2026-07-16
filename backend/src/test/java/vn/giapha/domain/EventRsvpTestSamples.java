package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class EventRsvpTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static EventRsvp getEventRsvpSample1() {
        return new EventRsvp().id(1L).householdName("householdName1").headcount(1).vehicles(1).assignment("assignment1");
    }

    public static EventRsvp getEventRsvpSample2() {
        return new EventRsvp().id(2L).householdName("householdName2").headcount(2).vehicles(2).assignment("assignment2");
    }

    public static EventRsvp getEventRsvpRandomSampleGenerator() {
        return new EventRsvp()
            .id(longCount.incrementAndGet())
            .householdName(UUID.randomUUID().toString())
            .headcount(intCount.incrementAndGet())
            .vehicles(intCount.incrementAndGet())
            .assignment(UUID.randomUUID().toString());
    }
}
