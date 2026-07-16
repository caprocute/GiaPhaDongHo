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
import vn.giapha.repository.NotificationOutboxRepository;
import vn.giapha.service.NotificationOutboxService;
import vn.giapha.service.dto.NotificationOutboxDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.NotificationOutbox}.
 */
@RestController
@RequestMapping("/api/notification-outboxes")
public class NotificationOutboxResource {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationOutboxResource.class);

    private static final String ENTITY_NAME = "notificationOutbox";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final NotificationOutboxService notificationOutboxService;

    private final NotificationOutboxRepository notificationOutboxRepository;

    public NotificationOutboxResource(
        NotificationOutboxService notificationOutboxService,
        NotificationOutboxRepository notificationOutboxRepository
    ) {
        this.notificationOutboxService = notificationOutboxService;
        this.notificationOutboxRepository = notificationOutboxRepository;
    }

    /**
     * {@code POST  /notification-outboxes} : Create a new notificationOutbox.
     *
     * @param notificationOutboxDTO the notificationOutboxDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new notificationOutboxDTO, or with status {@code 400 (Bad Request)} if the notificationOutbox has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("notify:outbox:write")
    public ResponseEntity<NotificationOutboxDTO> createNotificationOutbox(@Valid @RequestBody NotificationOutboxDTO notificationOutboxDTO)
        throws URISyntaxException {
        LOG.debug("REST request to save NotificationOutbox : {}", notificationOutboxDTO);
        if (notificationOutboxDTO.getId() != null) {
            throw new BadRequestAlertException("A new notificationOutbox cannot already have an ID", ENTITY_NAME, "idexists");
        }
        notificationOutboxDTO = notificationOutboxService.save(notificationOutboxDTO);
        return ResponseEntity.created(new URI("/api/notification-outboxes/" + notificationOutboxDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, notificationOutboxDTO.getId().toString()))
            .body(notificationOutboxDTO);
    }

    /**
     * {@code PUT  /notification-outboxes/:id} : Updates an existing notificationOutbox.
     *
     * @param id the id of the notificationOutboxDTO to save.
     * @param notificationOutboxDTO the notificationOutboxDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated notificationOutboxDTO,
     * or with status {@code 400 (Bad Request)} if the notificationOutboxDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the notificationOutboxDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("notify:outbox:write")
    public ResponseEntity<NotificationOutboxDTO> updateNotificationOutbox(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody NotificationOutboxDTO notificationOutboxDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update NotificationOutbox : {}, {}", id, notificationOutboxDTO);
        if (notificationOutboxDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, notificationOutboxDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!notificationOutboxRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        notificationOutboxDTO = notificationOutboxService.update(notificationOutboxDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, notificationOutboxDTO.getId().toString()))
            .body(notificationOutboxDTO);
    }

    /**
     * {@code PATCH  /notification-outboxes/:id} : Partial updates given fields of an existing notificationOutbox, field will ignore if it is null
     *
     * @param id the id of the notificationOutboxDTO to save.
     * @param notificationOutboxDTO the notificationOutboxDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated notificationOutboxDTO,
     * or with status {@code 400 (Bad Request)} if the notificationOutboxDTO is not valid,
     * or with status {@code 404 (Not Found)} if the notificationOutboxDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the notificationOutboxDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("notify:outbox:write")
    public ResponseEntity<NotificationOutboxDTO> partialUpdateNotificationOutbox(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody NotificationOutboxDTO notificationOutboxDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update NotificationOutbox partially : {}, {}", id, notificationOutboxDTO);
        if (notificationOutboxDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, notificationOutboxDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!notificationOutboxRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<NotificationOutboxDTO> result = notificationOutboxService.partialUpdate(notificationOutboxDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, notificationOutboxDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /notification-outboxes} : get all the Notification Outboxes.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Notification Outboxes in body.
     */
    @GetMapping("")
    @RequiresPermission("notify:outbox:read")
    public List<NotificationOutboxDTO> getAllNotificationOutboxes() {
        LOG.debug("REST request to get all NotificationOutboxes");
        return notificationOutboxService.findAll();
    }

    /**
     * {@code GET  /notification-outboxes/:id} : get the "id" notificationOutbox.
     *
     * @param id the id of the notificationOutboxDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the notificationOutboxDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @RequiresPermission("notify:outbox:read")
    public ResponseEntity<NotificationOutboxDTO> getNotificationOutbox(@PathVariable("id") Long id) {
        LOG.debug("REST request to get NotificationOutbox : {}", id);
        Optional<NotificationOutboxDTO> notificationOutboxDTO = notificationOutboxService.findOne(id);
        return ResponseUtil.wrapOrNotFound(notificationOutboxDTO);
    }

    /**
     * {@code DELETE  /notification-outboxes/:id} : delete the "id" notificationOutbox.
     *
     * @param id the id of the notificationOutboxDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("notify:outbox:write")
    public ResponseEntity<Void> deleteNotificationOutbox(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete NotificationOutbox : {}", id);
        notificationOutboxService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
