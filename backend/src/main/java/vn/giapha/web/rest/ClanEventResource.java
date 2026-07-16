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
import vn.giapha.repository.ClanEventRepository;
import vn.giapha.service.ClanEventService;
import vn.giapha.service.dto.ClanEventDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.ClanEvent}.
 */
@RestController
@RequestMapping("/api/clan-events")
public class ClanEventResource {

    private static final Logger LOG = LoggerFactory.getLogger(ClanEventResource.class);

    private static final String ENTITY_NAME = "clanEvent";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final ClanEventService clanEventService;

    private final ClanEventRepository clanEventRepository;

    public ClanEventResource(ClanEventService clanEventService, ClanEventRepository clanEventRepository) {
        this.clanEventService = clanEventService;
        this.clanEventRepository = clanEventRepository;
    }

    /**
     * {@code POST  /clan-events} : Create a new clanEvent.
     *
     * @param clanEventDTO the clanEventDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new clanEventDTO, or with status {@code 400 (Bad Request)} if the clanEvent has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("event:clan:write")
    public ResponseEntity<ClanEventDTO> createClanEvent(@Valid @RequestBody ClanEventDTO clanEventDTO) throws URISyntaxException {
        LOG.debug("REST request to save ClanEvent : {}", clanEventDTO);
        if (clanEventDTO.getId() != null) {
            throw new BadRequestAlertException("A new clanEvent cannot already have an ID", ENTITY_NAME, "idexists");
        }
        clanEventDTO = clanEventService.save(clanEventDTO);
        return ResponseEntity.created(new URI("/api/clan-events/" + clanEventDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, clanEventDTO.getId().toString()))
            .body(clanEventDTO);
    }

    /**
     * {@code PUT  /clan-events/:id} : Updates an existing clanEvent.
     *
     * @param id the id of the clanEventDTO to save.
     * @param clanEventDTO the clanEventDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clanEventDTO,
     * or with status {@code 400 (Bad Request)} if the clanEventDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the clanEventDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("event:clan:write")
    public ResponseEntity<ClanEventDTO> updateClanEvent(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ClanEventDTO clanEventDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ClanEvent : {}, {}", id, clanEventDTO);
        if (clanEventDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clanEventDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clanEventRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        clanEventDTO = clanEventService.update(clanEventDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, clanEventDTO.getId().toString()))
            .body(clanEventDTO);
    }

    /**
     * {@code PATCH  /clan-events/:id} : Partial updates given fields of an existing clanEvent, field will ignore if it is null
     *
     * @param id the id of the clanEventDTO to save.
     * @param clanEventDTO the clanEventDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated clanEventDTO,
     * or with status {@code 400 (Bad Request)} if the clanEventDTO is not valid,
     * or with status {@code 404 (Not Found)} if the clanEventDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the clanEventDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("event:clan:write")
    public ResponseEntity<ClanEventDTO> partialUpdateClanEvent(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ClanEventDTO clanEventDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ClanEvent partially : {}, {}", id, clanEventDTO);
        if (clanEventDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, clanEventDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!clanEventRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ClanEventDTO> result = clanEventService.partialUpdate(clanEventDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, clanEventDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /clan-events} : get all the Clan Events.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Clan Events in body.
     */
    @GetMapping("")
    @RequiresPermission("event:clan:read")
    public ResponseEntity<List<ClanEventDTO>> getAllClanEvents(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of ClanEvents");
        Page<ClanEventDTO> page;
        if (eagerload) {
            page = clanEventService.findAllWithEagerRelationships(pageable);
        } else {
            page = clanEventService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /clan-events/:id} : get the "id" clanEvent.
     *
     * @param id the id of the clanEventDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the clanEventDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @RequiresPermission("event:clan:read")
    public ResponseEntity<ClanEventDTO> getClanEvent(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ClanEvent : {}", id);
        Optional<ClanEventDTO> clanEventDTO = clanEventService.findOne(id);
        return ResponseUtil.wrapOrNotFound(clanEventDTO);
    }

    /**
     * {@code DELETE  /clan-events/:id} : delete the "id" clanEvent.
     *
     * @param id the id of the clanEventDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("event:clan:write")
    public ResponseEntity<Void> deleteClanEvent(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ClanEvent : {}", id);
        clanEventService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
