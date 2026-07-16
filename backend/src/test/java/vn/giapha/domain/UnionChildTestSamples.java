package vn.giapha.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class UnionChildTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static UnionChild getUnionChildSample1() {
        return new UnionChild().id(1L).orderNo(1);
    }

    public static UnionChild getUnionChildSample2() {
        return new UnionChild().id(2L).orderNo(2);
    }

    public static UnionChild getUnionChildRandomSampleGenerator() {
        return new UnionChild().id(longCount.incrementAndGet()).orderNo(intCount.incrementAndGet());
    }
}
