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
import vn.giapha.genealogy.api.PersonCodeGenerator;
import vn.giapha.genealogy.api.PersonPrivacyFilter;
import vn.giapha.genealogy.api.PersonPrivacyModel;
import vn.giapha.genealogy.api.ViewerContext;
import vn.giapha.genealogy.api.ViewerRole;
import vn.giapha.genealogy.events.PersonUpdated;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.repository.FamilyUnionRepository;
import vn.giapha.repository.PersonRepository;
import vn.giapha.security.AuthoritiesConstants;
import vn.giapha.security.SecurityUtils;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.dto.FamilyUnionDTO;
import vn.giapha.service.dto.PersonDTO;
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
    private final FamilyTreeMapper familyTreeMapper;
    private final PersonMapper personMapper;
    private final FamilyUnionMapper familyUnionMapper;
    private final PersonPrivacyFilter personPrivacyFilter;
    private final ApplicationEventPublisher events;

    public TreeGenealogyService(
        FamilyTreeRepository familyTreeRepository,
        PersonRepository personRepository,
        FamilyUnionRepository familyUnionRepository,
        FamilyTreeMapper familyTreeMapper,
        PersonMapper personMapper,
        FamilyUnionMapper familyUnionMapper,
        PersonPrivacyFilter personPrivacyFilter,
        ApplicationEventPublisher events
    ) {
        this.familyTreeRepository = familyTreeRepository;
        this.personRepository = personRepository;
        this.familyUnionRepository = familyUnionRepository;
        this.familyTreeMapper = familyTreeMapper;
        this.personMapper = personMapper;
        this.familyUnionMapper = familyUnionMapper;
        this.personPrivacyFilter = personPrivacyFilter;
        this.events = events;
    }

    @Transactional(readOnly = true)
    public Optional<FamilyTreeDTO> findTree(String slug) {
        return familyTreeRepository.findBySlug(slug).map(familyTreeMapper::toDto);
    }

    @Transactional(readOnly = true)
    public Page<PersonDTO> listPersons(String slug, String query, Integer generation, Pageable pageable) {
        String q = blankToNull(query);
        return personRepository
            .searchInTree(slug, q, generation, pageable)
            .map(personMapper::toDto)
            .map(this::applyPrivacy);
    }

    @Transactional(readOnly = true)
    public Optional<PersonDTO> findPersonByCode(String slug, String code) {
        return personRepository
            .findByTree_SlugAndCodeIgnoreCase(slug, code)
            .map(personMapper::toDto)
            .map(this::applyPrivacy);
    }

    @Transactional(readOnly = true)
    public Page<FamilyUnionDTO> listUnions(String slug, Pageable pageable) {
        return familyUnionRepository.findByTree_Slug(slug, pageable).map(familyUnionMapper::toDto);
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

        Set<String> codes = new HashSet<>(personRepository.findCodesByTreeSlug(slug));
        String requestedCode = personDTO.getCode();
        final String code;
        if (requestedCode == null || requestedCode.isBlank()) {
            if (spouseOfParent && parentCode != null && !parentCode.isBlank()) {
                code = PersonCodeGenerator.nextSpouseCode(parentCode.trim(), codes);
            } else {
                code = PersonCodeGenerator.nextLineageCode(codes);
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
        PersonDTO saved = personMapper.toDto(entity);
        events.publishEvent(new PersonUpdated(saved.getId(), saved.getCode(), slug, saved.getLifeStatus()));
        return applyPrivacy(saved);
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

    private PersonDTO applyPrivacy(PersonDTO dto) {
        if (dto == null) {
            return null;
        }
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
                "ROLE_GENEALOGY_ADMIN",
                "genealogy_admin"
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
