package vn.giapha.scholarship.internal;

import java.util.List;
import java.util.Locale;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.ScholarshipEntry;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.repository.ScholarshipEntryRepository;
import vn.giapha.scholarship.api.ScholarshipStatuses;
import vn.giapha.service.dto.ScholarshipEntryDTO;
import vn.giapha.service.mapper.ScholarshipEntryMapper;

@Service
@Transactional
public class ScholarshipService {

    private final ScholarshipEntryRepository repository;
    private final FamilyTreeRepository familyTreeRepository;
    private final ScholarshipEntryMapper mapper;

    public ScholarshipService(
        ScholarshipEntryRepository repository,
        FamilyTreeRepository familyTreeRepository,
        ScholarshipEntryMapper mapper
    ) {
        this.repository = repository;
        this.familyTreeRepository = familyTreeRepository;
        this.mapper = mapper;
    }

    @Transactional(readOnly = true)
    public List<ScholarshipEntryDTO> honorBoard(String slug) {
        return repository.findByTreeSlugAndStatus(slug, ScholarshipStatuses.APPROVED).stream().map(mapper::toDto).toList();
    }

    @Transactional(readOnly = true)
    public List<ScholarshipEntryDTO> listAdmin(String slug, String status) {
        if (status == null || status.isBlank() || "all".equalsIgnoreCase(status)) {
            return repository.findByTreeSlug(slug).stream().map(mapper::toDto).toList();
        }
        return repository.findByTreeSlugAndStatus(slug, status.trim().toLowerCase(Locale.ROOT)).stream().map(mapper::toDto).toList();
    }

    public ScholarshipEntryDTO nominate(String slug, ScholarshipEntryDTO dto) {
        FamilyTree tree = requireTree(slug);
        if (dto.getPersonName() == null || dto.getPersonName().isBlank()) {
            throw new IllegalArgumentException("personName bắt buộc");
        }
        if (dto.getAchievement() == null || dto.getAchievement().isBlank()) {
            throw new IllegalArgumentException("achievement bắt buộc");
        }
        ScholarshipEntry e = new ScholarshipEntry();
        e.setPersonName(dto.getPersonName().trim());
        e.setAchievement(dto.getAchievement().trim());
        e.setYear(dto.getYear());
        e.setStatus(ScholarshipStatuses.NOMINATED);
        e.setTree(tree);
        return mapper.toDto(repository.save(e));
    }

    public ScholarshipEntryDTO review(String slug, Long id, boolean approve) {
        ScholarshipEntry e = requireEntry(slug, id);
        e.setStatus(approve ? ScholarshipStatuses.APPROVED : ScholarshipStatuses.REJECTED);
        return mapper.toDto(repository.save(e));
    }

    private FamilyTree requireTree(String slug) {
        return familyTreeRepository.findBySlug(slug).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cây"));
    }

    private ScholarshipEntry requireEntry(String slug, Long id) {
        ScholarshipEntry e = repository.findOneWithEagerRelationships(id).orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đề cử"));
        if (e.getTree() == null || !slug.equals(e.getTree().getSlug())) {
            throw new IllegalArgumentException("Đề cử không thuộc cây");
        }
        return e;
    }
}
