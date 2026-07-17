package vn.giapha.notification.internal;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import org.springframework.stereotype.Component;
import vn.giapha.core.lunar.LunarCalendar;
import vn.giapha.core.lunar.SolarDate;
import vn.giapha.domain.DeathAnniversary;
import vn.giapha.domain.Person;

/** Sinh lịch iCal (RFC 5545) cho ngày giỗ dương lịch năm chỉ định. */
@Component
public class ICalBuilder {

    private static final DateTimeFormatter ICS_DATE = DateTimeFormatter.ofPattern("yyyyMMdd");

    public String buildTreeCalendar(String calendarName, String treeSlug, List<DeathAnniversary> anniversaries, int year) {
        StringBuilder sb = new StringBuilder();
        sb.append("BEGIN:VCALENDAR\r\n");
        sb.append("VERSION:2.0\r\n");
        sb.append("PRODID:-//GiaPhaHub//Reminders//VI\r\n");
        sb.append("CALSCALE:GREGORIAN\r\n");
        sb.append("METHOD:PUBLISH\r\n");
        sb.append("X-WR-CALNAME:").append(escape(calendarName)).append("\r\n");
        for (DeathAnniversary ann : anniversaries) {
            if (ann.getLunarDay() == null || ann.getLunarMonth() == null) {
                continue;
            }
            boolean leap = Boolean.TRUE.equals(ann.getLeapMonth());
            SolarDate solar;
            try {
                solar = LunarCalendar.convertLunarToSolar(ann.getLunarDay(), ann.getLunarMonth(), year, leap);
            } catch (Exception e) {
                continue;
            }
            LocalDate d = LocalDate.of(solar.year(), solar.month(), solar.day());
            Person p = ann.getPerson();
            String summary = p == null
                ? "Ngày giỗ"
                : "Giỗ " + (p.getFullName() == null ? p.getCode() : p.getFullName());
            String uid = "gio-" + treeSlug + "-" + (ann.getId() == null ? UUID.randomUUID() : ann.getId()) + "-" + year + "@giaphahub";
            String desc = String.format(
                "Âm lịch %d/%d%s · cây %s",
                ann.getLunarDay(),
                ann.getLunarMonth(),
                leap ? " nhuận" : "",
                treeSlug
            );
            sb.append("BEGIN:VEVENT\r\n");
            sb.append("UID:").append(uid).append("\r\n");
            sb.append("DTSTAMP:").append(ICS_DATE.format(LocalDate.now())).append("T000000Z\r\n");
            sb.append("DTSTART;VALUE=DATE:").append(ICS_DATE.format(d)).append("\r\n");
            sb.append("SUMMARY:").append(escape(summary)).append("\r\n");
            sb.append("DESCRIPTION:").append(escape(desc)).append("\r\n");
            sb.append("END:VEVENT\r\n");
        }
        sb.append("END:VCALENDAR\r\n");
        return sb.toString();
    }

    private static String escape(String s) {
        if (s == null) {
            return "";
        }
        return s.replace("\\", "\\\\").replace(";", "\\;").replace(",", "\\,").replace("\n", "\\n");
    }
}
