package vn.giapha.notification.internal;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.Test;
import vn.giapha.domain.DeathAnniversary;
import vn.giapha.domain.Person;

class ICalBuilderUnitTest {

    private final ICalBuilder builder = new ICalBuilder();

    @Test
    void buildsVcalendarWithEvent() {
        Person p = new Person();
        p.setCode("A1");
        p.setFullName("Hoàng Văn Thành");
        DeathAnniversary ann = new DeathAnniversary();
        ann.setId(1L);
        ann.setLunarDay(14);
        ann.setLunarMonth(6);
        ann.setLeapMonth(false);
        ann.setPerson(p);

        String ics = builder.buildTreeCalendar("Giỗ họ", "ho-hoang", List.of(ann), 2026);
        assertThat(ics).contains("BEGIN:VCALENDAR");
        assertThat(ics).contains("BEGIN:VEVENT");
        assertThat(ics).contains("SUMMARY:Giỗ Hoàng Văn Thành");
        assertThat(ics).contains("END:VCALENDAR");
    }
}
