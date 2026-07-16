package vn.giapha.service;

import java.util.LinkedList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.CmsCategory;
import vn.giapha.repository.CmsCategoryRepository;
import vn.giapha.service.dto.CmsCategoryDTO;
import vn.giapha.service.mapper.CmsCategoryMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.CmsCategory}.
 */
@Service
@Transactional
public class CmsCategoryService {

    private static final Logger LOG = LoggerFactory.getLogger(CmsCategoryService.class);

    private final CmsCategoryRepository cmsCategoryRepository;

    private final CmsCategoryMapper cmsCategoryMapper;

    public CmsCategoryService(CmsCategoryRepository cmsCategoryRepository, CmsCategoryMapper cmsCategoryMapper) {
        this.cmsCategoryRepository = cmsCategoryRepository;
        this.cmsCategoryMapper = cmsCategoryMapper;
    }

    /**
     * Save a cmsCategory.
     *
     * @param cmsCategoryDTO the entity to save.
     * @return the persisted entity.
     */
    public CmsCategoryDTO save(CmsCategoryDTO cmsCategoryDTO) {
        LOG.debug("Request to save CmsCategory : {}", cmsCategoryDTO);
        CmsCategory cmsCategory = cmsCategoryMapper.toEntity(cmsCategoryDTO);
        cmsCategory = cmsCategoryRepository.save(cmsCategory);
        return cmsCategoryMapper.toDto(cmsCategory);
    }

    /**
     * Update a cmsCategory.
     *
     * @param cmsCategoryDTO the entity to save.
     * @return the persisted entity.
     */
    public CmsCategoryDTO update(CmsCategoryDTO cmsCategoryDTO) {
        LOG.debug("Request to update CmsCategory : {}", cmsCategoryDTO);
        CmsCategory cmsCategory = cmsCategoryMapper.toEntity(cmsCategoryDTO);
        cmsCategory = cmsCategoryRepository.save(cmsCategory);
        return cmsCategoryMapper.toDto(cmsCategory);
    }

    /**
     * Partially update a cmsCategory.
     *
     * @param cmsCategoryDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<CmsCategoryDTO> partialUpdate(CmsCategoryDTO cmsCategoryDTO) {
        LOG.debug("Request to partially update CmsCategory : {}", cmsCategoryDTO);

        return cmsCategoryRepository
            .findById(cmsCategoryDTO.getId())
            .map(existingCmsCategory -> {
                cmsCategoryMapper.partialUpdate(existingCmsCategory, cmsCategoryDTO);

                return existingCmsCategory;
            })
            .map(cmsCategoryRepository::save)
            .map(cmsCategoryMapper::toDto);
    }

    /**
     * Get all the cmsCategories.
     *
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public List<CmsCategoryDTO> findAll() {
        LOG.debug("Request to get all CmsCategories");
        return cmsCategoryRepository.findAll().stream().map(cmsCategoryMapper::toDto).collect(Collectors.toCollection(LinkedList::new));
    }

    /**
     * Get one cmsCategory by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<CmsCategoryDTO> findOne(Long id) {
        LOG.debug("Request to get CmsCategory : {}", id);
        return cmsCategoryRepository.findById(id).map(cmsCategoryMapper::toDto);
    }

    /**
     * Delete the cmsCategory by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete CmsCategory : {}", id);
        cmsCategoryRepository.deleteById(id);
    }
}
