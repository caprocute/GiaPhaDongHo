package vn.giapha.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.CmsPost;
import vn.giapha.repository.CmsPostRepository;
import vn.giapha.service.dto.CmsPostDTO;
import vn.giapha.service.mapper.CmsPostMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.CmsPost}.
 */
@Service
@Transactional
public class CmsPostService {

    private static final Logger LOG = LoggerFactory.getLogger(CmsPostService.class);

    private final CmsPostRepository cmsPostRepository;

    private final CmsPostMapper cmsPostMapper;

    public CmsPostService(CmsPostRepository cmsPostRepository, CmsPostMapper cmsPostMapper) {
        this.cmsPostRepository = cmsPostRepository;
        this.cmsPostMapper = cmsPostMapper;
    }

    /**
     * Save a cmsPost.
     *
     * @param cmsPostDTO the entity to save.
     * @return the persisted entity.
     */
    public CmsPostDTO save(CmsPostDTO cmsPostDTO) {
        LOG.debug("Request to save CmsPost : {}", cmsPostDTO);
        CmsPost cmsPost = cmsPostMapper.toEntity(cmsPostDTO);
        cmsPost = cmsPostRepository.save(cmsPost);
        return cmsPostMapper.toDto(cmsPost);
    }

    /**
     * Update a cmsPost.
     *
     * @param cmsPostDTO the entity to save.
     * @return the persisted entity.
     */
    public CmsPostDTO update(CmsPostDTO cmsPostDTO) {
        LOG.debug("Request to update CmsPost : {}", cmsPostDTO);
        CmsPost cmsPost = cmsPostMapper.toEntity(cmsPostDTO);
        cmsPost = cmsPostRepository.save(cmsPost);
        return cmsPostMapper.toDto(cmsPost);
    }

    /**
     * Partially update a cmsPost.
     *
     * @param cmsPostDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CmsPostDTO> partialUpdate(CmsPostDTO cmsPostDTO) {
        LOG.debug("Request to partially update CmsPost : {}", cmsPostDTO);

        return cmsPostRepository
            .findById(cmsPostDTO.getId())
            .map(existingCmsPost -> {
                cmsPostMapper.partialUpdate(existingCmsPost, cmsPostDTO);

                return existingCmsPost;
            })
            .map(cmsPostRepository::save)
            .map(cmsPostMapper::toDto);
    }

    /**
     * Get all the cmsPosts.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<CmsPostDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all CmsPosts");
        return cmsPostRepository.findAll(pageable).map(cmsPostMapper::toDto);
    }

    /**
     * Get all the cmsPosts with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<CmsPostDTO> findAllWithEagerRelationships(Pageable pageable) {
        return cmsPostRepository.findAllWithEagerRelationships(pageable).map(cmsPostMapper::toDto);
    }

    /**
     * Get one cmsPost by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CmsPostDTO> findOne(Long id) {
        LOG.debug("Request to get CmsPost : {}", id);
        return cmsPostRepository.findOneWithEagerRelationships(id).map(cmsPostMapper::toDto);
    }

    /**
     * Delete the cmsPost by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete CmsPost : {}", id);
        cmsPostRepository.deleteById(id);
    }
}
