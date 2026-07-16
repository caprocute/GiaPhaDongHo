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
import vn.giapha.repository.AnniversarySubscriptionRepository;
import vn.giapha.service.AnniversarySubscriptionService;
import vn.giapha.service.dto.AnniversarySubscriptionDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.AnniversarySubscription}.
 */
@RestController
@RequestMapping("/api/anniversary-subscriptions")
public class AnniversarySubscriptionResource {

    private static final Logger LOG = LoggerFactory.getLogger(AnniversarySubscriptionResource.class);

    private static final String ENTITY_NAME = "anniversarySubscription";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final AnniversarySubscriptionService anniversarySubscriptionService;

    private final AnniversarySubscriptionRepository anniversarySubscriptionRepository;

    public AnniversarySubscriptionResource(
        AnniversarySubscriptionService anniversarySubscriptionService,
        AnniversarySubscriptionRepository anniversarySubscriptionRepository
    ) {
        this.anniversarySubscriptionService = anniversarySubscriptionService;
        this.anniversarySubscriptionRepository = anniversarySubscriptionRepository;
    }

    /**
     * {@code POST  /anniversary-subscriptions} : Create a new anniversarySubscription.
     *
     * @param anniversarySubscriptionDTO the anniversarySubscriptionDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new anniversarySubscriptionDTO, or with status {@code 400 (Bad Request)} if the anniversarySubscription has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("notify:subscription:write")
    public ResponseEntity<AnniversarySubscriptionDTO> createAnniversarySubscription(
        @Valid @RequestBody AnniversarySubscriptionDTO anniversarySubscriptionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to save AnniversarySubscription : {}", anniversarySubscriptionDTO);
        if (anniversarySubscriptionDTO.getId() != null) {
            throw new BadRequestAlertException("A new anniversarySubscription cannot already have an ID", ENTITY_NAME, "idexists");
        }
        anniversarySubscriptionDTO = anniversarySubscriptionService.save(anniversarySubscriptionDTO);
        return ResponseEntity.created(new URI("/api/anniversary-subscriptions/" + anniversarySubscriptionDTO.getId()))
            .headers(
                HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, anniversarySubscriptionDTO.getId().toString())
            )
            .body(anniversarySubscriptionDTO);
    }

    /**
     * {@code PUT  /anniversary-subscriptions/:id} : Updates an existing anniversarySubscription.
     *
     * @param id the id of the anniversarySubscriptionDTO to save.
     * @param anniversarySubscriptionDTO the anniversarySubscriptionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated anniversarySubscriptionDTO,
     * or with status {@code 400 (Bad Request)} if the anniversarySubscriptionDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the anniversarySubscriptionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("notify:subscription:write")
    public ResponseEntity<AnniversarySubscriptionDTO> updateAnniversarySubscription(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody AnniversarySubscriptionDTO anniversarySubscriptionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update AnniversarySubscription : {}, {}", id, anniversarySubscriptionDTO);
        if (anniversarySubscriptionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, anniversarySubscriptionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!anniversarySubscriptionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        anniversarySubscriptionDTO = anniversarySubscriptionService.update(anniversarySubscriptionDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, anniversarySubscriptionDTO.getId().toString()))
            .body(anniversarySubscriptionDTO);
    }

    /**
     * {@code PATCH  /anniversary-subscriptions/:id} : Partial updates given fields of an existing anniversarySubscription, field will ignore if it is null
     *
     * @param id the id of the anniversarySubscriptionDTO to save.
     * @param anniversarySubscriptionDTO the anniversarySubscriptionDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated anniversarySubscriptionDTO,
     * or with status {@code 400 (Bad Request)} if the anniversarySubscriptionDTO is not valid,
     * or with status {@code 404 (Not Found)} if the anniversarySubscriptionDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the anniversarySubscriptionDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("notify:subscription:write")
    public ResponseEntity<AnniversarySubscriptionDTO> partialUpdateAnniversarySubscription(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody AnniversarySubscriptionDTO anniversarySubscriptionDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update AnniversarySubscription partially : {}, {}", id, anniversarySubscriptionDTO);
        if (anniversarySubscriptionDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, anniversarySubscriptionDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!anniversarySubscriptionRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<AnniversarySubscriptionDTO> result = anniversarySubscriptionService.partialUpdate(anniversarySubscriptionDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, anniversarySubscriptionDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /anniversary-subscriptions} : get all the Anniversary Subscriptions.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Anniversary Subscriptions in body.
     */
    @GetMapping("")
    @RequiresPermission("notify:subscription:read")
    public List<AnniversarySubscriptionDTO> getAllAnniversarySubscriptions(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all AnniversarySubscriptions");
        return anniversarySubscriptionService.findAll();
    }

    /**
     * {@code GET  /anniversary-subscriptions/:id} : get the "id" anniversarySubscription.
     *
     * @param id the id of the anniversarySubscriptionDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the anniversarySubscriptionDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @RequiresPermission("notify:subscription:read")
    public ResponseEntity<AnniversarySubscriptionDTO> getAnniversarySubscription(@PathVariable("id") Long id) {
        LOG.debug("REST request to get AnniversarySubscription : {}", id);
        Optional<AnniversarySubscriptionDTO> anniversarySubscriptionDTO = anniversarySubscriptionService.findOne(id);
        return ResponseUtil.wrapOrNotFound(anniversarySubscriptionDTO);
    }

    /**
     * {@code DELETE  /anniversary-subscriptions/:id} : delete the "id" anniversarySubscription.
     *
     * @param id the id of the anniversarySubscriptionDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("notify:subscription:write")
    public ResponseEntity<Void> deleteAnniversarySubscription(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete AnniversarySubscription : {}", id);
        anniversarySubscriptionService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
