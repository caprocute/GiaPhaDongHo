package vn.giapha.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.ChangeRequest;
import vn.giapha.repository.ChangeRequestRepository;
import vn.giapha.service.dto.ChangeRequestDTO;
import vn.giapha.service.mapper.ChangeRequestMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.ChangeRequest}.
 */
@Service
@Transactional
public class ChangeRequestService {

    private static final Logger LOG = LoggerFactory.getLogger(ChangeRequestService.class);

    private final ChangeRequestRepository changeRequestRepository;

    private final ChangeRequestMapper changeRequestMapper;

    public ChangeRequestService(ChangeRequestRepository changeRequestRepository, ChangeRequestMapper changeRequestMapper) {
        this.changeRequestRepository = changeRequestRepository;
        this.changeRequestMapper = changeRequestMapper;
    }

    /**
     * Save a changeRequest.
     *
     * @param changeRequestDTO the entity to save.
     * @return the persisted entity.
     */
    public ChangeRequestDTO save(ChangeRequestDTO changeRequestDTO) {
        LOG.debug("Request to save ChangeRequest : {}", changeRequestDTO);
        ChangeRequest changeRequest = changeRequestMapper.toEntity(changeRequestDTO);
        changeRequest = changeRequestRepository.save(changeRequest);
        return changeRequestMapper.toDto(changeRequest);
    }

    /**
     * Update a changeRequest.
     *
     * @param changeRequestDTO the entity to save.
     * @return the persisted entity.
     */
    public ChangeRequestDTO update(ChangeRequestDTO changeRequestDTO) {
        LOG.debug("Request to update ChangeRequest : {}", changeRequestDTO);
        ChangeRequest changeRequest = changeRequestMapper.toEntity(changeRequestDTO);
        changeRequest = changeRequestRepository.save(changeRequest);
        return changeRequestMapper.toDto(changeRequest);
    }

    /**
     * Partially update a changeRequest.
     *
     * @param changeRequestDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<ChangeRequestDTO> partialUpdate(ChangeRequestDTO changeRequestDTO) {
        LOG.debug("Request to partially update ChangeRequest : {}", changeRequestDTO);

        return changeRequestRepository
            .findById(changeRequestDTO.getId())
            .map(existingChangeRequest -> {
                changeRequestMapper.partialUpdate(existingChangeRequest, changeRequestDTO);

                return existingChangeRequest;
            })
            .map(changeRequestRepository::save)
            .map(changeRequestMapper::toDto);
    }

    /**
     * Get all the changeRequests.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<ChangeRequestDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all ChangeRequests");
        return changeRequestRepository.findAll(pageable).map(changeRequestMapper::toDto);
    }

    /**
     * Get all the changeRequests with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<ChangeRequestDTO> findAllWithEagerRelationships(Pageable pageable) {
        return changeRequestRepository.findAllWithEagerRelationships(pageable).map(changeRequestMapper::toDto);
    }

    /**
     * Get one changeRequest by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<ChangeRequestDTO> findOne(Long id) {
        LOG.debug("Request to get ChangeRequest : {}", id);
        return changeRequestRepository.findOneWithEagerRelationships(id).map(changeRequestMapper::toDto);
    }

    /**
     * Delete the changeRequest by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete ChangeRequest : {}", id);
        changeRequestRepository.deleteById(id);
    }
}
