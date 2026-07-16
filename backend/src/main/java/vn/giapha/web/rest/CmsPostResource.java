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
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.repository.CmsPostRepository;
import vn.giapha.service.CmsPostService;
import vn.giapha.service.dto.CmsPostDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.CmsPost}.
 */
@RestController
@RequestMapping("/api/cms-posts")
public class CmsPostResource {

    private static final Logger LOG = LoggerFactory.getLogger(CmsPostResource.class);

    private static final String ENTITY_NAME = "cmsPost";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final CmsPostService cmsPostService;

    private final CmsPostRepository cmsPostRepository;

    public CmsPostResource(CmsPostService cmsPostService, CmsPostRepository cmsPostRepository) {
        this.cmsPostService = cmsPostService;
        this.cmsPostRepository = cmsPostRepository;
    }

    /**
     * {@code POST  /cms-posts} : Create a new cmsPost.
     *
     * @param cmsPostDTO the cmsPostDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new cmsPostDTO, or with status {@code 400 (Bad Request)} if the cmsPost has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("cms:post:write")
    public ResponseEntity<CmsPostDTO> createCmsPost(@Valid @RequestBody CmsPostDTO cmsPostDTO) throws URISyntaxException {
        LOG.debug("REST request to save CmsPost : {}", cmsPostDTO);
        if (cmsPostDTO.getId() != null) {
            throw new BadRequestAlertException("A new cmsPost cannot already have an ID", ENTITY_NAME, "idexists");
        }
        cmsPostDTO = cmsPostService.save(cmsPostDTO);
        return ResponseEntity.created(new URI("/api/cms-posts/" + cmsPostDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, cmsPostDTO.getId().toString()))
            .body(cmsPostDTO);
    }

    /**
     * {@code PUT  /cms-posts/:id} : Updates an existing cmsPost.
     *
     * @param id the id of the cmsPostDTO to save.
     * @param cmsPostDTO the cmsPostDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cmsPostDTO,
     * or with status {@code 400 (Bad Request)} if the cmsPostDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the cmsPostDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("cms:post:write")
    public ResponseEntity<CmsPostDTO> updateCmsPost(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CmsPostDTO cmsPostDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update CmsPost : {}, {}", id, cmsPostDTO);
        if (cmsPostDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cmsPostDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cmsPostRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        cmsPostDTO = cmsPostService.update(cmsPostDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cmsPostDTO.getId().toString()))
            .body(cmsPostDTO);
    }

    /**
     * {@code PATCH  /cms-posts/:id} : Partial updates given fields of an existing cmsPost, field will ignore if it is null
     *
     * @param id the id of the cmsPostDTO to save.
     * @param cmsPostDTO the cmsPostDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cmsPostDTO,
     * or with status {@code 400 (Bad Request)} if the cmsPostDTO is not valid,
     * or with status {@code 404 (Not Found)} if the cmsPostDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the cmsPostDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("cms:post:write")
    public ResponseEntity<CmsPostDTO> partialUpdateCmsPost(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CmsPostDTO cmsPostDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CmsPost partially : {}, {}", id, cmsPostDTO);
        if (cmsPostDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cmsPostDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cmsPostRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CmsPostDTO> result = cmsPostService.partialUpdate(cmsPostDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cmsPostDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /cms-posts} : get all the Cms Posts.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Cms Posts in body.
     */
    @GetMapping("")
    @RequiresPermission("cms:post:read")
    public ResponseEntity<List<CmsPostDTO>> getAllCmsPosts(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of CmsPosts");
        Page<CmsPostDTO> page;
        if (eagerload) {
            page = cmsPostService.findAllWithEagerRelationships(pageable);
        } else {
            page = cmsPostService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /cms-posts/:id} : get the "id" cmsPost.
     *
     * @param id the id of the cmsPostDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the cmsPostDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @RequiresPermission("cms:post:read")
    public ResponseEntity<CmsPostDTO> getCmsPost(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CmsPost : {}", id);
        Optional<CmsPostDTO> cmsPostDTO = cmsPostService.findOne(id);
        return ResponseUtil.wrapOrNotFound(cmsPostDTO);
    }

    /**
     * {@code DELETE  /cms-posts/:id} : delete the "id" cmsPost.
     *
     * @param id the id of the cmsPostDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("cms:post:write")
    public ResponseEntity<Void> deleteCmsPost(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CmsPost : {}", id);
        cmsPostService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
