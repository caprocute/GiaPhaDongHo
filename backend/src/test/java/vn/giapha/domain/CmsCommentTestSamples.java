package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class CmsCommentTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static CmsComment getCmsCommentSample1() {
        return new CmsComment().id(1L).authorName("authorName1").status("status1");
    }

    public static CmsComment getCmsCommentSample2() {
        return new CmsComment().id(2L).authorName("authorName2").status("status2");
    }

    public static CmsComment getCmsCommentRandomSampleGenerator() {
        return new CmsComment()
            .id(longCount.incrementAndGet())
            .authorName(UUID.randomUUID().toString())
            .status(UUID.randomUUID().toString());
    }
}
