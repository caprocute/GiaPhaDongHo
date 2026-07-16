package vn.giapha.web.rest;

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
import vn.giapha.repository.FamilyUnionRepository;
import vn.giapha.service.FamilyUnionService;
import vn.giapha.service.dto.FamilyUnionDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.FamilyUnion}.
 */
@RestController
@RequestMapping("/api/family-unions")
public class FamilyUnionResource {

    private static final Logger LOG = LoggerFactory.getLogger(FamilyUnionResource.class);

    private static final String ENTITY_NAME = "familyUnion";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final FamilyUnionService familyUnionService;

    private final FamilyUnionRepository familyUnionRepository;

    public FamilyUnionResource(FamilyUnionService familyUnionService, FamilyUnionRepository familyUnionRepository) {
        this.familyUnionService = familyUnionService;
        this.familyUnionRepository = familyUnionRepository;
    }

    /**
     * {@code POST  /family-unions} : Create a new familyUnion.
     *
     * @param familyUnionDTO the familyUnionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new familyUnionDTO, or with status {@code 400 (Bad Request)} if the familyUnion has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<FamilyUnionDTO> createFamilyUnion(@RequestBody FamilyUnionDTO familyUnionDTO) throws URISyntaxException {
        LOG.debug("REST request to save FamilyUnion : {}", familyUnionDTO);
        if (familyUnionDTO.getId() != null) {
            throw new BadRequestAlertException("A new familyUnion cannot already have an ID", ENTITY_NAME, "idexists");
        }
        familyUnionDTO = familyUnionService.save(familyUnionDTO);
        return ResponseEntity.created(new URI("/api/family-unions/" + familyUnionDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, familyUnionDTO.getId().toString()))
            .body(familyUnionDTO);
    }

    /**
     * {@code PUT  /family-unions/:id} : Updates an existing familyUnion.
     *
     * @param id the id of the familyUnionDTO to save.
     * @param familyUnionDTO the familyUnionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated familyUnionDTO,
     * or with status {@code 400 (Bad Request)} if the familyUnionDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the familyUnionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<FamilyUnionDTO> updateFamilyUnion(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody FamilyUnionDTO familyUnionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update FamilyUnion : {}, {}", id, familyUnionDTO);
        if (familyUnionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, familyUnionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!familyUnionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        familyUnionDTO = familyUnionService.update(familyUnionDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, familyUnionDTO.getId().toString()))
            .body(familyUnionDTO);
    }

    /**
     * {@code PATCH  /family-unions/:id} : Partial updates given fields of an existing familyUnion, field will ignore if it is null
     *
     * @param id the id of the familyUnionDTO to save.
     * @param familyUnionDTO the familyUnionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated familyUnionDTO,
     * or with status {@code 400 (Bad Request)} if the familyUnionDTO is not valid,
     * or with status {@code 404 (Not Found)} if the familyUnionDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the familyUnionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<FamilyUnionDTO> partialUpdateFamilyUnion(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody FamilyUnionDTO familyUnionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update FamilyUnion partially : {}, {}", id, familyUnionDTO);
        if (familyUnionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, familyUnionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!familyUnionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<FamilyUnionDTO> result = familyUnionService.partialUpdate(familyUnionDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, familyUnionDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /family-unions} : get all the Family Unions.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Family Unions in body.
     */
    @GetMapping("")
    public List<FamilyUnionDTO> getAllFamilyUnions(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all FamilyUnions");
        return familyUnionService.findAll();
    }

    /**
     * {@code GET  /family-unions/:id} : get the "id" familyUnion.
     *
     * @param id the id of the familyUnionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the familyUnionDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FamilyUnionDTO> getFamilyUnion(@PathVariable("id") Long id) {
        LOG.debug("REST request to get FamilyUnion : {}", id);
        Optional<FamilyUnionDTO> familyUnionDTO = familyUnionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(familyUnionDTO);
    }

    /**
     * {@code DELETE  /family-unions/:id} : delete the "id" familyUnion.
     *
     * @param id the id of the familyUnionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFamilyUnion(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete FamilyUnion : {}", id);
        familyUnionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
