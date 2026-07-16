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
import vn.giapha.domain.DeathAnniversary;
import vn.giapha.repository.DeathAnniversaryRepository;
import vn.giapha.service.dto.DeathAnniversaryDTO;
import vn.giapha.service.mapper.DeathAnniversaryMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.DeathAnniversary}.
 */
@Service
@Transactional
public class DeathAnniversaryService {

    private static final Logger LOG = LoggerFactory.getLogger(DeathAnniversaryService.class);

    private final DeathAnniversaryRepository deathAnniversaryRepository;

    private final DeathAnniversaryMapper deathAnniversaryMapper;

    public DeathAnniversaryService(DeathAnniversaryRepository deathAnniversaryRepository, DeathAnniversaryMapper deathAnniversaryMapper) {
        this.deathAnniversaryRepository = deathAnniversaryRepository;
        this.deathAnniversaryMapper = deathAnniversaryMapper;
    }

    /**
     * Save a deathAnniversary.
     *
     * @param deathAnniversaryDTO the entity to save.
     * @return the persisted entity.
     */
    public DeathAnniversaryDTO save(DeathAnniversaryDTO deathAnniversaryDTO) {
        LOG.debug("Request to save DeathAnniversary : {}", deathAnniversaryDTO);
        DeathAnniversary deathAnniversary = deathAnniversaryMapper.toEntity(deathAnniversaryDTO);
        deathAnniversary = deathAnniversaryRepository.save(deathAnniversary);
        return deathAnniversaryMapper.toDto(deathAnniversary);
    }

    /**
     * Update a deathAnniversary.
     *
     * @param deathAnniversaryDTO the entity to save.
     * @return the persisted entity.
     */
    public DeathAnniversaryDTO update(DeathAnniversaryDTO deathAnniversaryDTO) {
        LOG.debug("Request to update DeathAnniversary : {}", deathAnniversaryDTO);
        DeathAnniversary deathAnniversary = deathAnniversaryMapper.toEntity(deathAnniversaryDTO);
        deathAnniversary = deathAnniversaryRepository.save(deathAnniversary);
        return deathAnniversaryMapper.toDto(deathAnniversary);
    }

    /**
     * Partially update a deathAnniversary.
     *
     * @param deathAnniversaryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<DeathAnniversaryDTO> partialUpdate(DeathAnniversaryDTO deathAnniversaryDTO) {
        LOG.debug("Request to partially update DeathAnniversary : {}", deathAnniversaryDTO);

        return deathAnniversaryRepository
            .findById(deathAnniversaryDTO.getId())
            .map(existingDeathAnniversary -> {
                deathAnniversaryMapper.partialUpdate(existingDeathAnniversary, deathAnniversaryDTO);

                return existingDeathAnniversary;
            })
            .map(deathAnniversaryRepository::save)
            .map(deathAnniversaryMapper::toDto);
    }

    /**
     * Get all the deathAnniversaries.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<DeathAnniversaryDTO> findAll() {
        LOG.debug("Request to get all DeathAnniversaries");
        return deathAnniversaryRepository
            .findAll()
            .stream()
            .map(deathAnniversaryMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get all the deathAnniversaries with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<DeathAnniversaryDTO> findAllWithEagerRelationships(Pageable pageable) {
        return deathAnniversaryRepository.findAllWithEagerRelationships(pageable).map(deathAnniversaryMapper::toDto);
    }

    /**
     * Get one deathAnniversary by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<DeathAnniversaryDTO> findOne(Long id) {
        LOG.debug("Request to get DeathAnniversary : {}", id);
        return deathAnniversaryRepository.findOneWithEagerRelationships(id).map(deathAnniversaryMapper::toDto);
    }

    /**
     * Delete the deathAnniversary by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete DeathAnniversary : {}", id);
        deathAnniversaryRepository.deleteById(id);
    }
}
