package vn.giapha.domain;

import java.util.Random;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class FamilyUnionTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static FamilyUnion getFamilyUnionSample1() {
        return new FamilyUnion().id(1L).orderNo(1);
    }

    public static FamilyUnion getFamilyUnionSample2() {
        return new FamilyUnion().id(2L).orderNo(2);
    }

    public static FamilyUnion getFamilyUnionRandomSampleGenerator() {
        return new FamilyUnion().id(longCount.incrementAndGet()).orderNo(intCount.incrementAndGet());
    }
}
