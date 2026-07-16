package vn.giapha.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.FamilyTree;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.mapper.FamilyTreeMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.FamilyTree}.
 */
@Service
@Transactional
public class FamilyTreeService {

    private static final Logger LOG = LoggerFactory.getLogger(FamilyTreeService.class);

    private final FamilyTreeRepository familyTreeRepository;

    private final FamilyTreeMapper familyTreeMapper;

    public FamilyTreeService(FamilyTreeRepository familyTreeRepository, FamilyTreeMapper familyTreeMapper) {
        this.familyTreeRepository = familyTreeRepository;
        this.familyTreeMapper = familyTreeMapper;
    }

    /**
     * Save a familyTree.
     *
     * @param familyTreeDTO the entity to save.
     * @return the persisted entity.
     */
    public FamilyTreeDTO save(FamilyTreeDTO familyTreeDTO) {
        LOG.debug("Request to save FamilyTree : {}", familyTreeDTO);
        FamilyTree familyTree = familyTreeMapper.toEntity(familyTreeDTO);
        familyTree = familyTreeRepository.save(familyTree);
        return familyTreeMapper.toDto(familyTree);
    }

    /**
     * Update a familyTree.
     *
     * @param familyTreeDTO the entity to save.
     * @return the persisted entity.
     */
    public FamilyTreeDTO update(FamilyTreeDTO familyTreeDTO) {
        LOG.debug("Request to update FamilyTree : {}", familyTreeDTO);
        FamilyTree familyTree = familyTreeMapper.toEntity(familyTreeDTO);
        familyTree = familyTreeRepository.save(familyTree);
        return familyTreeMapper.toDto(familyTree);
    }

    /**
     * Partially update a familyTree.
     *
     * @param familyTreeDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<FamilyTreeDTO> partialUpdate(FamilyTreeDTO familyTreeDTO) {
        LOG.debug("Request to partially update FamilyTree : {}", familyTreeDTO);

        return familyTreeRepository
            .findById(familyTreeDTO.getId())
            .map(existingFamilyTree -> {
                familyTreeMapper.partialUpdate(existingFamilyTree, familyTreeDTO);

                return existingFamilyTree;
            })
            .map(familyTreeRepository::save)
            .map(familyTreeMapper::toDto);
    }

    /**
     * Get all the familyTrees.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<FamilyTreeDTO> findAll() {
        LOG.debug("Request to get all FamilyTrees");
        return familyTreeRepository.findAll().stream().map(familyTreeMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one familyTree by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<FamilyTreeDTO> findOne(Long id) {
        LOG.debug("Request to get FamilyTree : {}", id);
        return familyTreeRepository.findById(id).map(familyTreeMapper::toDto);
    }

    /**
     * Delete the familyTree by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete FamilyTree : {}", id);
        familyTreeRepository.deleteById(id);
    }
}
