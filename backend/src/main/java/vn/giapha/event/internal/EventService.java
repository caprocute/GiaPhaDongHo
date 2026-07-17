package vn.giapha.event.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.core.lunar.LunarCalendar;
import vn.giapha.core.lunar.LunarDate;
import vn.giapha.domain.ClanEvent;
import vn.giapha.domain.EventRsvp;
import vn.giapha.domain.FamilyTree;
import vn.giapha.event.events.RsvpSubmitted;
import vn.giapha.repository.ClanEventRepository;
import vn.giapha.repository.EventRsvpRepository;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.service.dto.ClanEventDTO;
import vn.giapha.service.dto.EventRsvpDTO;
import vn.giapha.service.mapper.ClanEventMapper;
import vn.giapha.service.mapper.EventRsvpMapper;
import vn.giapha.service.mapper.FamilyTreeMapper;

/**
 * Họp họ / giỗ tổ: sự kiện + RSVP theo hộ (R2.3 / F6).
 */
@Service
@Transactional
public class EventService {

    private static final Logger LOG = LoggerFactory.getLogger(EventService.class);
    private static final ZoneId VN = ZoneId.of("Asia/Ho_Chi_Minh");

    private final ClanEventRepository eventRepository;
    private final EventRsvpRepository rsvpRepository;
    private final FamilyTreeRepository familyTreeRepository;
    private final ClanEventMapper eventMapper;
    private final EventRsvpMapper rsvpMapper;
    private final FamilyTreeMapper familyTreeMapper;
    private final ApplicationEventPublisher events;
    private final ObjectMapper objectMapper;

