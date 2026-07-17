package vn.giapha.moderation.internal;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.Instant;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.ChangeRequest;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.Person;
import vn.giapha.genealogy.api.DeathAnniversarySync;
import vn.giapha.genealogy.api.TreeSettingsDTO;
import vn.giapha.genealogy.api.TreeSettingsQuery;
import vn.giapha.moderation.api.ChangeRequestStatuses;
import vn.giapha.moderation.events.ChangeApproved;
import vn.giapha.moderation.events.ChangeRejected;
import vn.giapha.repository.ChangeRequestRepository;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.repository.PersonRepository;
import vn.giapha.service.dto.ChangeRequestDTO;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.dto.PersonDTO;
import vn.giapha.service.mapper.ChangeRequestMapper;
import vn.giapha.service.mapper.FamilyTreeMapper;
import vn.giapha.service.mapper.PersonMapper;

/**
 * Hàng đợi tự khai: submit → duyệt/từ chối → áp diff Person (R2.1 / F3).
 */
@Service
@Transactional
public class ModerationService {

    private static final Logger LOG = LoggerFactory.getLogger(ModerationService.class);

    private final ChangeRequestRepository changeRequestRepository;
    private final FamilyTreeRepository familyTreeRepository;
    private final PersonRepository personRepository;
    private final ChangeRequestMapper changeRequestMapper;
    private final FamilyTreeMapper familyTreeMapper;
    private final PersonMapper personMapper;
    private final DeathAnniversarySync deathAnniversarySync;
    private final TreeSettingsQuery treeSettingsQuery;
    private final ApplicationEventPublisher events;
    private final ObjectMapper objectMapper;

    public ModerationService(
        ChangeRequestRepository changeRequestRepository,
        FamilyTreeRepository familyTreeRepository,
        PersonRepository personRepository,
        ChangeRequestMapper changeRequestMapper,
        FamilyTreeMapper familyTreeMapper,
        PersonMapper personMapper,
        DeathAnniversarySync deathAnniversarySync,
        TreeSettingsQuery treeSettingsQuery,
        ApplicationEventPublisher events,
        ObjectMapper objectMapper
    ) {
        this.changeRequestRepository = changeRequestRepository;
        this.familyTreeRepository = familyTreeRepository;
        this.personRepository = personRepository;
        this.changeRequestMapper = changeRequestMapper;
        this.familyTreeMapper = familyTreeMapper;
        this.personMapper = personMapper;
        this.deathAnniversarySync = deathAnniversarySync;
        this.treeSettingsQuery = treeSettingsQuery;
        this.events = events;
        this.objectMapper = objectMapper;
    }

    public ChangeRequestDTO submit(String treeSlug, String requesterUserId, ChangeRequestDTO dto) {
        FamilyTree tree = familyTreeRepository
            .findBySlug(treeSlug)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cây slug=" + treeSlug));

        TreeSettingsDTO settings = treeSettingsQuery.findBySlug(treeSlug).orElse(null);
        if (settings != null && settings.getTree() != null && !settings.getTree().isAllowSelfDeclare()) {
            throw new IllegalStateException("Dòng họ đang tạm khóa chức năng tự khai hồ sơ.");
        }

        if (dto.getDiffJson() == null || dto.getDiffJson().isBlank()) {
            throw new IllegalArgumentException("diffJson bắt buộc");
        }
        if (dto.getEntityType() == null || dto.getEntityType().isBlank()) {
            dto.setEntityType(ChangeRequestStatuses.ENTITY_PERSON);
        }

        dto.setId(null);
        dto.setRequesterUserId(requesterUserId);
        dto.setStatus(ChangeRequestStatuses.PENDING);
        dto.setCreatedAt(Instant.now());
        dto.setReviewedAt(null);
        dto.setReviewerNote(null);
        FamilyTreeDTO treeDto = familyTreeMapper.toDto(tree);
        dto.setTree(treeDto);

        if (dto.getPerson() != null && dto.getPerson().getId() != null) {
            Person person = personRepository
                .findById(dto.getPerson().getId())
                .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy person id=" + dto.getPerson().getId()));
            if (person.getTree() == null || !tree.getId().equals(person.getTree().getId())) {
                throw new IllegalArgumentException("Person không thuộc cây " + treeSlug);
            }
            dto.setPerson(personMapper.toDto(person));
        }

        ChangeRequest entity = changeRequestMapper.toEntity(dto);
        entity.setTree(tree);
        if (dto.getPerson() != null && dto.getPerson().getId() != null) {
            entity.setPerson(personRepository.getReferenceById(dto.getPerson().getId()));
        }
        entity = changeRequestRepository.save(entity);
        LOG.info("ChangeRequest #{} submitted tree={} by={}", entity.getId(), treeSlug, requesterUserId);
        return changeRequestMapper.toDto(entity);
    }

    @Transactional(readOnly = true)
    public List<ChangeRequestDTO> list(String treeSlug, String status) {
        String st = blankToNull(status);
        return changeRequestRepository
            .findByTreeSlugAndOptionalStatus(treeSlug, st)
            .stream()
            .map(changeRequestMapper::toDto)
            .toList();
    }

