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
import vn.giapha.domain.AnniversarySubscription;
import vn.giapha.repository.AnniversarySubscriptionRepository;
import vn.giapha.service.dto.AnniversarySubscriptionDTO;
import vn.giapha.service.mapper.AnniversarySubscriptionMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.AnniversarySubscription}.
 */
@Service
@Transactional
public class AnniversarySubscriptionService {

    private static final Logger LOG = LoggerFactory.getLogger(AnniversarySubscriptionService.class);

    private final AnniversarySubscriptionRepository anniversarySubscriptionRepository;

    private final AnniversarySubscriptionMapper anniversarySubscriptionMapper;

    public AnniversarySubscriptionService(
        AnniversarySubscriptionRepository anniversarySubscriptionRepository,
        AnniversarySubscriptionMapper anniversarySubscriptionMapper
    ) {
        this.anniversarySubscriptionRepository = anniversarySubscriptionRepository;
        this.anniversarySubscriptionMapper = anniversarySubscriptionMapper;
    }

    /**
     * Save a anniversarySubscription.
     *
     * @param anniversarySubscriptionDTO the entity to save.
     * @return the persisted entity.
     */
    public AnniversarySubscriptionDTO save(AnniversarySubscriptionDTO anniversarySubscriptionDTO) {
        LOG.debug("Request to save AnniversarySubscription : {}", anniversarySubscriptionDTO);
        AnniversarySubscription anniversarySubscription = anniversarySubscriptionMapper.toEntity(anniversarySubscriptionDTO);
        anniversarySubscription = anniversarySubscriptionRepository.save(anniversarySubscription);
        return anniversarySubscriptionMapper.toDto(anniversarySubscription);
    }

    /**
     * Update a anniversarySubscription.
     *
     * @param anniversarySubscriptionDTO the entity to save.
     * @return the persisted entity.
     */
    public AnniversarySubscriptionDTO update(AnniversarySubscriptionDTO anniversarySubscriptionDTO) {
        LOG.debug("Request to update AnniversarySubscription : {}", anniversarySubscriptionDTO);
        AnniversarySubscription anniversarySubscription = anniversarySubscriptionMapper.toEntity(anniversarySubscriptionDTO);
        anniversarySubscription = anniversarySubscriptionRepository.save(anniversarySubscription);
        return anniversarySubscriptionMapper.toDto(anniversarySubscription);
    }

    /**
     * Partially update a anniversarySubscription.
     *
     * @param anniversarySubscriptionDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<AnniversarySubscriptionDTO> partialUpdate(AnniversarySubscriptionDTO anniversarySubscriptionDTO) {
        LOG.debug("Request to partially update AnniversarySubscription : {}", anniversarySubscriptionDTO);

        return anniversarySubscriptionRepository
            .findById(anniversarySubscriptionDTO.getId())
            .map(existingAnniversarySubscription -> {
                anniversarySubscriptionMapper.partialUpdate(existingAnniversarySubscription, anniversarySubscriptionDTO);

                return existingAnniversarySubscription;
            })
            .map(anniversarySubscriptionRepository::save)
            .map(anniversarySubscriptionMapper::toDto);
    }

    /**
     * Get all the anniversarySubscriptions.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<AnniversarySubscriptionDTO> findAll() {
        LOG.debug("Request to get all AnniversarySubscriptions");
        return anniversarySubscriptionRepository
            .findAll()
            .stream()
            .map(anniversarySubscriptionMapper::toDto)
            .collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get all the anniversarySubscriptions with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<AnniversarySubscriptionDTO> findAllWithEagerRelationships(Pageable pageable) {
        return anniversarySubscriptionRepository.findAllWithEagerRelationships(pageable).map(anniversarySubscriptionMapper::toDto);
    }

    /**
     * Get one anniversarySubscription by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<AnniversarySubscriptionDTO> findOne(Long id) {
        LOG.debug("Request to get AnniversarySubscription : {}", id);
        return anniversarySubscriptionRepository.findOneWithEagerRelationships(id).map(anniversarySubscriptionMapper::toDto);
    }

    /**
     * Delete the anniversarySubscription by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete AnniversarySubscription : {}", id);
        anniversarySubscriptionRepository.deleteById(id);
    }
}
