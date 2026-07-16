package vn.giapha.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.ScholarshipEntry;
import vn.giapha.repository.ScholarshipEntryRepository;
import vn.giapha.service.dto.ScholarshipEntryDTO;
import vn.giapha.service.mapper.ScholarshipEntryMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.ScholarshipEntry}.
 */
@Service
@Transactional
public class ScholarshipEntryService {

    private static final Logger LOG = LoggerFactory.getLogger(ScholarshipEntryService.class);

    private final ScholarshipEntryRepository scholarshipEntryRepository;

    private final ScholarshipEntryMapper scholarshipEntryMapper;

    public ScholarshipEntryService(ScholarshipEntryRepository scholarshipEntryRepository, ScholarshipEntryMapper scholarshipEntryMapper) {
        this.scholarshipEntryRepository = scholarshipEntryRepository;
        this.scholarshipEntryMapper = scholarshipEntryMapper;
    }

    /**
     * Save a scholarshipEntry.
     *
     * @param scholarshipEntryDTO the entity to save.
     * @return the persisted entity.
     */
    public ScholarshipEntryDTO save(ScholarshipEntryDTO scholarshipEntryDTO) {
        LOG.debug("Request to save ScholarshipEntry : {}", scholarshipEntryDTO);
        ScholarshipEntry scholarshipEntry = scholarshipEntryMapper.toEntity(scholarshipEntryDTO);
        scholarshipEntry = scholarshipEntryRepository.save(scholarshipEntry);
        return scholarshipEntryMapper.toDto(scholarshipEntry);
    }

    /**
     * Update a scholarshipEntry.
     *
     * @param scholarshipEntryDTO the entity to save.
     * @return the persisted entity.
     */
    public ScholarshipEntryDTO update(ScholarshipEntryDTO scholarshipEntryDTO) {
        LOG.debug("Request to update ScholarshipEntry : {}", scholarshipEntryDTO);
        ScholarshipEntry scholarshipEntry = scholarshipEntryMapper.toEntity(scholarshipEntryDTO);
        scholarshipEntry = scholarshipEntryRepository.save(scholarshipEntry);
        return scholarshipEntryMapper.toDto(scholarshipEntry);
    }

    /**
     * Partially update a scholarshipEntry.
     *
     * @param scholarshipEntryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ScholarshipEntryDTO> partialUpdate(ScholarshipEntryDTO scholarshipEntryDTO) {
        LOG.debug("Request to partially update ScholarshipEntry : {}", scholarshipEntryDTO);

        return scholarshipEntryRepository
            .findById(scholarshipEntryDTO.getId())
            .map(existingScholarshipEntry -> {
                scholarshipEntryMapper.partialUpdate(existingScholarshipEntry, scholarshipEntryDTO);

                return existingScholarshipEntry;
            })
            .map(scholarshipEntryRepository::save)
            .map(scholarshipEntryMapper::toDto);
    }

    /**
     * Get all the scholarshipEntries.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<ScholarshipEntryDTO> findAll() {
        LOG.debug("Request to get all ScholarshipEntries");
        return scholarshipEntryRepository
            .findAll()
            .stream()
            .map(scholarshipEntryMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get all the scholarshipEntries with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ScholarshipEntryDTO> findAllWithEagerRelationships(Pageable pageable) {
        return scholarshipEntryRepository.findAllWithEagerRelationships(pageable).map(scholarshipEntryMapper::toDto);
    }

    /**
     * Get one scholarshipEntry by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ScholarshipEntryDTO> findOne(Long id) {
        LOG.debug("Request to get ScholarshipEntry : {}", id);
        return scholarshipEntryRepository.findOneWithEagerRelationships(id).map(scholarshipEntryMapper::toDto);
    }

    /**
     * Delete the scholarshipEntry by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ScholarshipEntry : {}", id);
        scholarshipEntryRepository.deleteById(id);
    }
}
