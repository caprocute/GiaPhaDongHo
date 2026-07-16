package vn.giapha.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.CmsComment;
import vn.giapha.repository.CmsCommentRepository;
import vn.giapha.service.dto.CmsCommentDTO;
import vn.giapha.service.mapper.CmsCommentMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.CmsComment}.
 */
@Service
@Transactional
public class CmsCommentService {

    private static final Logger LOG = LoggerFactory.getLogger(CmsCommentService.class);

    private final CmsCommentRepository cmsCommentRepository;

    private final CmsCommentMapper cmsCommentMapper;

    public CmsCommentService(CmsCommentRepository cmsCommentRepository, CmsCommentMapper cmsCommentMapper) {
        this.cmsCommentRepository = cmsCommentRepository;
        this.cmsCommentMapper = cmsCommentMapper;
    }

    /**
     * Save a cmsComment.
     *
     * @param cmsCommentDTO the entity to save.
     * @return the persisted entity.
     */
    public CmsCommentDTO save(CmsCommentDTO cmsCommentDTO) {
        LOG.debug("Request to save CmsComment : {}", cmsCommentDTO);
        CmsComment cmsComment = cmsCommentMapper.toEntity(cmsCommentDTO);
        cmsComment = cmsCommentRepository.save(cmsComment);
        return cmsCommentMapper.toDto(cmsComment);
    }

    /**
     * Update a cmsComment.
     *
     * @param cmsCommentDTO the entity to save.
     * @return the persisted entity.
     */
    public CmsCommentDTO update(CmsCommentDTO cmsCommentDTO) {
        LOG.debug("Request to update CmsComment : {}", cmsCommentDTO);
        CmsComment cmsComment = cmsCommentMapper.toEntity(cmsCommentDTO);
        cmsComment = cmsCommentRepository.save(cmsComment);
        return cmsCommentMapper.toDto(cmsComment);
    }

    /**
     * Partially update a cmsComment.
     *
     * @param cmsCommentDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CmsCommentDTO> partialUpdate(CmsCommentDTO cmsCommentDTO) {
        LOG.debug("Request to partially update CmsComment : {}", cmsCommentDTO);

        return cmsCommentRepository
            .findById(cmsCommentDTO.getId())
            .map(existingCmsComment -> {
                cmsCommentMapper.partialUpdate(existingCmsComment, cmsCommentDTO);

                return existingCmsComment;
            })
            .map(cmsCommentRepository::save)
            .map(cmsCommentMapper::toDto);
    }

    /**
     * Get all the cmsComments.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<CmsCommentDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all CmsComments");
        return cmsCommentRepository.findAll(pageable).map(cmsCommentMapper::toDto);
    }

    /**
     * Get all the cmsComments with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<CmsCommentDTO> findAllWithEagerRelationships(Pageable pageable) {
        return cmsCommentRepository.findAllWithEagerRelationships(pageable).map(cmsCommentMapper::toDto);
    }

    /**
     * Get one cmsComment by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CmsCommentDTO> findOne(Long id) {
        LOG.debug("Request to get CmsComment : {}", id);
        return cmsCommentRepository.findOneWithEagerRelationships(id).map(cmsCommentMapper::toDto);
    }

    /**
     * Delete the cmsComment by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete CmsComment : {}", id);
        cmsCommentRepository.deleteById(id);
    }
}