    public ChangeRequestDTO approve(Long id, String reviewerNote) {
        ChangeRequest cr = requirePending(id);
        applyDiff(cr);
        cr.setStatus(ChangeRequestStatuses.APPROVED);
        cr.setReviewedAt(Instant.now());
        cr.setReviewerNote(reviewerNote);
        cr = changeRequestRepository.save(cr);
        String slug = cr.getTree() != null ? cr.getTree().getSlug() : "";
        Long personId = cr.getPerson() != null ? cr.getPerson().getId() : null;
        events.publishEvent(new ChangeApproved(cr.getId(), slug, personId, cr.getEntityType(), cr.getDiffJson()));
        return changeRequestMapper.toDto(cr);
    }

    public ChangeRequestDTO reject(Long id, String reviewerNote) {
        ChangeRequest cr = requirePending(id);
        cr.setStatus(ChangeRequestStatuses.REJECTED);
        cr.setReviewedAt(Instant.now());
        cr.setReviewerNote(reviewerNote != null ? reviewerNote : "Từ chối");
        cr = changeRequestRepository.save(cr);
        String slug = cr.getTree() != null ? cr.getTree().getSlug() : "";
        events.publishEvent(new ChangeRejected(cr.getId(), slug, cr.getReviewerNote()));
        return changeRequestMapper.toDto(cr);
    }

    private ChangeRequest requirePending(Long id) {
        ChangeRequest cr = changeRequestRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy change-request #" + id));
        if (!ChangeRequestStatuses.PENDING.equalsIgnoreCase(cr.getStatus())) {
            throw new IllegalStateException("Chỉ duyệt được yêu cầu đang pending (hiện: " + cr.getStatus() + ")");
        }
        return cr;
    }

    private void applyDiff(ChangeRequest cr) {
        if (!ChangeRequestStatuses.ENTITY_PERSON.equalsIgnoreCase(cr.getEntityType())) {
            LOG.warn("entityType={} chưa hỗ trợ apply — chỉ đánh dấu approved", cr.getEntityType());
            return;
        }
        if (cr.getPerson() == null || cr.getPerson().getId() == null) {
            throw new IllegalStateException("Duyệt sửa người cần gắn person");
        }
        Person person = personRepository
            .findOneWithEagerRelationships(cr.getPerson().getId())
            .orElseThrow(() -> new IllegalArgumentException("Person không tồn tại"));
        try {
            JsonNode root = objectMapper.readTree(cr.getDiffJson());
            JsonNode fields = root.has("fields") ? root.get("fields") : root;
            patchPerson(person, fields);
            person = personRepository.save(person);
            deathAnniversarySync.syncFromPerson(person);
        } catch (IllegalStateException | IllegalArgumentException e) {
            throw e;
        } catch (Exception e) {
            throw new IllegalArgumentException("diffJson không hợp lệ: " + e.getMessage(), e);
        }
    }

    static void patchPerson(Person person, JsonNode fields) {
        if (fields == null || !fields.isObject()) {
            return;
        }
        if (fields.hasNonNull("fullName")) {
            person.setFullName(fields.get("fullName").asText());
        }
        if (fields.has("tenHuy")) {
            person.setTenHuy(textOrNull(fields.get("tenHuy")));
        }
        if (fields.has("tenThuong")) {
            person.setTenThuong(textOrNull(fields.get("tenThuong")));
        }
        if (fields.hasNonNull("gender")) {
            person.setGender(fields.get("gender").asText());
        }
        if (fields.hasNonNull("lifeStatus")) {
            person.setLifeStatus(fields.get("lifeStatus").asText());
        }
        if (fields.has("generation") && fields.get("generation").canConvertToInt()) {
            person.setGeneration(fields.get("generation").asInt());
        }
        if (fields.has("birthSolar")) {
            person.setBirthSolar(parseDate(fields.get("birthSolar")));
        }
        if (fields.has("birthLunarJson")) {
            person.setBirthLunarJson(textOrNull(fields.get("birthLunarJson")));
        }
        if (fields.has("deathSolar")) {
            person.setDeathSolar(parseDate(fields.get("deathSolar")));
        }
        if (fields.has("deathLunarJson")) {
            person.setDeathLunarJson(textOrNull(fields.get("deathLunarJson")));
        }
        if (fields.has("notes")) {
            person.setNotes(textOrNull(fields.get("notes")));
        }
        if (fields.has("privacy")) {
            person.setPrivacy(textOrNull(fields.get("privacy")));
        }
        if (fields.has("biography")) {
            person.setBiography(textOrNull(fields.get("biography")));
        }
    }

    private static String textOrNull(JsonNode n) {
        if (n == null || n.isNull()) {
            return null;
        }
        String t = n.asText();
        return t.isBlank() ? null : t;
    }

    private static LocalDate parseDate(JsonNode n) {
        if (n == null || n.isNull()) {
            return null;
        }
        String t = n.asText();
        if (t == null || t.isBlank()) {
            return null;
        }
        return LocalDate.parse(t.length() >= 10 ? t.substring(0, 10) : t);
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t.toLowerCase(Locale.ROOT);
    }
}
