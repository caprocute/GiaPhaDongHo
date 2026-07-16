package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class FamilyTreeTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static FamilyTree getFamilyTreeSample1() {
        return new FamilyTree().id(1L).slug("slug1").surname("surname1").branchName("branchName1").provinceCode("provinceCode1");
    }

    public static FamilyTree getFamilyTreeSample2() {
        return new FamilyTree().id(2L).slug("slug2").surname("surname2").branchName("branchName2").provinceCode("provinceCode2");
    }

    public static FamilyTree getFamilyTreeRandomSampleGenerator() {
        return new FamilyTree()
            .id(longCount.incrementAndGet())
            .slug(UUID.randomUUID().toString())
            .surname(UUID.randomUUID().toString())
            .branchName(UUID.randomUUID().toString())
            .provinceCode(UUID.randomUUID().toString());
    }
}
