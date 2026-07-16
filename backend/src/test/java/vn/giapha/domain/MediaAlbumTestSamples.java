package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicLong;

public class MediaAlbumTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    public static MediaAlbum getMediaAlbumSample1() {
        return new MediaAlbum().id(1L).title("title1").coverObjectKey("coverObjectKey1");
    }

    public static MediaAlbum getMediaAlbumSample2() {
        return new MediaAlbum().id(2L).title("title2").coverObjectKey("coverObjectKey2");
    }

    public static MediaAlbum getMediaAlbumRandomSampleGenerator() {
        return new MediaAlbum()
            .id(longCount.incrementAndGet())
            .title(UUID.randomUUID().toString())
            .coverObjectKey(UUID.randomUUID().toString());
    }
}
