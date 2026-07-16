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
import vn.giapha.domain.EventRsvp;
import vn.giapha.repository.EventRsvpRepository;
import vn.giapha.service.dto.EventRsvpDTO;
import vn.giapha.service.mapper.EventRsvpMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.EventRsvp}.
 */
@Service
@Transactional
public class EventRsvpService {

    private static final Logger LOG = LoggerFactory.getLogger(EventRsvpService.class);

    private final EventRsvpRepository eventRsvpRepository;

    private final EventRsvpMapper eventRsvpMapper;

    public EventRsvpService(EventRsvpRepository eventRsvpRepository, EventRsvpMapper eventRsvpMapper) {
        this.eventRsvpRepository = eventRsvpRepository;
        this.eventRsvpMapper = eventRsvpMapper;
    }

    /**
     * Save a eventRsvp.
     *
     * @param eventRsvpDTO the entity to save.
     * @return the persisted entity.
     */
    public EventRsvpDTO save(EventRsvpDTO eventRsvpDTO) {
        LOG.debug("Request to save EventRsvp : {}", eventRsvpDTO);
        EventRsvp eventRsvp = eventRsvpMapper.toEntity(eventRsvpDTO);
        eventRsvp = eventRsvpRepository.save(eventRsvp);
        return eventRsvpMapper.toDto(eventRsvp);
    }

    /**
     * Update a eventRsvp.
     *
     * @param eventRsvpDTO the entity to save.
     * @return the persisted entity.
     */
    public EventRsvpDTO update(EventRsvpDTO eventRsvpDTO) {
        LOG.debug("Request to update EventRsvp : {}", eventRsvpDTO);
        EventRsvp eventRsvp = eventRsvpMapper.toEntity(eventRsvpDTO);
        eventRsvp = eventRsvpRepository.save(eventRsvp);
        return eventRsvpMapper.toDto(eventRsvp);
    }

    /**
     * Partially update a eventRsvp.
     *
     * @param eventRsvpDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<EventRsvpDTO> partialUpdate(EventRsvpDTO eventRsvpDTO) {
        LOG.debug("Request to partially update EventRsvp : {}", eventRsvpDTO);

        return eventRsvpRepository
            .findById(eventRsvpDTO.getId())
            .map(existingEventRsvp -> {
                eventRsvpMapper.partialUpdate(existingEventRsvp, eventRsvpDTO);

                return existingEventRsvp;
            })
            .map(eventRsvpRepository::save)
            .map(eventRsvpMapper::toDto);
    }

    /**
     * Get all the eventRsvps.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<EventRsvpDTO> findAll() {
        LOG.debug("Request to get all EventRsvps");
        return eventRsvpRepository.findAll().stream().map(eventRsvpMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get all the eventRsvps with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<EventRsvpDTO> findAllWithEagerRelationships(Pageable pageable) {
        return eventRsvpRepository.findAllWithEagerRelationships(pageable).map(eventRsvpMapper::toDto);
    }

    /**
     * Get one eventRsvp by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<EventRsvpDTO> findOne(Long id) {
        LOG.debug("Request to get EventRsvp : {}", id);
        return eventRsvpRepository.findOneWithEagerRelationships(id).map(eventRsvpMapper::toDto);
    }

    /**
     * Delete the eventRsvp by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete EventRsvp : {}", id);
        eventRsvpRepository.deleteById(id);
    }
}
