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
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.repository.ScholarshipEntryRepository;
import vn.giapha.service.ScholarshipEntryService;
import vn.giapha.service.dto.ScholarshipEntryDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.ScholarshipEntry}.
 */
@RestController
@RequestMapping("/api/scholarship-entries")
public class ScholarshipEntryResource {

    private static final Logger LOG = LoggerFactory.getLogger(ScholarshipEntryResource.class);

    private static final String ENTITY_NAME = "scholarshipEntry";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final ScholarshipEntryService scholarshipEntryService;

    private final ScholarshipEntryRepository scholarshipEntryRepository;

    public ScholarshipEntryResource(
        ScholarshipEntryService scholarshipEntryService,
        ScholarshipEntryRepository scholarshipEntryRepository
    ) {
        this.scholarshipEntryService = scholarshipEntryService;
        this.scholarshipEntryRepository = scholarshipEntryRepository;
    }

    /**
     * {@code POST  /scholarship-entries} : Create a new scholarshipEntry.
     *
     * @param scholarshipEntryDTO the scholarshipEntryDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new scholarshipEntryDTO, or with status {@code 400 (Bad Request)} if the scholarshipEntry has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("scholarship:entry:write")
    public ResponseEntity<ScholarshipEntryDTO> createScholarshipEntry(@Valid @RequestBody ScholarshipEntryDTO scholarshipEntryDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save ScholarshipEntry : {}", scholarshipEntryDTO);
        if (scholarshipEntryDTO.getId() != null) {
            throw new BadRequestAlertException("A new scholarshipEntry cannot already have an ID", ENTITY_NAME, "idexists");
        }
        scholarshipEntryDTO = scholarshipEntryService.save(scholarshipEntryDTO);
        return ResponseEntity.created(new URI("/api/scholarship-entries/" + scholarshipEntryDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, scholarshipEntryDTO.getId().toString()))
            .body(scholarshipEntryDTO);
    }

    /**
     * {@code PUT  /scholarship-entries/:id} : Updates an existing scholarshipEntry.
     *
     * @param id the id of the scholarshipEntryDTO to save.
     * @param scholarshipEntryDTO the scholarshipEntryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated scholarshipEntryDTO,
     * or with status {@code 400 (Bad Request)} if the scholarshipEntryDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the scholarshipEntryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("scholarship:entry:write")
    public ResponseEntity<ScholarshipEntryDTO> updateScholarshipEntry(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody ScholarshipEntryDTO scholarshipEntryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update ScholarshipEntry : {}, {}", id, scholarshipEntryDTO);
        if (scholarshipEntryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, scholarshipEntryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!scholarshipEntryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        scholarshipEntryDTO = scholarshipEntryService.update(scholarshipEntryDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, scholarshipEntryDTO.getId().toString()))
            .body(scholarshipEntryDTO);
    }

    /**
     * {@code PATCH  /scholarship-entries/:id} : Partial updates given fields of an existing scholarshipEntry, field will ignore if it is null
     *
     * @param id the id of the scholarshipEntryDTO to save.
     * @param scholarshipEntryDTO the scholarshipEntryDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated scholarshipEntryDTO,
     * or with status {@code 400 (Bad Request)} if the scholarshipEntryDTO is not valid,
     * or with status {@code 404 (Not Found)} if the scholarshipEntryDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the scholarshipEntryDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("scholarship:entry:write")
    public ResponseEntity<ScholarshipEntryDTO> partialUpdateScholarshipEntry(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody ScholarshipEntryDTO scholarshipEntryDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update ScholarshipEntry partially : {}, {}", id, scholarshipEntryDTO);
        if (scholarshipEntryDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, scholarshipEntryDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!scholarshipEntryRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<ScholarshipEntryDTO> result = scholarshipEntryService.partialUpdate(scholarshipEntryDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, scholarshipEntryDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /scholarship-entries} : get all the Scholarship Entries.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Scholarship Entries in body.
     */
    @GetMapping("")
    @RequiresPermission("scholarship:entry:read")
    public List<ScholarshipEntryDTO> getAllScholarshipEntries(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all ScholarshipEntries");
        return scholarshipEntryService.findAll();
    }

    /**
     * {@code GET  /scholarship-entries/:id} : get the "id" scholarshipEntry.
     *
     * @param id the id of the scholarshipEntryDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the scholarshipEntryDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @RequiresPermission("scholarship:entry:read")
    public ResponseEntity<ScholarshipEntryDTO> getScholarshipEntry(@PathVariable("id") Long id) {
        LOG.debug("REST request to get ScholarshipEntry : {}", id);
        Optional<ScholarshipEntryDTO> scholarshipEntryDTO = scholarshipEntryService.findOne(id);
        return ResponseUtil.wrapOrNotFound(scholarshipEntryDTO);
    }

    /**
     * {@code DELETE  /scholarship-entries/:id} : delete the "id" scholarshipEntry.
     *
     * @param id the id of the scholarshipEntryDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("scholarship:entry:write")
    public ResponseEntity<Void> deleteScholarshipEntry(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete ScholarshipEntry : {}", id);
        scholarshipEntryService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
