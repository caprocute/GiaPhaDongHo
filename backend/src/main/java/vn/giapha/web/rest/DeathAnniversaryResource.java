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
import vn.giapha.repository.DeathAnniversaryRepository;
import vn.giapha.service.DeathAnniversaryService;
import vn.giapha.service.dto.DeathAnniversaryDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.DeathAnniversary}.
 */
@RestController
@RequestMapping("/api/death-anniversaries")
public class DeathAnniversaryResource {

    private static final Logger LOG = LoggerFactory.getLogger(DeathAnniversaryResource.class);

    private static final String ENTITY_NAME = "deathAnniversary";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final DeathAnniversaryService deathAnniversaryService;

    private final DeathAnniversaryRepository deathAnniversaryRepository;

    public DeathAnniversaryResource(
        DeathAnniversaryService deathAnniversaryService,
        DeathAnniversaryRepository deathAnniversaryRepository
    ) {
        this.deathAnniversaryService = deathAnniversaryService;
        this.deathAnniversaryRepository = deathAnniversaryRepository;
    }

    /**
     * {@code POST  /death-anniversaries} : Create a new deathAnniversary.
     *
     * @param deathAnniversaryDTO the deathAnniversaryDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new deathAnniversaryDTO, or with status {@code 400 (Bad Request)} if the deathAnniversary has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<DeathAnniversaryDTO> createDeathAnniversary(@Valid @RequestBody DeathAnniversaryDTO deathAnniversaryDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save DeathAnniversary : {}", deathAnniversaryDTO);
        if (deathAnniversaryDTO.getId() != null) {
            throw new BadRequestAlertException("A new deathAnniversary cannot already have an ID", ENTITY_NAME, "idexists");
        }
        deathAnniversaryDTO = deathAnniversaryService.save(deathAnniversaryDTO);
        return ResponseEntity.created(new URI("/api/death-anniversaries/" + deathAnniversaryDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, deathAnniversaryDTO.getId().toString()))
            .body(deathAnniversaryDTO);
    }

    /**
     * {@code PUT  /death-anniversaries/:id} : Updates an existing deathAnniversary.
     *
     * @param id the id of the deathAnniversaryDTO to save.
     * @param deathAnniversaryDTO the deathAnniversaryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated deathAnniversaryDTO,
     * or with status {@code 400 (Bad Request)} if the deathAnniversaryDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the deathAnniversaryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<DeathAnniversaryDTO> updateDeathAnniversary(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DeathAnniversaryDTO deathAnniversaryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update DeathAnniversary : {}, {}", id, deathAnniversaryDTO);
        if (deathAnniversaryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, deathAnniversaryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!deathAnniversaryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        deathAnniversaryDTO = deathAnniversaryService.update(deathAnniversaryDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, deathAnniversaryDTO.getId().toString()))
            .body(deathAnniversaryDTO);
    }

    /**
     * {@code PATCH  /death-anniversaries/:id} : Partial updates given fields of an existing deathAnniversary, field will ignore if it is null
     *
     * @param id the id of the deathAnniversaryDTO to save.
     * @param deathAnniversaryDTO the deathAnniversaryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated deathAnniversaryDTO,
     * or with status {@code 400 (Bad Request)} if the deathAnniversaryDTO is not valid,
     * or with status {@code 404 (Not Found)} if the deathAnniversaryDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the deathAnniversaryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<DeathAnniversaryDTO> partialUpdateDeathAnniversary(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DeathAnniversaryDTO deathAnniversaryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update DeathAnniversary partially : {}, {}", id, deathAnniversaryDTO);
        if (deathAnniversaryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, deathAnniversaryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!deathAnniversaryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DeathAnniversaryDTO> result = deathAnniversaryService.partialUpdate(deathAnniversaryDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, deathAnniversaryDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /death-anniversaries} : get all the Death Anniversaries.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Death Anniversaries in body.
     */
    @GetMapping("")
    public List<DeathAnniversaryDTO> getAllDeathAnniversaries(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all DeathAnniversaries");
        return deathAnniversaryService.findAll();
    }

    /**
     * {@code GET  /death-anniversaries/:id} : get the "id" deathAnniversary.
     *
     * @param id the id of the deathAnniversaryDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the deathAnniversaryDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<DeathAnniversaryDTO> getDeathAnniversary(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DeathAnniversary : {}", id);
        Optional<DeathAnniversaryDTO> deathAnniversaryDTO = deathAnniversaryService.findOne(id);
        return ResponseUtil.wrapOrNotFound(deathAnniversaryDTO);
    }

    /**
     * {@code DELETE  /death-anniversaries/:id} : delete the "id" deathAnniversary.
     *
     * @param id the id of the deathAnniversaryDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDeathAnniversary(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DeathAnniversary : {}", id);
        deathAnniversaryService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
