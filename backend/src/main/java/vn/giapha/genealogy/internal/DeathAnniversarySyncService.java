package vn.giapha.genealogy.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import java.util.Locale;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.core.lunar.CanChi;
import vn.giapha.core.lunar.LunarCalendar;
import vn.giapha.core.lunar.LunarDate;
import vn.giapha.domain.DeathAnniversary;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.Person;
import vn.giapha.genealogy.api.DeathAnniversarySync;
import vn.giapha.genealogy.events.DeathAnniversaryUpserted;
import vn.giapha.repository.DeathAnniversaryRepository;

/**
 * Upsert / xóa ngày giỗ từ lifeStatus + deathLunarJson|deathSolar — chỉ qua {@code core.lunar}.
 */
@Service
@Transactional
public class DeathAnniversarySyncService implements DeathAnniversarySync {

    private static final Logger LOG = LoggerFactory.getLogger(DeathAnniversarySyncService.class);

    private final DeathAnniversaryRepository deathAnniversaryRepository;
    private final ApplicationEventPublisher events;
    private final ObjectMapper objectMapper;

    public DeathAnniversarySyncService(
        DeathAnniversaryRepository deathAnniversaryRepository,
        ApplicationEventPublisher events,
        ObjectMapper objectMapper
    ) {
        this.deathAnniversaryRepository = deathAnniversaryRepository;
        this.events = events;
        this.objectMapper = objectMapper;
    }

    @Override
    public void syncFromPerson(Person person) {
        if (person == null || person.getId() == null) {
            return;
        }
        if (!isDeceased(person.getLifeStatus())) {
            removeForPerson(person.getId());
            return;
        }

        Optional<LunarDate> lunarOpt = resolveDeathLunar(person);
        if (lunarOpt.isEmpty()) {
            LOG.debug("Person {} deceased nhưng chưa có ngày mất parse được — bỏ qua upsert giỗ", person.getId());
            return;
        }

        FamilyTree tree = person.getTree();
        if (tree == null || tree.getId() == null) {
            LOG.warn("Person {} thiếu tree — không upsert DeathAnniversary", person.getId());
            return;
        }

        LunarDate lunar = lunarOpt.get();
        DeathAnniversary anniversary = deathAnniversaryRepository
            .findByPerson_Id(person.getId())
            .orElseGet(DeathAnniversary::new);

        anniversary.setPerson(person);
        anniversary.setTree(tree);
        anniversary.setLunarDay(lunar.day());
        anniversary.setLunarMonth(lunar.month());
        anniversary.setLeapMonth(lunar.leap());
        anniversary.setCanChi(resolveCanChi(lunar, person.getDeathSolar()));

        anniversary = deathAnniversaryRepository.save(anniversary);
        String slug = tree.getSlug() != null ? tree.getSlug() : "";
        events.publishEvent(
            new DeathAnniversaryUpserted(
                anniversary.getId(),
                person.getId(),
                slug,
                lunar.day(),
                lunar.month(),
                lunar.leap()
            )
        );
        LOG.debug("Upserted DeathAnniversary id={} person={}", anniversary.getId(), person.getId());
    }

    @Override
    public void removeForPerson(Long personId) {
        if (personId == null) {
            return;
        }
        deathAnniversaryRepository.findByPerson_Id(personId).ifPresent(deathAnniversaryRepository::delete);
    }

    static boolean isDeceased(String lifeStatus) {
        if (lifeStatus == null) {
            return false;
        }
        String s = lifeStatus.trim().toLowerCase(Locale.ROOT);
        return "deceased".equals(s) || "dead".equals(s) || "mat".equals(s) || "đã mất".equals(s);
    }

    Optional<LunarDate> resolveDeathLunar(Person person) {
        Optional<LunarDate> fromJson = parseLunarJson(person.getDeathLunarJson());
        if (fromJson.isPresent()) {
            return fromJson;
        }
        LocalDate solar = person.getDeathSolar();
        if (solar == null) {
            return Optional.empty();
        }
        return Optional.of(LunarCalendar.convertSolarToLunar(solar.getDayOfMonth(), solar.getMonthValue(), solar.getYear()));
    }

    Optional<LunarDate> parseLunarJson(String json) {
        if (json == null || json.isBlank()) {
            return Optional.empty();
        }
        try {
            JsonNode n = objectMapper.readTree(json);
            int day = n.path("day").asInt(0);
            int month = n.path("month").asInt(0);
            int year = n.path("year").asInt(0);
            boolean leap = n.path("leap").asBoolean(false);
            if (day < 1 || day > 30 || month < 1 || month > 12) {
                return Optional.empty();
            }
            return Optional.of(new LunarDate(day, month, year, leap));
        } catch (Exception e) {
            LOG.debug("Không parse deathLunarJson: {}", e.getMessage());
            return Optional.empty();
        }
    }

    private static String resolveCanChi(LunarDate lunar, LocalDate deathSolar) {
        if (deathSolar != null) {
            CanChi day = LunarCalendar.getCanChiDay(deathSolar.getDayOfMonth(), deathSolar.getMonthValue(), deathSolar.getYear());
            return day.label();
        }
        if (lunar.year() > 0) {
            return LunarCalendar.getCanChiYear(lunar.year()).label();
        }
        return null;
    }
}
