package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class CmsCategoryTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static CmsCategory getCmsCategorySample1() {
        return new CmsCategory().id(1L).slug("slug1").name("name1").layout("layout1");
    }

    public static CmsCategory getCmsCategorySample2() {
        return new CmsCategory().id(2L).slug("slug2").name("name2").layout("layout2");
    }

    public static CmsCategory getCmsCategoryRandomSampleGenerator() {
        return new CmsCategory()
            .id(longCount.incrementAndGet())
            .slug(UUID.randomUUID().toString())
            .name(UUID.randomUUID().toString())
            .layout(UUID.randomUUID().toString());
    }
}
