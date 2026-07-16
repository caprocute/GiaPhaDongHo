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
import vn.giapha.repository.CmsCommentRepository;
import vn.giapha.service.CmsCommentService;
import vn.giapha.service.dto.CmsCommentDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.CmsComment}.
 */
@RestController
@RequestMapping("/api/cms-comments")
public class CmsCommentResource {

    private static final Logger LOG = LoggerFactory.getLogger(CmsCommentResource.class);

    private static final String ENTITY_NAME = "cmsComment";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final CmsCommentService cmsCommentService;

    private final CmsCommentRepository cmsCommentRepository;

    public CmsCommentResource(CmsCommentService cmsCommentService, CmsCommentRepository cmsCommentRepository) {
        this.cmsCommentService = cmsCommentService;
        this.cmsCommentRepository = cmsCommentRepository;
    }

    /**
     * {@code POST  /cms-comments} : Create a new cmsComment.
     *
     * @param cmsCommentDTO the cmsCommentDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new cmsCommentDTO, or with status {@code 400 (Bad Request)} if the cmsComment has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<CmsCommentDTO> createCmsComment(@Valid @RequestBody CmsCommentDTO cmsCommentDTO) throws URISyntaxException {
        LOG.debug("REST request to save CmsComment : {}", cmsCommentDTO);
        if (cmsCommentDTO.getId() != null) {
            throw new BadRequestAlertException("A new cmsComment cannot already have an ID", ENTITY_NAME, "idexists");
        }
        cmsCommentDTO = cmsCommentService.save(cmsCommentDTO);
        return ResponseEntity.created(new URI("/api/cms-comments/" + cmsCommentDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, cmsCommentDTO.getId().toString()))
            .body(cmsCommentDTO);
    }

    /**
     * {@code PUT  /cms-comments/:id} : Updates an existing cmsComment.
     *
     * @param id the id of the cmsCommentDTO to save.
     * @param cmsCommentDTO the cmsCommentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cmsCommentDTO,
     * or with status {@code 400 (Bad Request)} if the cmsCommentDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the cmsCommentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<CmsCommentDTO> updateCmsComment(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody CmsCommentDTO cmsCommentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update CmsComment : {}, {}", id, cmsCommentDTO);
        if (cmsCommentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cmsCommentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cmsCommentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        cmsCommentDTO = cmsCommentService.update(cmsCommentDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cmsCommentDTO.getId().toString()))
            .body(cmsCommentDTO);
    }

    /**
     * {@code PATCH  /cms-comments/:id} : Partial updates given fields of an existing cmsComment, field will ignore if it is null
     *
     * @param id the id of the cmsCommentDTO to save.
     * @param cmsCommentDTO the cmsCommentDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated cmsCommentDTO,
     * or with status {@code 400 (Bad Request)} if the cmsCommentDTO is not valid,
     * or with status {@code 404 (Not Found)} if the cmsCommentDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the cmsCommentDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<CmsCommentDTO> partialUpdateCmsComment(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody CmsCommentDTO cmsCommentDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update CmsComment partially : {}, {}", id, cmsCommentDTO);
        if (cmsCommentDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, cmsCommentDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!cmsCommentRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<CmsCommentDTO> result = cmsCommentService.partialUpdate(cmsCommentDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, cmsCommentDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /cms-comments} : get all the Cms Comments.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Cms Comments in body.
     */
    @GetMapping("")
    public ResponseEntity<List<CmsCommentDTO>> getAllCmsComments(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of CmsComments");
        Page<CmsCommentDTO> page;
        if (eagerload) {
            page = cmsCommentService.findAllWithEagerRelationships(pageable);
        } else {
            page = cmsCommentService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /cms-comments/:id} : get the "id" cmsComment.
     *
     * @param id the id of the cmsCommentDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the cmsCommentDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<CmsCommentDTO> getCmsComment(@PathVariable("id") Long id) {
        LOG.debug("REST request to get CmsComment : {}", id);
        Optional<CmsCommentDTO> cmsCommentDTO = cmsCommentService.findOne(id);
        return ResponseUtil.wrapOrNotFound(cmsCommentDTO);
    }

    /**
     * {@code DELETE  /cms-comments/:id} : delete the "id" cmsComment.
     *
     * @param id the id of the cmsCommentDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCmsComment(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete CmsComment : {}", id);
        cmsCommentService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
