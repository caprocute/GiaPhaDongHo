package vn.giapha.notification.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.core.lunar.LunarCalendar;
import vn.giapha.core.lunar.SolarDate;
import vn.giapha.domain.AnniversarySubscription;
import vn.giapha.domain.DeathAnniversary;
import vn.giapha.domain.NotificationOutbox;
import vn.giapha.domain.Person;
import vn.giapha.notification.api.NotifyChannels;
import vn.giapha.notification.events.ReminderQueued;
import vn.giapha.repository.AnniversarySubscriptionRepository;
import vn.giapha.repository.DeathAnniversaryRepository;
import vn.giapha.repository.NotificationOutboxRepository;

/**
 * Mỗi ngày: với mỗi subscription, nếu hôm nay = ngày giỗ dương − daysBefore → enqueue outbox.
 */
@Service
public class ReminderPlanner {

    private static final Logger LOG = LoggerFactory.getLogger(ReminderPlanner.class);
    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final AnniversarySubscriptionRepository subscriptionRepository;
    private final DeathAnniversaryRepository deathAnniversaryRepository;
    private final NotificationOutboxRepository outboxRepository;
    private final ObjectMapper objectMapper;
    private final ApplicationEventPublisher events;

    public ReminderPlanner(
        AnniversarySubscriptionRepository subscriptionRepository,
        DeathAnniversaryRepository deathAnniversaryRepository,
        NotificationOutboxRepository outboxRepository,
        ObjectMapper objectMapper,
        ApplicationEventPublisher events
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.deathAnniversaryRepository = deathAnniversaryRepository;
        this.outboxRepository = outboxRepository;
        this.objectMapper = objectMapper;
        this.events = events;
    }

    @Transactional
    public int planForToday() {
        LocalDate today = LocalDate.now(VN);
        int year = today.getYear();
        List<AnniversarySubscription> subs = subscriptionRepository.findAllWithEagerRelationships();
        int queued = 0;
        for (AnniversarySubscription sub : subs) {
            if (sub.getPerson() == null || sub.getPerson().getId() == null) {
                continue;
            }
            DeathAnniversary ann = deathAnniversaryRepository.findByPerson_Id(sub.getPerson().getId()).orElse(null);
            if (ann == null || ann.getLunarDay() == null || ann.getLunarMonth() == null) {
                continue;
            }
            boolean leap = Boolean.TRUE.equals(ann.getLeapMonth());
            SolarDate solar;
            try {
                solar = LunarCalendar.convertLunarToSolar(ann.getLunarDay(), ann.getLunarMonth(), year, leap);
            } catch (Exception e) {
                LOG.debug("Không quy đổi giỗ personId={}: {}", sub.getPerson().getId(), e.getMessage());
                continue;
            }
            LocalDate gioDate = LocalDate.of(solar.year(), solar.month(), solar.day());
            int daysBefore = sub.getDaysBefore() == null ? 3 : Math.max(0, sub.getDaysBefore());
            LocalDate remindOn = gioDate.minusDays(daysBefore);
            if (!remindOn.equals(today)) {
                continue;
            }
            for (String channel : parseChannels(sub.getChannels())) {
                String dedupe = "remind:" + sub.getId() + ":" + ann.getId() + ":" + channel + ":" + today;
                if (outboxRepository.existsByPayloadJsonContaining(dedupe)) {
                    continue;
                }
                NotificationOutbox out = buildOutbox(sub, ann, channel, dedupe, gioDate);
                out = outboxRepository.save(out);
                events.publishEvent(
                    new ReminderQueued(out.getId(), channel, sub.getId(), sub.getPerson().getCode())
                );
                queued++;
            }
        }
        LOG.info("ReminderPlanner queued={} for {}", queued, today);
        return queued;
    }

    private NotificationOutbox buildOutbox(
        AnniversarySubscription sub,
        DeathAnniversary ann,
        String channel,
        String dedupe,
        LocalDate gioDate
    ) {
        Person p = sub.getPerson();
        String name = p.getFullName() == null ? p.getCode() : p.getFullName();
        String body = String.format(
            Locale.ROOT,
            "Nhắc: còn %d ngày nữa đến ngày giỗ %s — âm %d/%d%s, dương %s.",
            sub.getDaysBefore() == null ? 3 : sub.getDaysBefore(),
            name,
            ann.getLunarDay(),
            ann.getLunarMonth(),
            Boolean.TRUE.equals(ann.getLeapMonth()) ? " (nhuận)" : "",
            gioDate
        );
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("dedupeKey", dedupe);
        payload.put("subscriptionId", sub.getId());
        payload.put("userId", sub.getUserId());
        payload.put("personCode", p.getCode());
        payload.put("personName", name);
        payload.put("subject", "Nhắc ngày giỗ — " + name);
        payload.put("body", body);
        payload.put("message", body);
        payload.put("solarDate", gioDate.toString());
        payload.put("lunarDay", ann.getLunarDay());
        payload.put("lunarMonth", ann.getLunarMonth());
        if (NotifyChannels.EMAIL.equals(channel)) {
            // to: để trống → EmailChannelSender dùng defaultEmailTo / dry-run
            payload.put("to", "");
        }

        NotificationOutbox out = new NotificationOutbox();
        out.setChannel(channel);
        try {
            out.setPayloadJson(objectMapper.writeValueAsString(payload));
        } catch (Exception e) {
            out.setPayloadJson("{\"dedupeKey\":\"" + dedupe + "\",\"body\":\"" + body.replace("\"", "'") + "\"}");
        }
        out.setStatus(NotifyChannels.STATUS_PENDING);
        out.setCreatedAt(Instant.now());
        return out;
    }

    static List<String> parseChannels(String raw) {
        if (raw == null || raw.isBlank()) {
            return List.of(NotifyChannels.EMAIL);
        }
        List<String> out = new ArrayList<>();
        for (String part : raw.split("[,;\\s]+")) {
            String c = part.trim().toLowerCase(Locale.ROOT);
            if (c.isEmpty()) {
                continue;
            }
            if ("push".equals(c) || "webpush".equals(c)) {
                c = NotifyChannels.WEB_PUSH;
            }
            if (
                NotifyChannels.EMAIL.equals(c) ||
                NotifyChannels.ZALO.equals(c) ||
                NotifyChannels.WEB_PUSH.equals(c)
            ) {
                out.add(c);
            }
        }
        return out.isEmpty() ? List.of(NotifyChannels.EMAIL) : out;
    }
}
