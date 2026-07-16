package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class ChapterTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static Chapter getChapterSample1() {
        return new Chapter().id(1L).kind("kind1").title("title1").version(1);
    }

    public static Chapter getChapterSample2() {
        return new Chapter().id(2L).kind("kind2").title("title2").version(2);
    }

    public static Chapter getChapterRandomSampleGenerator() {
        return new Chapter()
            .id(longCount.incrementAndGet())
            .kind(UUID.randomUUID().toString())
            .title(UUID.randomUUID().toString())
            .version(intCount.incrementAndGet());
    }
}
