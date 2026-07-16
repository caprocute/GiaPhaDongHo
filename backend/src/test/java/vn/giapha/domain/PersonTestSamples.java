package vn.giapha.domain;

import java.util.Random;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.concurrent.atomic.AtomicLong;

public class PersonTestSamples {

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);
    private static final AtomicInteger intCount = new AtomicInteger(random.nextInt() + 2 * Short.MAX_VALUE);

    public static Person getPersonSample1() {
        return new Person()
            .id(1L)
            .code("code1")
            .fullName("fullName1")
            .tenHuy("tenHuy1")
            .tenThuong("tenThuong1")
            .gender("gender1")
            .lifeStatus("lifeStatus1")
            .generation(1)
            .lineagePath("lineagePath1")
            .privacy("privacy1")
            .linkedUserId("linkedUserId1")
            .version(1);
    }

    public static Person getPersonSample2() {
        return new Person()
            .id(2L)
            .code("code2")
            .fullName("fullName2")
            .tenHuy("tenHuy2")
            .tenThuong("tenThuong2")
            .gender("gender2")
            .lifeStatus("lifeStatus2")
            .generation(2)
            .lineagePath("lineagePath2")
            .privacy("privacy2")
            .linkedUserId("linkedUserId2")
            .version(2);
    }

    public static Person getPersonRandomSampleGenerator() {
        return new Person()
            .id(longCount.incrementAndGet())
            .code(UUID.randomUUID().toString())
            .fullName(UUID.randomUUID().toString())
            .tenHuy(UUID.randomUUID().toString())
            .tenThuong(UUID.randomUUID().toString())
            .gender(UUID.randomUUID().toString())
            .lifeStatus(UUID.randomUUID().toString())
            .generation(intCount.incrementAndGet())
            .lineagePath(UUID.randomUUID().toString())
            .privacy(UUID.randomUUID().toString())
            .linkedUserId(UUID.randomUUID().toString())
            .version(intCount.incrementAndGet());
    }
}