    public EventService(
        ClanEventRepository eventRepository,
        EventRsvpRepository rsvpRepository,
        FamilyTreeRepository familyTreeRepository,
        ClanEventMapper eventMapper,
        EventRsvpMapper rsvpMapper,
        FamilyTreeMapper familyTreeMapper,
        ApplicationEventPublisher events,
        ObjectMapper objectMapper
    ) {
        this.eventRepository = eventRepository;
        this.rsvpRepository = rsvpRepository;
        this.familyTreeRepository = familyTreeRepository;
        this.eventMapper = eventMapper;
        this.rsvpMapper = rsvpMapper;
        this.familyTreeMapper = familyTreeMapper;
        this.events = events;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> listEvents(String treeSlug) {
        FamilyTree tree = requireTree(treeSlug);
        return eventRepository
            .findByTreeIdOrderByStartSolarDesc(tree.getId())
            .stream()
            .map(this::toEventView)
            .toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getEvent(String treeSlug, Long id) {
        return toEventView(requireEvent(treeSlug, id));
    }

    public ClanEventDTO upsertEvent(String treeSlug, ClanEventDTO dto) {
        FamilyTree tree = requireTree(treeSlug);
        if (dto.getTitle() == null || dto.getTitle().isBlank()) {
            throw new IllegalArgumentException("title bắt buộc");
        }
        fillLunarIfNeeded(dto);

        ClanEvent entity;
        if (dto.getId() != null) {
            entity = requireEvent(treeSlug, dto.getId());
            entity.setTitle(dto.getTitle().trim());
            entity.setStartSolar(dto.getStartSolar());
            entity.setLunarJson(dto.getLunarJson());
            entity.setLocation(dto.getLocation());
            entity.setChecklistJson(dto.getChecklistJson());
        } else {
            dto.setTree(familyTreeMapper.toDto(tree));
            entity = eventMapper.toEntity(dto);
            entity.setId(null);
            entity.setTree(tree);
            entity.setTitle(dto.getTitle().trim());
        }
        return eventMapper.toDto(eventRepository.save(entity));
    }

    public EventRsvpDTO submitRsvp(String treeSlug, Long eventId, EventRsvpDTO dto) {
        ClanEvent event = requireEvent(treeSlug, eventId);
        if (dto.getHouseholdName() == null || dto.getHouseholdName().isBlank()) {
            throw new IllegalArgumentException("householdName bắt buộc");
        }
        String household = dto.getHouseholdName().trim();
        EventRsvp entity = rsvpRepository
            .findByEventIdAndHouseholdNameIgnoreCase(eventId, household)
            .orElseGet(EventRsvp::new);
        boolean isNew = entity.getId() == null;
        entity.setEvent(event);
        entity.setHouseholdName(household);
        entity.setHeadcount(dto.getHeadcount() == null ? 1 : dto.getHeadcount());
        entity.setVehicles(dto.getVehicles() == null ? 0 : dto.getVehicles());
        if (dto.getAssignment() != null) {
            entity.setAssignment(dto.getAssignment());
        } else if (isNew) {
            entity.setAssignment(null);
        }
        entity = rsvpRepository.save(entity);
        events.publishEvent(
            new RsvpSubmitted(entity.getId(), eventId, entity.getHouseholdName(), entity.getHeadcount() == null ? 0 : entity.getHeadcount())
        );
        LOG.info("rsvp event={} household={} headcount={}", eventId, household, entity.getHeadcount());
        return rsvpMapper.toDto(entity);
    }

    public EventRsvpDTO assign(String treeSlug, Long rsvpId, String assignment) {
        EventRsvp rsvp = requireRsvp(treeSlug, rsvpId);
        rsvp.setAssignment(assignment == null || assignment.isBlank() ? null : assignment.trim());
        return rsvpMapper.toDto(rsvpRepository.save(rsvp));
    }

    @Transactional(readOnly = true)
    public List<EventRsvpDTO> listRsvps(String treeSlug, Long eventId) {
        requireEvent(treeSlug, eventId);
        return rsvpRepository.findByEventIdOrderByIdAsc(eventId).stream().map(rsvpMapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> stats(String treeSlug, Long eventId) {
        requireEvent(treeSlug, eventId);
        List<EventRsvp> rows = rsvpRepository.findByEventIdOrderByIdAsc(eventId);
        int households = rows.size();
        int people = rows.stream().mapToInt(r -> r.getHeadcount() == null ? 0 : r.getHeadcount()).sum();
        int vehicles = rows.stream().mapToInt(r -> r.getVehicles() == null ? 0 : r.getVehicles()).sum();
        Map<String, Object> m = new HashMap<>();
        m.put("households", households);
        m.put("people", people);
        m.put("vehicles", vehicles);
        return m;
    }

    private Map<String, Object> toEventView(ClanEvent e) {
        Map<String, Object> m = new HashMap<>();
        m.put("event", eventMapper.toDto(e));
        m.put("albumId", extractAlbumId(e.getChecklistJson()));
        if (e.getId() != null) {
            List<EventRsvp> rows = rsvpRepository.findByEventIdOrderByIdAsc(e.getId());
            Map<String, Object> st = new HashMap<>();
            st.put("households", rows.size());
            st.put("people", rows.stream().mapToInt(r -> r.getHeadcount() == null ? 0 : r.getHeadcount()).sum());
            st.put("vehicles", rows.stream().mapToInt(r -> r.getVehicles() == null ? 0 : r.getVehicles()).sum());
            m.put("stats", st);
        }
        return m;
    }

    private void fillLunarIfNeeded(ClanEventDTO dto) {
        if (dto.getLunarJson() != null && !dto.getLunarJson().isBlank()) {
            return;
        }
        Instant start = dto.getStartSolar();
        if (start == null) {
            return;
        }
        ZonedDateTime z = start.atZone(VN);
        LunarDate lunar = LunarCalendar.convertSolarToLunar(z.getDayOfMonth(), z.getMonthValue(), z.getYear());
        try {
            ObjectNode n = objectMapper.createObjectNode();
            n.put("day", lunar.day());
            n.put("month", lunar.month());
            n.put("year", lunar.year());
            n.put("leap", lunar.leap());
            dto.setLunarJson(objectMapper.writeValueAsString(n));
        } catch (Exception ex) {
            LOG.warn("Không ghi lunarJson: {}", ex.getMessage());
        }
    }

    private Long extractAlbumId(String checklistJson) {
        if (checklistJson == null || checklistJson.isBlank()) {
            return null;
        }
        try {
            var n = objectMapper.readTree(checklistJson.trim());
            if (n.hasNonNull("albumId")) {
                return n.get("albumId").asLong();
            }
        } catch (Exception ignored) {
            // ignore
        }
        return null;
    }

    private FamilyTree requireTree(String slug) {
        return familyTreeRepository
            .findBySlug(slug)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cây slug=" + slug));
    }

    private ClanEvent requireEvent(String treeSlug, Long id) {
        ClanEvent e = eventRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy sự kiện id=" + id));
        if (e.getTree() == null || e.getTree().getSlug() == null || !e.getTree().getSlug().equals(treeSlug)) {
            throw new IllegalArgumentException("Sự kiện không thuộc cây " + treeSlug);
        }
        return e;
    }

    private EventRsvp requireRsvp(String treeSlug, Long id) {
        EventRsvp r = rsvpRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy RSVP id=" + id));
        if (r.getEvent() == null || r.getEvent().getId() == null) {
            throw new IllegalArgumentException("RSVP thiếu sự kiện");
        }
        requireEvent(treeSlug, r.getEvent().getId());
        return r;
    }
}
