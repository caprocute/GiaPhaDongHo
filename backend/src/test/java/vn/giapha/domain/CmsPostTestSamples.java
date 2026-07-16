package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class CmsPostTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static CmsPost getCmsPostSample1() {
        return new CmsPost().id(1L).slug("slug1").title("title1").status("status1").viewCount(1L).authorName("authorName1");
    }

    public static CmsPost getCmsPostSample2() {
        return new CmsPost().id(2L).slug("slug2").title("title2").status("status2").viewCount(2L).authorName("authorName2");
    }

    public static CmsPost getCmsPostRandomSampleGenerator() {
        return new CmsPost()
            .id(longCount.incrementAndGet())
            .slug(UUID.randomUUID().toString())
            .title(UUID.randomUUID().toString())
            .status(UUID.randomUUID().toString())
            .viewCount(longCount.incrementAndGet())
            .authorName(UUID.randomUUID().toString());
    }
}
