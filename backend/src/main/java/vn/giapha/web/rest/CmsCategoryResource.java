package vn.giapha.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import vn.giapha.repository.CmsCategoryRepository;
import vn.giapha.service.CmsCategoryService;
import vn.giapha.service.dto.CmsCategoryDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.CmsCategory}.
 */
@RestController
@RequestMapping("/api/cms-categories")
public class CmsCategoryResource {

    private static final Logger LOG = LoggerFactory.getLogger(CmsCategoryResource.class);

    private static final String ENTITY_NAME = "cmsCategory";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final CmsCategoryService cmsCategoryService;

    private final CmsCategoryRepository cmsCategoryRepository;

    public CmsCategoryResource(CmsCategoryService cmsCategoryService, CmsCategoryRepository cmsCategoryRepository) {
        this.cmsCategoryService = cmsCategoryService;
        this.cmsCategoryRepository = cmsCategoryRepository;
    }

    /**
     * {@code POST  /cms-categories} : Create a new cmsCategory.
     *
     * @param cmsCategoryDTO the cmsCategoryDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new cmsCategoryDTO, or with status {@code 400 (Bad Request)} if the cmsCategory has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<CmsCategoryDTO> createCmsCategory(@Valid @RequestBody CmsCategoryDTO cmsCategoryDTO) throws URISyntaxException {
        LOG.debug("REST request to save CmsCategory : {}", cmsCategoryDTO);
        if (cmsCategoryDTO.getId() != null) {
            throw new BadRequestAlertException("A new cmsCategory cannot already have an ID", ENTITY_NAME, "idexists");
        }
        cmsCategoryDTO = cmsCategoryService.save(cmsCategoryDTO);
        return ResponseEntity.created(new URI("/api/cms-categories/" + cmsCategoryDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, cmsCategoryDTO.getId().toString()))
            .body(cmsCategoryDTO);
    }

    /**
     * {@code PUT  /cms-categories/:id} : Updates an existing cmsCategory.
     *
     * @param id the id of the cmsCategoryDTO to save.
     * @param cmsCategoryDTO the cmsCategoryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cmsCategoryDTO,
     * or with status {@code 400 (Bad Request)} if the cmsCategoryDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the cmsCategoryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CmsCategoryDTO> updateCmsCategory(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CmsCategoryDTO cmsCategoryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update CmsCategory : {}, {}", id, cmsCategoryDTO);
        if (cmsCategoryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cmsCategoryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cmsCategoryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        cmsCategoryDTO = cmsCategoryService.update(cmsCategoryDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cmsCategoryDTO.getId().toString()))
            .body(cmsCategoryDTO);
    }

    /**
     * {@code PATCH  /cms-categories/:id} : Partial updates given fields of an existing cmsCategory, field will ignore if it is null
     *
     * @param id the id of the cmsCategoryDTO to save.
     * @param cmsCategoryDTO the cmsCategoryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cmsCategoryDTO,
     * or with status {@code 400 (Bad Request)} if the cmsCategoryDTO is not valid,
     * or with status {@code 404 (Not Found)} if the cmsCategoryDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the cmsCategoryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CmsCategoryDTO> partialUpdateCmsCategory(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CmsCategoryDTO cmsCategoryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CmsCategory partially : {}, {}", id, cmsCategoryDTO);
        if (cmsCategoryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cmsCategoryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cmsCategoryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CmsCategoryDTO> result = cmsCategoryService.partialUpdate(cmsCategoryDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cmsCategoryDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /cms-categories} : get all the Cms Categories.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Cms Categories in body.
     */
    @GetMapping("")
    public List<CmsCategoryDTO> getAllCmsCategories() {
        LOG.debug("REST request to get all CmsCategories");
        return cmsCategoryService.findAll();
    }

    /**
     * {@code GET  /cms-categories/:id} : get the "id" cmsCategory.
     *
     * @param id the id of the cmsCategoryDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the cmsCategoryDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CmsCategoryDTO> getCmsCategory(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CmsCategory : {}", id);
        Optional<CmsCategoryDTO> cmsCategoryDTO = cmsCategoryService.findOne(id);
        return ResponseUtil.wrapOrNotFound(cmsCategoryDTO);
    }

    /**
     * {@code DELETE  /cms-categories/:id} : delete the "id" cmsCategory.
     *
     * @param id the id of the cmsCategoryDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCmsCategory(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CmsCategory : {}", id);
        cmsCategoryService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
