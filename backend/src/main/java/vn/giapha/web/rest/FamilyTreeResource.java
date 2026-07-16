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
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.service.FamilyTreeService;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.FamilyTree}.
 */
@RestController
@RequestMapping("/api/family-trees")
public class FamilyTreeResource {

    private static final Logger LOG = LoggerFactory.getLogger(FamilyTreeResource.class);

    private static final String ENTITY_NAME = "familyTree";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final FamilyTreeService familyTreeService;

    private final FamilyTreeRepository familyTreeRepository;

    public FamilyTreeResource(FamilyTreeService familyTreeService, FamilyTreeRepository familyTreeRepository) {
        this.familyTreeService = familyTreeService;
        this.familyTreeRepository = familyTreeRepository;
    }

    /**
     * {@code POST  /family-trees} : Create a new familyTree.
     *
     * @param familyTreeDTO the familyTreeDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new familyTreeDTO, or with status {@code 400 (Bad Request)} if the familyTree has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<FamilyTreeDTO> createFamilyTree(@Valid @RequestBody FamilyTreeDTO familyTreeDTO) throws URISyntaxException {
        LOG.debug("REST request to save FamilyTree : {}", familyTreeDTO);
        if (familyTreeDTO.getId() != null) {
            throw new BadRequestAlertException("A new familyTree cannot already have an ID", ENTITY_NAME, "idexists");
        }
        familyTreeDTO = familyTreeService.save(familyTreeDTO);
        return ResponseEntity.created(new URI("/api/family-trees/" + familyTreeDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, familyTreeDTO.getId().toString()))
            .body(familyTreeDTO);
    }

    /**
     * {@code PUT  /family-trees/:id} : Updates an existing familyTree.
     *
     * @param id the id of the familyTreeDTO to save.
     * @param familyTreeDTO the familyTreeDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated familyTreeDTO,
     * or with status {@code 400 (Bad Request)} if the familyTreeDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the familyTreeDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<FamilyTreeDTO> updateFamilyTree(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody FamilyTreeDTO familyTreeDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update FamilyTree : {}, {}", id, familyTreeDTO);
        if (familyTreeDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, familyTreeDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!familyTreeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        familyTreeDTO = familyTreeService.update(familyTreeDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, familyTreeDTO.getId().toString()))
            .body(familyTreeDTO);
    }

    /**
     * {@code PATCH  /family-trees/:id} : Partial updates given fields of an existing familyTree, field will ignore if it is null
     *
     * @param id the id of the familyTreeDTO to save.
     * @param familyTreeDTO the familyTreeDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated familyTreeDTO,
     * or with status {@code 400 (Bad Request)} if the familyTreeDTO is not valid,
     * or with status {@code 404 (Not Found)} if the familyTreeDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the familyTreeDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<FamilyTreeDTO> partialUpdateFamilyTree(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody FamilyTreeDTO familyTreeDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update FamilyTree partially : {}, {}", id, familyTreeDTO);
        if (familyTreeDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, familyTreeDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!familyTreeRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<FamilyTreeDTO> result = familyTreeService.partialUpdate(familyTreeDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, familyTreeDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /family-trees} : get all the Family Trees.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Family Trees in body.
     */
    @GetMapping("")
    public List<FamilyTreeDTO> getAllFamilyTrees() {
        LOG.debug("REST request to get all FamilyTrees");
        return familyTreeService.findAll();
    }

    /**
     * {@code GET  /family-trees/:id} : get the "id" familyTree.
     *
     * @param id the id of the familyTreeDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the familyTreeDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<FamilyTreeDTO> getFamilyTree(@PathVariable("id") Long id) {
        LOG.debug("REST request to get FamilyTree : {}", id);
        Optional<FamilyTreeDTO> familyTreeDTO = familyTreeService.findOne(id);
        return ResponseUtil.wrapOrNotFound(familyTreeDTO);
    }

    /**
     * {@code DELETE  /family-trees/:id} : delete the "id" familyTree.
     *
     * @param id the id of the familyTreeDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFamilyTree(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete FamilyTree : {}", id);
        familyTreeService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
