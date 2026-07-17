package vn.giapha.genealogy.internal;

import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.Set;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.FamilyUnion;
import vn.giapha.domain.Person;
import vn.giapha.genealogy.api.DeathAnniversarySync;
import vn.giapha.genealogy.api.TreeSettingsDTO;
import vn.giapha.genealogy.api.PersonCodeGenerator;
import vn.giapha.genealogy.api.PersonPrivacyFilter;
import vn.giapha.genealogy.api.PersonPrivacyModel;
import vn.giapha.genealogy.api.ViewerContext;
import vn.giapha.genealogy.api.ViewerRole;
import vn.giapha.genealogy.events.PersonUpdated;
import vn.giapha.repository.DeathAnniversaryRepository;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.repository.FamilyUnionRepository;
import vn.giapha.repository.PersonRepository;
import vn.giapha.security.AuthoritiesConstants;
import vn.giapha.security.SecurityUtils;
import vn.giapha.service.dto.DeathAnniversaryDTO;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.dto.FamilyUnionDTO;
import vn.giapha.service.dto.PersonDTO;
import vn.giapha.service.mapper.DeathAnniversaryMapper;
import vn.giapha.service.mapper.FamilyTreeMapper;
import vn.giapha.service.mapper.FamilyUnionMapper;
import vn.giapha.service.mapper.PersonMapper;

/**
 * API phả hệ theo slug cây — list/get by mã hiệu, sinh code A7…, privacy filter.
 */
@Service
@Transactional
public class TreeGenealogyService {

    private final FamilyTreeRepository familyTreeRepository;
    private final PersonRepository personRepository;
    private final FamilyUnionRepository familyUnionRepository;
    private final DeathAnniversaryRepository deathAnniversaryRepository;
    private final FamilyTreeMapper familyTreeMapper;
    private final PersonMapper personMapper;
    private final FamilyUnionMapper familyUnionMapper;
    private final DeathAnniversaryMapper deathAnniversaryMapper;
    private final PersonPrivacyFilter personPrivacyFilter;
    private final DeathAnniversarySync deathAnniversarySync;
    private final ApplicationEventPublisher events;
    private final TreeSettingsCodec treeSettingsCodec;

    public TreeGenealogyService(
        FamilyTreeRepository familyTreeRepository,
        PersonRepository personRepository,
        FamilyUnionRepository familyUnionRepository,
        DeathAnniversaryRepository deathAnniversaryRepository,
        FamilyTreeMapper familyTreeMapper,
        PersonMapper personMapper,
        FamilyUnionMapper familyUnionMapper,
        DeathAnniversaryMapper deathAnniversaryMapper,
        PersonPrivacyFilter personPrivacyFilter,
        DeathAnniversarySync deathAnniversarySync,
        ApplicationEventPublisher events,
        TreeSettingsCodec treeSettingsCodec
    ) {
        this.familyTreeRepository = familyTreeRepository;
        this.personRepository = personRepository;
        this.familyUnionRepository = familyUnionRepository;
        this.deathAnniversaryRepository = deathAnniversaryRepository;
        this.familyTreeMapper = familyTreeMapper;
        this.personMapper = personMapper;
        this.familyUnionMapper = familyUnionMapper;
        this.deathAnniversaryMapper = deathAnniversaryMapper;
        this.personPrivacyFilter = personPrivacyFilter;
        this.deathAnniversarySync = deathAnniversarySync;
        this.events = events;
        this.treeSettingsCodec = treeSettingsCodec;
    }

