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
import vn.giapha.repository.EventRsvpRepository;
import vn.giapha.service.EventRsvpService;
import vn.giapha.service.dto.EventRsvpDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.EventRsvp}.
 */
@RestController
@RequestMapping("/api/event-rsvps")
public class EventRsvpResource {

    private static final Logger LOG = LoggerFactory.getLogger(EventRsvpResource.class);

    private static final String ENTITY_NAME = "eventRsvp";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final EventRsvpService eventRsvpService;

    private final EventRsvpRepository eventRsvpRepository;

    public EventRsvpResource(EventRsvpService eventRsvpService, EventRsvpRepository eventRsvpRepository) {
        this.eventRsvpService = eventRsvpService;
        this.eventRsvpRepository = eventRsvpRepository;
    }

    /**
     * {@code POST  /event-rsvps} : Create a new eventRsvp.
     *
     * @param eventRsvpDTO the eventRsvpDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new eventRsvpDTO, or with status {@code 400 (Bad Request)} if the eventRsvp has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("event:rsvp:write")
    public ResponseEntity<EventRsvpDTO> createEventRsvp(@Valid @RequestBody EventRsvpDTO eventRsvpDTO) throws URISyntaxException {
        LOG.debug("REST request to save EventRsvp : {}", eventRsvpDTO);
        if (eventRsvpDTO.getId() != null) {
            throw new BadRequestAlertException("A new eventRsvp cannot already have an ID", ENTITY_NAME, "idexists");
        }
        eventRsvpDTO = eventRsvpService.save(eventRsvpDTO);
        return ResponseEntity.created(new URI("/api/event-rsvps/" + eventRsvpDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, eventRsvpDTO.getId().toString()))
            .body(eventRsvpDTO);
    }

    /**
     * {@code PUT  /event-rsvps/:id} : Updates an existing eventRsvp.
     *
     * @param id the id of the eventRsvpDTO to save.
     * @param eventRsvpDTO the eventRsvpDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated eventRsvpDTO,
     * or with status {@code 400 (Bad Request)} if the eventRsvpDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the eventRsvpDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("event:rsvp:write")
    public ResponseEntity<EventRsvpDTO> updateEventRsvp(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody EventRsvpDTO eventRsvpDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update EventRsvp : {}, {}", id, eventRsvpDTO);
        if (eventRsvpDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, eventRsvpDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!eventRsvpRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        eventRsvpDTO = eventRsvpService.update(eventRsvpDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, eventRsvpDTO.getId().toString()))
            .body(eventRsvpDTO);
    }

    /**
     * {@code PATCH  /event-rsvps/:id} : Partial updates given fields of an existing eventRsvp, field will ignore if it is null
     *
     * @param id the id of the eventRsvpDTO to save.
     * @param eventRsvpDTO the eventRsvpDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated eventRsvpDTO,
     * or with status {@code 400 (Bad Request)} if the eventRsvpDTO is not valid,
     * or with status {@code 404 (Not Found)} if the eventRsvpDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the eventRsvpDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("event:rsvp:write")
    public ResponseEntity<EventRsvpDTO> partialUpdateEventRsvp(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody EventRsvpDTO eventRsvpDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update EventRsvp partially : {}, {}", id, eventRsvpDTO);
        if (eventRsvpDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, eventRsvpDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!eventRsvpRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<EventRsvpDTO> result = eventRsvpService.partialUpdate(eventRsvpDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, eventRsvpDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /event-rsvps} : get all the Event Rsvps.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Event Rsvps in body.
     */
    @GetMapping("")
    @RequiresPermission("event:rsvp:read")
    public List<EventRsvpDTO> getAllEventRsvps(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all EventRsvps");
        return eventRsvpService.findAll();
    }

    /**
     * {@code GET  /event-rsvps/:id} : get the "id" eventRsvp.
     *
     * @param id the id of the eventRsvpDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the eventRsvpDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    @RequiresPermission("event:rsvp:read")
    public ResponseEntity<EventRsvpDTO> getEventRsvp(@PathVariable("id") Long id) {
        LOG.debug("REST request to get EventRsvp : {}", id);
        Optional<EventRsvpDTO> eventRsvpDTO = eventRsvpService.findOne(id);
        return ResponseUtil.wrapOrNotFound(eventRsvpDTO);
    }

    /**
     * {@code DELETE  /event-rsvps/:id} : delete the "id" eventRsvp.
     *
     * @param id the id of the eventRsvpDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("event:rsvp:write")
    public ResponseEntity<Void> deleteEventRsvp(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete EventRsvp : {}", id);
        eventRsvpService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
