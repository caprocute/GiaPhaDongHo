package vn.giapha.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.ClanEvent;
import vn.giapha.repository.ClanEventRepository;
import vn.giapha.service.dto.ClanEventDTO;
import vn.giapha.service.mapper.ClanEventMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.ClanEvent}.
 */
@Service
@Transactional
public class ClanEventService {

    private static final Logger LOG = LoggerFactory.getLogger(ClanEventService.class);

    private final ClanEventRepository clanEventRepository;

    private final ClanEventMapper clanEventMapper;

    public ClanEventService(ClanEventRepository clanEventRepository, ClanEventMapper clanEventMapper) {
        this.clanEventRepository = clanEventRepository;
        this.clanEventMapper = clanEventMapper;
    }

    /**
     * Save a clanEvent.
     *
     * @param clanEventDTO the entity to save.
     * @return the persisted entity.
     */
    public ClanEventDTO save(ClanEventDTO clanEventDTO) {
        LOG.debug("Request to save ClanEvent : {}", clanEventDTO);
        ClanEvent clanEvent = clanEventMapper.toEntity(clanEventDTO);
        clanEvent = clanEventRepository.save(clanEvent);
        return clanEventMapper.toDto(clanEvent);
    }

    /**
     * Update a clanEvent.
     *
     * @param clanEventDTO the entity to save.
     * @return the persisted entity.
     */
    public ClanEventDTO update(ClanEventDTO clanEventDTO) {
        LOG.debug("Request to update ClanEvent : {}", clanEventDTO);
        ClanEvent clanEvent = clanEventMapper.toEntity(clanEventDTO);
        clanEvent = clanEventRepository.save(clanEvent);
        return clanEventMapper.toDto(clanEvent);
    }

    /**
     * Partially update a clanEvent.
     *
     * @param clanEventDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ClanEventDTO> partialUpdate(ClanEventDTO clanEventDTO) {
        LOG.debug("Request to partially update ClanEvent : {}", clanEventDTO);

        return clanEventRepository
            .findById(clanEventDTO.getId())
            .map(existingClanEvent -> {
                clanEventMapper.partialUpdate(existingClanEvent, clanEventDTO);

                return existingClanEvent;
            })
            .map(clanEventRepository::save)
            .map(clanEventMapper::toDto);
    }

    /**
     * Get all the clanEvents.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ClanEventDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ClanEvents");
        return clanEventRepository.findAll(pageable).map(clanEventMapper::toDto);
    }

    /**
     * Get all the clanEvents with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ClanEventDTO> findAllWithEagerRelationships(Pageable pageable) {
        return clanEventRepository.findAllWithEagerRelationships(pageable).map(clanEventMapper::toDto);
    }

    /**
     * Get one clanEvent by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ClanEventDTO> findOne(Long id) {
        LOG.debug("Request to get ClanEvent : {}", id);
        return clanEventRepository.findOneWithEagerRelationships(id).map(clanEventMapper::toDto);
    }

    /**
     * Delete the clanEvent by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ClanEvent : {}", id);
        clanEventRepository.deleteById(id);
    }
}
