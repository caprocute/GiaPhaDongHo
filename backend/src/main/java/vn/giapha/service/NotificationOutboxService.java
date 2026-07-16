package vn.giapha.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.NotificationOutbox;
import vn.giapha.repository.NotificationOutboxRepository;
import vn.giapha.service.dto.NotificationOutboxDTO;
import vn.giapha.service.mapper.NotificationOutboxMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.NotificationOutbox}.
 */
@Service
@Transactional
public class NotificationOutboxService {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationOutboxService.class);

    private final NotificationOutboxRepository notificationOutboxRepository;

    private final NotificationOutboxMapper notificationOutboxMapper;

    public NotificationOutboxService(
        NotificationOutboxRepository notificationOutboxRepository,
        NotificationOutboxMapper notificationOutboxMapper
    ) {
        this.notificationOutboxRepository = notificationOutboxRepository;
        this.notificationOutboxMapper = notificationOutboxMapper;
    }

    /**
     * Save a notificationOutbox.
     *
     * @param notificationOutboxDTO the entity to save.
     * @return the persisted entity.
     */
    public NotificationOutboxDTO save(NotificationOutboxDTO notificationOutboxDTO) {
        LOG.debug("Request to save NotificationOutbox : {}", notificationOutboxDTO);
        NotificationOutbox notificationOutbox = notificationOutboxMapper.toEntity(notificationOutboxDTO);
        notificationOutbox = notificationOutboxRepository.save(notificationOutbox);
        return notificationOutboxMapper.toDto(notificationOutbox);
    }

    /**
     * Update a notificationOutbox.
     *
     * @param notificationOutboxDTO the entity to save.
     * @return the persisted entity.
     */
    public NotificationOutboxDTO update(NotificationOutboxDTO notificationOutboxDTO) {
        LOG.debug("Request to update NotificationOutbox : {}", notificationOutboxDTO);
        NotificationOutbox notificationOutbox = notificationOutboxMapper.toEntity(notificationOutboxDTO);
        notificationOutbox = notificationOutboxRepository.save(notificationOutbox);
        return notificationOutboxMapper.toDto(notificationOutbox);
    }

    /**
     * Partially update a notificationOutbox.
     *
     * @param notificationOutboxDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<NotificationOutboxDTO> partialUpdate(NotificationOutboxDTO notificationOutboxDTO) {
        LOG.debug("Request to partially update NotificationOutbox : {}", notificationOutboxDTO);

        return notificationOutboxRepository
            .findById(notificationOutboxDTO.getId())
            .map(existingNotificationOutbox -> {
                notificationOutboxMapper.partialUpdate(existingNotificationOutbox, notificationOutboxDTO);

                return existingNotificationOutbox;
            })
            .map(notificationOutboxRepository::save)
            .map(notificationOutboxMapper::toDto);
    }

    /**
     * Get all the notificationOutboxes.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<NotificationOutboxDTO> findAll() {
        LOG.debug("Request to get all NotificationOutboxes");
        return notificationOutboxRepository
            .findAll()
            .stream()
            .map(notificationOutboxMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one notificationOutbox by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<NotificationOutboxDTO> findOne(Long id) {
        LOG.debug("Request to get NotificationOutbox : {}", id);
        return notificationOutboxRepository.findById(id).map(notificationOutboxMapper::toDto);
    }

    /**
     * Delete the notificationOutbox by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete NotificationOutbox : {}", id);
        notificationOutboxRepository.deleteById(id);
    }
}