    @Transactional(readOnly = true)
    public Optional<FamilyTreeDTO> findTree(String slug) {
        return familyTreeRepository.findBySlug(slug).map(familyTreeMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Optional<TreeSettingsDTO> getSettings(String slug) {
        return familyTreeRepository.findBySlug(slug).map(treeSettingsCodec::read);
    }

    public TreeSettingsDTO updateSettings(String slug, TreeSettingsDTO incoming) {
        FamilyTree tree = familyTreeRepository.findBySlug(slug).orElseThrow(() -> new TreeNotFoundException(slug));
        if (incoming.getTree() != null && incoming.getTree().getCodePrefix() != null) {
            incoming.getTree().setCodePrefix(PersonCodeGenerator.normalizePrefix(incoming.getTree().getCodePrefix()));
        }
        if (incoming.getBrandPalette() != null) {
            String pal = incoming.getBrandPalette().trim();
            if (!pal.equals("bang-vang") && !pal.equals("co")) {
                incoming.setBrandPalette("bang-vang");
            }
        }
        if (incoming.getPrivacy() != null && incoming.getPrivacy().getDefaultLivingPrivacy() != null) {
            String p = incoming.getPrivacy().getDefaultLivingPrivacy().trim().toLowerCase(Locale.ROOT);
            if (!p.equals("members") && !p.equals("public") && !p.equals("private")) {
                incoming.getPrivacy().setDefaultLivingPrivacy("members");
            } else {
                incoming.getPrivacy().setDefaultLivingPrivacy(p);
            }
        }
        if (incoming.getZalo() != null && incoming.getZalo().getMode() != null) {
            String m = incoming.getZalo().getMode().trim().toLowerCase(Locale.ROOT);
            if (!m.equals("off") && !m.equals("dry_run") && !m.equals("live")) {
                incoming.getZalo().setMode("off");
            } else {
                incoming.getZalo().setMode(m);
            }
        }
        treeSettingsCodec.write(tree, incoming);
        familyTreeRepository.save(tree);
        return treeSettingsCodec.read(tree);
    }

    /** Gửi thử email cấu hình — dry-run nếu chưa có mail sender. */
    public String testSmtp(String slug, String toEmail) {
        FamilyTree tree = familyTreeRepository.findBySlug(slug).orElseThrow(() -> new TreeNotFoundException(slug));
        TreeSettingsDTO settings = treeSettingsCodec.readInternal(tree);
        if (settings.getSmtp() == null || settings.getSmtp().getHost() == null || settings.getSmtp().getHost().isBlank()) {
            throw new IllegalStateException("Chưa cấu hình máy chủ gửi thư.");
        }
        String to = toEmail != null && !toEmail.isBlank() ? toEmail : settings.getContactEmail();
        if (to == null || to.isBlank()) {
            throw new IllegalStateException("Thiếu địa chỉ nhận thử.");
        }
        // Runtime SMTP động từ settings sẽ gắn JavaMailSender riêng; v1 xác nhận cấu hình đã lưu.
        return "Đã ghi nhận cấu hình gửi thư tới " + to + ". Kiểm tra hàng đợi nhắc giỗ sau khi bật kênh email.";
    }

    @Transactional(readOnly = true)
    public Page<PersonDTO> listPersons(String slug, String query, Integer generation, Pageable pageable) {
        if (!isTreeReadable(slug)) {
            return Page.empty(pageable);
        }
        // Rỗng thay vì null — tránh Hibernate bind concat LIKE thành bytea trên Postgres
        String normalized = blankToNull(query);
        String q = normalized == null ? "" : normalized;
        return personRepository
            .searchInTree(slug, q, generation, pageable)
            .map(personMapper::toDto)
            .map(dto -> applyPrivacy(slug, dto));
    }

    @Transactional(readOnly = true)
    public Optional<PersonDTO> findPersonByCode(String slug, String code) {
        if (!isTreeReadable(slug)) {
            return Optional.empty();
        }
        return personRepository
            .findByTree_SlugAndCodeIgnoreCase(slug, code)
            .map(personMapper::toDto)
            .map(dto -> applyPrivacy(slug, dto));
    }

    @Transactional(readOnly = true)
    public Page<FamilyUnionDTO> listUnions(String slug, Pageable pageable) {
        if (!isTreeReadable(slug)) {
            return Page.empty(pageable);
        }
        return familyUnionRepository.findByTree_Slug(slug, pageable).map(familyUnionMapper::toDto);
    }

    @Transactional(readOnly = true)
    public List<DeathAnniversaryDTO> listAnniversaries(String slug, Integer lunarMonth) {
        if (!isTreeReadable(slug)) {
            return List.of();
        }
        return deathAnniversaryRepository
            .findByTreeSlugAndOptionalMonth(slug, lunarMonth)
            .stream()
            .map(deathAnniversaryMapper::toDto)
            .map(dto -> {
                if (dto.getPerson() != null) {
                    dto.setPerson(applyPrivacy(slug, dto.getPerson()));
                }
                return dto;
            })
            .toList();
    }

    /**
     * Tạo người trong cây: gán tree theo slug; sinh mã hiệu nếu trống; gắn lineage_path nếu có parentCode.
     */
    public PersonDTO createPerson(String slug, PersonDTO personDTO, String parentCode, boolean spouseOfParent) {
        FamilyTree tree = familyTreeRepository
            .findBySlug(slug)
            .orElseThrow(() -> new TreeNotFoundException(slug));

        FamilyTreeDTO treeDto = familyTreeMapper.toDto(tree);
        personDTO.setTree(treeDto);

        TreeSettingsDTO treeSettings = treeSettingsCodec.read(tree);
        if (
            (personDTO.getPrivacy() == null || personDTO.getPrivacy().isBlank()) &&
            !isDeceasedLifeStatus(personDTO.getLifeStatus())
        ) {
            String def =
                treeSettings.getPrivacy() != null ? treeSettings.getPrivacy().getDefaultLivingPrivacy() : "members";
            personDTO.setPrivacy(def != null && !def.isBlank() ? def : "members");
        }

        Set<String> codes = new HashSet<>(personRepository.findCodesByTreeSlug(slug));
        String codePrefix = treeSettings.getTree().getCodePrefix();
        String requestedCode = personDTO.getCode();
        final String code;
        if (requestedCode == null || requestedCode.isBlank()) {
            if (spouseOfParent && parentCode != null && !parentCode.isBlank()) {
                code = PersonCodeGenerator.nextSpouseCode(parentCode.trim(), codes);
            } else {
                code = PersonCodeGenerator.nextLineageCode(codes, codePrefix);
            }
            personDTO.setCode(code);
        } else {
            String trimmed = requestedCode.trim();
            if (codes.stream().anyMatch(c -> c != null && c.equalsIgnoreCase(trimmed))) {
                throw new DuplicatePersonCodeException(slug, trimmed);
            }
            code = trimmed;
            personDTO.setCode(code);
        }

        if (personDTO.getLineagePath() == null || personDTO.getLineagePath().isBlank()) {
            if (parentCode != null && !parentCode.isBlank() && !spouseOfParent) {
                Person parent = personRepository
                    .findByTree_SlugAndCodeIgnoreCase(slug, parentCode.trim())
                    .orElseThrow(() -> new PersonCodeNotFoundException(slug, parentCode));
                String parentPath = parent.getLineagePath() != null && !parent.getLineagePath().isBlank()
                    ? parent.getLineagePath()
                    : parent.getCode();
                personDTO.setLineagePath(PersonCodeGenerator.appendLineagePath(parentPath, personDTO.getCode()));
            } else {
                personDTO.setLineagePath(personDTO.getCode());
            }
        }

        Person entity = personMapper.toEntity(personDTO);
        entity.setTree(tree);
        entity = personRepository.save(entity);
        deathAnniversarySync.syncFromPerson(entity);
        PersonDTO saved = personMapper.toDto(entity);
        events.publishEvent(new PersonUpdated(saved.getId(), saved.getCode(), slug, saved.getLifeStatus()));
        return applyPrivacy(slug, saved);
    }

    /**
     * Cập nhật người theo mã hiệu trong cây — đồng bộ ngày giỗ khi lifeStatus/ngày mất đổi.
     */
    public PersonDTO updatePerson(String slug, String code, PersonDTO personDTO) {
        FamilyTree tree = familyTreeRepository
            .findBySlug(slug)
            .orElseThrow(() -> new TreeNotFoundException(slug));
        Person existing = personRepository
            .findByTree_SlugAndCodeIgnoreCase(slug, code)
            .orElseThrow(() -> new PersonCodeNotFoundException(slug, code));

        Long existingId = existing.getId();
        String existingCode = existing.getCode();
        personDTO.setId(existingId);
        personDTO.setCode(existingCode);
        personDTO.setTree(familyTreeMapper.toDto(tree));

        personMapper.partialUpdate(existing, personDTO);
        existing.setTree(tree);
        existing.setCode(existingCode);
        existing = personRepository.save(existing);
        deathAnniversarySync.syncFromPerson(existing);

        PersonDTO saved = personMapper.toDto(existing);
        events.publishEvent(new PersonUpdated(saved.getId(), saved.getCode(), slug, saved.getLifeStatus()));
        return applyPrivacy(slug, saved);
    }

    public FamilyUnionDTO createUnion(String slug, FamilyUnionDTO unionDTO) {
        FamilyTree tree = familyTreeRepository
            .findBySlug(slug)
            .orElseThrow(() -> new TreeNotFoundException(slug));
        unionDTO.setTree(familyTreeMapper.toDto(tree));
        FamilyUnion entity = familyUnionMapper.toEntity(unionDTO);
        entity.setTree(tree);
        entity = familyUnionRepository.save(entity);
        return familyUnionMapper.toDto(entity);
    }

    @Transactional(readOnly = true)
    public List<String> listCodes(String slug) {
        return personRepository.findCodesByTreeSlug(slug);
    }

    /**
     * Cây công khai hoặc người đã đăng nhập (thành viên/quản trị) mới đọc được danh sách.
     */
    private boolean isTreeReadable(String slug) {
        ViewerContext viewer = currentViewer();
        if (viewer.role() != ViewerRole.GUEST) {
            return true;
        }
        return familyTreeRepository
            .findBySlug(slug)
            .map(treeSettingsCodec::read)
            .map(s -> s.getTree() == null || s.getTree().isPublicTree())
            .orElse(false);
    }

    private PersonDTO applyPrivacy(String slug, PersonDTO dto) {
        if (dto == null) {
            return null;
        }
        java.time.LocalDate birthSolar = dto.getBirthSolar();
        String birthLunar = dto.getBirthLunarJson();
        PersonPrivacyModel redacted = personPrivacyFilter.apply(toPrivacyModel(dto), currentViewer());
        if (redacted != null) {
            dto.setBirthSolar(redacted.birthSolar());
            dto.setBirthLunarJson(redacted.birthLunarJson());
            dto.setNotes(redacted.notes());
            dto.setLinkedUserId(redacted.linkedUserId());
            dto.setGraveInfo(redacted.graveInfo());
            dto.setGraveLat(redacted.graveLat());
            dto.setGraveLng(redacted.graveLng());
        }
        boolean maskBirth = familyTreeRepository
            .findBySlug(slug)
            .map(treeSettingsCodec::read)
            .map(s -> s.getTree() == null || s.getTree().isMaskLivingBirthDate())
            .orElse(true);
        if (!maskBirth && currentViewer().role() == ViewerRole.GUEST) {
            dto.setBirthSolar(birthSolar);
            dto.setBirthLunarJson(birthLunar);
        }
        return dto;
    }

    private static PersonPrivacyModel toPrivacyModel(PersonDTO dto) {
        return new PersonPrivacyModel(
            dto.getLifeStatus(),
            dto.getPrivacy(),
            dto.getBirthSolar(),
            dto.getBirthLunarJson(),
            dto.getNotes(),
            dto.getLinkedUserId(),
            dto.getGraveInfo(),
            dto.getGraveLat(),
            dto.getGraveLng()
        );
    }

    private static ViewerContext currentViewer() {
        if (!SecurityUtils.isAuthenticated()) {
            return ViewerContext.guest();
        }
        if (
            SecurityUtils.hasCurrentUserAnyOfAuthorities(
                AuthoritiesConstants.ADMIN,
                "ROLE_EDITOR",
                "ROLE_GENEALOGY_ADMIN",
                "genealogy_admin",
                "editor"
            )
        ) {
            return new ViewerContext(ViewerRole.EDITOR);
        }
        return ViewerContext.member();
    }

    private static String blankToNull(String value) {
        if (value == null) {
            return null;
        }
        String t = value.trim();
        return t.isEmpty() ? null : t.toLowerCase(Locale.ROOT);
    }

    private static boolean isDeceasedLifeStatus(String lifeStatus) {
        if (lifeStatus == null) {
            return false;
        }
        String s = lifeStatus.trim().toLowerCase(Locale.ROOT);
        return "deceased".equals(s) || "dead".equals(s) || "mat".equals(s) || "đã mất".equals(s);
    }

    public static class TreeNotFoundException extends RuntimeException {

        public TreeNotFoundException(String slug) {
            super("Không tìm thấy gia phả slug=" + slug);
        }
    }

    public static class DuplicatePersonCodeException extends RuntimeException {

        public DuplicatePersonCodeException(String slug, String code) {
            super("Mã hiệu đã tồn tại trong cây " + slug + ": " + code);
        }
    }

    public static class PersonCodeNotFoundException extends RuntimeException {

        public PersonCodeNotFoundException(String slug, String code) {
            super("Không tìm thấy người " + code + " trong cây " + slug);
        }
    }
}
