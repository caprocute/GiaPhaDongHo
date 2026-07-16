package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class MediaPhotoTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static MediaPhoto getMediaPhotoSample1() {
        return new MediaPhoto().id(1L).objectKey("objectKey1").caption("caption1").blurhash("blurhash1").viewCount(1L);
    }

    public static MediaPhoto getMediaPhotoSample2() {
        return new MediaPhoto().id(2L).objectKey("objectKey2").caption("caption2").blurhash("blurhash2").viewCount(2L);
    }

    public static MediaPhoto getMediaPhotoRandomSampleGenerator() {
        return new MediaPhoto()
            .id(longCount.incrementAndGet())
            .objectKey(UUID.randomUUID().toString())
            .caption(UUID.randomUUID().toString())
            .blurhash(UUID.randomUUID().toString())
            .viewCount(longCount.incrementAndGet());
    }
}
