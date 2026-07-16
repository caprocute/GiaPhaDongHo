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
import vn.giapha.repository.ChangeRequestRepository;
import vn.giapha.service.ChangeRequestService;
import vn.giapha.service.dto.ChangeRequestDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.ChangeRequest}.
 */
@RestController
@RequestMapping("/api/change-requests")
public class ChangeRequestResource {

    private static final Logger LOG = LoggerFactory.getLogger(ChangeRequestResource.class);

    private static final String ENTITY_NAME = "changeRequest";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final ChangeRequestService changeRequestService;

    private final ChangeRequestRepository changeRequestRepository;

    public ChangeRequestResource(ChangeRequestService changeRequestService, ChangeRequestRepository changeRequestRepository) {
        this.changeRequestService = changeRequestService;
        this.changeRequestRepository = changeRequestRepository;
    }

    /**
     * {@code POST  /change-requests} : Create a new changeRequest.
     *
     * @param changeRequestDTO the changeRequestDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new changeRequestDTO, or with status {@code 400 (Bad Request)} if the changeRequest has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("moderation:request:write")
    public ResponseEntity<ChangeRequestDTO> createChangeRequest(@Valid @RequestBody ChangeRequestDTO changeRequestDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save ChangeRequest : {}", changeRequestDTO);
        if (changeRequestDTO.getId() != null) {
            throw new BadRequestAlertException("A new changeRequest cannot already have an ID", ENTITY_NAME, "idexists");
        }
        changeRequestDTO = changeRequestService.save(changeRequestDTO);
        return ResponseEntity.created(new URI("/api/change-requests/" + changeRequestDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, changeRequestDTO.getId().toString()))
            .body(changeRequestDTO);
    }

    /**
     * {@code PUT  /change-requests/:id} : Updates an existing changeRequest.
     *
     * @param id the id of the changeRequestDTO to save.
     * @param changeRequestDTO the changeRequestDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated changeRequestDTO,
     * or with status {@code 400 (Bad Request)} if the changeRequestDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the changeRequestDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("moderation:request:review")
    public ResponseEntity<ChangeRequestDTO> updateChangeRequest(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ChangeRequestDTO changeRequestDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ChangeRequest : {}, {}", id, changeRequestDTO);
        if (changeRequestDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, changeRequestDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!changeRequestRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        changeRequestDTO = changeRequestService.update(changeRequestDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, changeRequestDTO.getId().toString()))
            .body(changeRequestDTO);
    }

    /**
     * {@code PATCH  /change-requests/:id} : Partial updates given fields of an existing changeRequest, field will ignore if it is null
     *
     * @param id the id of the changeRequestDTO to save.
     * @param changeRequestDTO the changeRequestDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated changeRequestDTO,
     * or with status {@code 400 (Bad Request)} if the changeRequestDTO is not valid,
     * or with status {@code 404 (Not Found)} if the changeRequestDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the changeRequestDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("moderation:request:review")
    public ResponseEntity<ChangeRequestDTO> partialUpdateChangeRequest(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ChangeRequestDTO changeRequestDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ChangeRequest partially : {}, {}", id, changeRequestDTO);
        if (changeRequestDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, changeRequestDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!changeRequestRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ChangeRequestDTO> result = changeRequestService.partialUpdate(changeRequestDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, changeRequestDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /change-requests} : get all the Change Requests.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Change Requests in body.
     */
    @GetMapping("")
    @RequiresPermission("moderation:request:read")
    public ResponseEntity<List<ChangeRequestDTO>> getAllChangeRequests(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of ChangeRequests");
        Page<ChangeRequestDTO> page;
        if (eagerload) {
            page = changeRequestService.findAllWithEagerRelationships(pageable);
        } else {
            page = changeRequestService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /change-requests/:id} : get the "id" changeRequest.
     *
     * @param id the id of the changeRequestDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the changeRequestDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @RequiresPermission("moderation:request:read")
    public ResponseEntity<ChangeRequestDTO> getChangeRequest(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ChangeRequest : {}", id);
        Optional<ChangeRequestDTO> changeRequestDTO = changeRequestService.findOne(id);
        return ResponseUtil.wrapOrNotFound(changeRequestDTO);
    }

    /**
     * {@code DELETE  /change-requests/:id} : delete the "id" changeRequest.
     *
     * @param id the id of the changeRequestDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("moderation:request:review")
    public ResponseEntity<Void> deleteChangeRequest(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ChangeRequest : {}", id);
        changeRequestService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
