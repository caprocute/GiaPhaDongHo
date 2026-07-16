package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class UnionMemberTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static UnionMember getUnionMemberSample1() {
        return new UnionMember().id(1L).role("role1");
    }

    public static UnionMember getUnionMemberSample2() {
        return new UnionMember().id(2L).role("role2");
    }

    public static UnionMember getUnionMemberRandomSampleGenerator() {
        return new UnionMember().id(longCount.incrementAndGet()).role(UUID.randomUUID().toString());
    }
}
