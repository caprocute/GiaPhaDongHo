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
import vn.giapha.repository.DonationContributionRepository;
import vn.giapha.service.DonationContributionService;
import vn.giapha.service.dto.DonationContributionDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.DonationContribution}.
 */
@RestController
@RequestMapping("/api/donation-contributions")
public class DonationContributionResource {

    private static final Logger LOG = LoggerFactory.getLogger(DonationContributionResource.class);

    private static final String ENTITY_NAME = "donationContribution";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final DonationContributionService donationContributionService;

    private final DonationContributionRepository donationContributionRepository;

    public DonationContributionResource(
        DonationContributionService donationContributionService,
        DonationContributionRepository donationContributionRepository
    ) {
        this.donationContributionService = donationContributionService;
        this.donationContributionRepository = donationContributionRepository;
    }

    /**
     * {@code POST  /donation-contributions} : Create a new donationContribution.
     *
     * @param donationContributionDTO the donationContributionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new donationContributionDTO, or with status {@code 400 (Bad Request)} if the donationContribution has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("donation:contribution:write")
    public ResponseEntity<DonationContributionDTO> createDonationContribution(
        @Valid @RequestBody DonationContributionDTO donationContributionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to save DonationContribution : {}", donationContributionDTO);
        if (donationContributionDTO.getId() != null) {
            throw new BadRequestAlertException("A new donationContribution cannot already have an ID", ENTITY_NAME, "idexists");
        }
        donationContributionDTO = donationContributionService.save(donationContributionDTO);
        return ResponseEntity.created(new URI("/api/donation-contributions/" + donationContributionDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, donationContributionDTO.getId().toString()))
            .body(donationContributionDTO);
    }

    /**
     * {@code PUT  /donation-contributions/:id} : Updates an existing donationContribution.
     *
     * @param id the id of the donationContributionDTO to save.
     * @param donationContributionDTO the donationContributionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated donationContributionDTO,
     * or with status {@code 400 (Bad Request)} if the donationContributionDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the donationContributionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("donation:contribution:write")
    public ResponseEntity<DonationContributionDTO> updateDonationContribution(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DonationContributionDTO donationContributionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update DonationContribution : {}, {}", id, donationContributionDTO);
        if (donationContributionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, donationContributionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!donationContributionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        donationContributionDTO = donationContributionService.update(donationContributionDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, donationContributionDTO.getId().toString()))
            .body(donationContributionDTO);
    }

    /**
     * {@code PATCH  /donation-contributions/:id} : Partial updates given fields of an existing donationContribution, field will ignore if it is null
     *
     * @param id the id of the donationContributionDTO to save.
     * @param donationContributionDTO the donationContributionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated donationContributionDTO,
     * or with status {@code 400 (Bad Request)} if the donationContributionDTO is not valid,
     * or with status {@code 404 (Not Found)} if the donationContributionDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the donationContributionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("donation:contribution:write")
    public ResponseEntity<DonationContributionDTO> partialUpdateDonationContribution(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DonationContributionDTO donationContributionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update DonationContribution partially : {}, {}", id, donationContributionDTO);
        if (donationContributionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, donationContributionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!donationContributionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DonationContributionDTO> result = donationContributionService.partialUpdate(donationContributionDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, donationContributionDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /donation-contributions} : get all the Donation Contributions.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Donation Contributions in body.
     */
    @GetMapping("")
    @RequiresPermission("donation:contribution:read")
    public ResponseEntity<List<DonationContributionDTO>> getAllDonationContributions(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of DonationContributions");
        Page<DonationContributionDTO> page;
        if (eagerload) {
            page = donationContributionService.findAllWithEagerRelationships(pageable);
        } else {
            page = donationContributionService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /**
     * {@code GET  /donation-contributions/:id} : get the "id" donationContribution.
     *
     * @param id the id of the donationContributionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the donationContributionDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @RequiresPermission("donation:contribution:read")
    public ResponseEntity<DonationContributionDTO> getDonationContribution(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DonationContribution : {}", id);
        Optional<DonationContributionDTO> donationContributionDTO = donationContributionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(donationContributionDTO);
    }

    /**
     * {@code DELETE  /donation-contributions/:id} : delete the "id" donationContribution.
     *
     * @param id the id of the donationContributionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("donation:contribution:write")
    public ResponseEntity<Void> deleteDonationContribution(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DonationContribution : {}", id);
        donationContributionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
