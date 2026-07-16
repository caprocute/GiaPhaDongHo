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
import vn.giapha.repository.DonationCampaignRepository;
import vn.giapha.service.DonationCampaignService;
import vn.giapha.service.dto.DonationCampaignDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.DonationCampaign}.
 */
@RestController
@RequestMapping("/api/donation-campaigns")
public class DonationCampaignResource {

    private static final Logger LOG = LoggerFactory.getLogger(DonationCampaignResource.class);

    private static final String ENTITY_NAME = "donationCampaign";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final DonationCampaignService donationCampaignService;

    private final DonationCampaignRepository donationCampaignRepository;

    public DonationCampaignResource(
        DonationCampaignService donationCampaignService,
        DonationCampaignRepository donationCampaignRepository
    ) {
        this.donationCampaignService = donationCampaignService;
        this.donationCampaignRepository = donationCampaignRepository;
    }

    /**
     * {@code POST  /donation-campaigns} : Create a new donationCampaign.
     *
     * @param donationCampaignDTO the donationCampaignDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new donationCampaignDTO, or with status {@code 400 (Bad Request)} if the donationCampaign has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("donation:campaign:write")
    public ResponseEntity<DonationCampaignDTO> createDonationCampaign(@Valid @RequestBody DonationCampaignDTO donationCampaignDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save DonationCampaign : {}", donationCampaignDTO);
        if (donationCampaignDTO.getId() != null) {
            throw new BadRequestAlertException("A new donationCampaign cannot already have an ID", ENTITY_NAME, "idexists");
        }
        donationCampaignDTO = donationCampaignService.save(donationCampaignDTO);
        return ResponseEntity.created(new URI("/api/donation-campaigns/" + donationCampaignDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, donationCampaignDTO.getId().toString()))
            .body(donationCampaignDTO);
    }

    /**
     * {@code PUT  /donation-campaigns/:id} : Updates an existing donationCampaign.
     *
     * @param id the id of the donationCampaignDTO to save.
     * @param donationCampaignDTO the donationCampaignDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated donationCampaignDTO,
     * or with status {@code 400 (Bad Request)} if the donationCampaignDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the donationCampaignDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("donation:campaign:write")
    public ResponseEntity<DonationCampaignDTO> updateDonationCampaign(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody DonationCampaignDTO donationCampaignDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update DonationCampaign : {}, {}", id, donationCampaignDTO);
        if (donationCampaignDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, donationCampaignDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!donationCampaignRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        donationCampaignDTO = donationCampaignService.update(donationCampaignDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, donationCampaignDTO.getId().toString()))
            .body(donationCampaignDTO);
    }

    /**
     * {@code PATCH  /donation-campaigns/:id} : Partial updates given fields of an existing donationCampaign, field will ignore if it is null
     *
     * @param id the id of the donationCampaignDTO to save.
     * @param donationCampaignDTO the donationCampaignDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated donationCampaignDTO,
     * or with status {@code 400 (Bad Request)} if the donationCampaignDTO is not valid,
     * or with status {@code 404 (Not Found)} if the donationCampaignDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the donationCampaignDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("donation:campaign:write")
    public ResponseEntity<DonationCampaignDTO> partialUpdateDonationCampaign(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody DonationCampaignDTO donationCampaignDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update DonationCampaign partially : {}, {}", id, donationCampaignDTO);
        if (donationCampaignDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, donationCampaignDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!donationCampaignRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<DonationCampaignDTO> result = donationCampaignService.partialUpdate(donationCampaignDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, donationCampaignDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /donation-campaigns} : get all the Donation Campaigns.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Donation Campaigns in body.
     */
    @GetMapping("")
    @RequiresPermission("donation:campaign:read")
    public List<DonationCampaignDTO> getAllDonationCampaigns(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all DonationCampaigns");
        return donationCampaignService.findAll();
    }

    /**
     * {@code GET  /donation-campaigns/:id} : get the "id" donationCampaign.
     *
     * @param id the id of the donationCampaignDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the donationCampaignDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @RequiresPermission("donation:campaign:read")
    public ResponseEntity<DonationCampaignDTO> getDonationCampaign(@PathVariable("id") Long id) {
        LOG.debug("REST request to get DonationCampaign : {}", id);
        Optional<DonationCampaignDTO> donationCampaignDTO = donationCampaignService.findOne(id);
        return ResponseUtil.wrapOrNotFound(donationCampaignDTO);
    }

    /**
     * {@code DELETE  /donation-campaigns/:id} : delete the "id" donationCampaign.
     *
     * @param id the id of the donationCampaignDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("donation:campaign:write")
    public ResponseEntity<Void> deleteDonationCampaign(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete DonationCampaign : {}", id);
        donationCampaignService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
