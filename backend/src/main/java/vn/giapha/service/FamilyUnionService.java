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
import vn.giapha.domain.FamilyUnion;
import vn.giapha.repository.FamilyUnionRepository;
import vn.giapha.service.dto.FamilyUnionDTO;
import vn.giapha.service.mapper.FamilyUnionMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.FamilyUnion}.
 */
@Service
@Transactional
public class FamilyUnionService {

    private static final Logger LOG = LoggerFactory.getLogger(FamilyUnionService.class);

    private final FamilyUnionRepository familyUnionRepository;

    private final FamilyUnionMapper familyUnionMapper;

    public FamilyUnionService(FamilyUnionRepository familyUnionRepository, FamilyUnionMapper familyUnionMapper) {
        this.familyUnionRepository = familyUnionRepository;
        this.familyUnionMapper = familyUnionMapper;
    }

    /**
     * Save a familyUnion.
     *
     * @param familyUnionDTO the entity to save.
     * @return the persisted entity.
     */
    public FamilyUnionDTO save(FamilyUnionDTO familyUnionDTO) {
        LOG.debug("Request to save FamilyUnion : {}", familyUnionDTO);
        FamilyUnion familyUnion = familyUnionMapper.toEntity(familyUnionDTO);
        familyUnion = familyUnionRepository.save(familyUnion);
        return familyUnionMapper.toDto(familyUnion);
    }

    /**
     * Update a familyUnion.
     *
     * @param familyUnionDTO the entity to save.
     * @return the persisted entity.
     */
    public FamilyUnionDTO update(FamilyUnionDTO familyUnionDTO) {
        LOG.debug("Request to update FamilyUnion : {}", familyUnionDTO);
        FamilyUnion familyUnion = familyUnionMapper.toEntity(familyUnionDTO);
        familyUnion = familyUnionRepository.save(familyUnion);
        return familyUnionMapper.toDto(familyUnion);
    }

    /**
     * Partially update a familyUnion.
     *
     * @param familyUnionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<FamilyUnionDTO> partialUpdate(FamilyUnionDTO familyUnionDTO) {
        LOG.debug("Request to partially update FamilyUnion : {}", familyUnionDTO);

        return familyUnionRepository
            .findById(familyUnionDTO.getId())
            .map(existingFamilyUnion -> {
                familyUnionMapper.partialUpdate(existingFamilyUnion, familyUnionDTO);

                return existingFamilyUnion;
            })
            .map(familyUnionRepository::save)
            .map(familyUnionMapper::toDto);
    }

    /**
     * Get all the familyUnions.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<FamilyUnionDTO> findAll() {
        LOG.debug("Request to get all FamilyUnions");
        return familyUnionRepository.findAll().stream().map(familyUnionMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get all the familyUnions with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<FamilyUnionDTO> findAllWithEagerRelationships(Pageable pageable) {
        return familyUnionRepository.findAllWithEagerRelationships(pageable).map(familyUnionMapper::toDto);
    }

    /**
     * Get one familyUnion by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<FamilyUnionDTO> findOne(Long id) {
        LOG.debug("Request to get FamilyUnion : {}", id);
        return familyUnionRepository.findOneWithEagerRelationships(id).map(familyUnionMapper::toDto);
    }

    /**
     * Delete the familyUnion by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete FamilyUnion : {}", id);
        familyUnionRepository.deleteById(id);
    }
}
