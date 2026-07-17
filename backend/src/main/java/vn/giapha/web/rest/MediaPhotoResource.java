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
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.repository.MediaPhotoRepository;
import vn.giapha.service.MediaPhotoService;
import vn.giapha.service.dto.MediaPhotoDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;
import vn.giapha.web.util.PagedResponses;

/**
 * REST controller for managing {@link vn.giapha.domain.MediaPhoto}.
 */
@RestController
@RequestMapping("/api/media-photos")
public class MediaPhotoResource {

    private static final Logger LOG = LoggerFactory.getLogger(MediaPhotoResource.class);

    private static final String ENTITY_NAME = "mediaPhoto";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final MediaPhotoService mediaPhotoService;

    private final MediaPhotoRepository mediaPhotoRepository;

    public MediaPhotoResource(MediaPhotoService mediaPhotoService, MediaPhotoRepository mediaPhotoRepository) {
        this.mediaPhotoService = mediaPhotoService;
        this.mediaPhotoRepository = mediaPhotoRepository;
    }

    /**
     * {@code POST  /media-photos} : Create a new mediaPhoto.
     *
     * @param mediaPhotoDTO the mediaPhotoDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new mediaPhotoDTO, or with status {@code 400 (Bad Request)} if the mediaPhoto has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("media:photo:write")
    public ResponseEntity<MediaPhotoDTO> createMediaPhoto(@Valid @RequestBody MediaPhotoDTO mediaPhotoDTO) throws URISyntaxException {
        LOG.debug("REST request to save MediaPhoto : {}", mediaPhotoDTO);
        if (mediaPhotoDTO.getId() != null) {
            throw new BadRequestAlertException("A new mediaPhoto cannot already have an ID", ENTITY_NAME, "idexists");
        }
        mediaPhotoDTO = mediaPhotoService.save(mediaPhotoDTO);
        return ResponseEntity.created(new URI("/api/media-photos/" + mediaPhotoDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, mediaPhotoDTO.getId().toString()))
            .body(mediaPhotoDTO);
    }

    /**
     * {@code PUT  /media-photos/:id} : Updates an existing mediaPhoto.
     *
     * @param id the id of the mediaPhotoDTO to save.
     * @param mediaPhotoDTO the mediaPhotoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mediaPhotoDTO,
     * or with status {@code 400 (Bad Request)} if the mediaPhotoDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the mediaPhotoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("media:photo:write")
    public ResponseEntity<MediaPhotoDTO> updateMediaPhoto(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody MediaPhotoDTO mediaPhotoDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update MediaPhoto : {}, {}", id, mediaPhotoDTO);
        if (mediaPhotoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mediaPhotoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!mediaPhotoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        mediaPhotoDTO = mediaPhotoService.update(mediaPhotoDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, mediaPhotoDTO.getId().toString()))
            .body(mediaPhotoDTO);
    }

    /**
     * {@code PATCH  /media-photos/:id} : Partial updates given fields of an existing mediaPhoto, field will ignore if it is null
     *
     * @param id the id of the mediaPhotoDTO to save.
     * @param mediaPhotoDTO the mediaPhotoDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mediaPhotoDTO,
     * or with status {@code 400 (Bad Request)} if the mediaPhotoDTO is not valid,
     * or with status {@code 404 (Not Found)} if the mediaPhotoDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the mediaPhotoDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("media:photo:write")
    public ResponseEntity<MediaPhotoDTO> partialUpdateMediaPhoto(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody MediaPhotoDTO mediaPhotoDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update MediaPhoto partially : {}, {}", id, mediaPhotoDTO);
        if (mediaPhotoDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mediaPhotoDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!mediaPhotoRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<MediaPhotoDTO> result = mediaPhotoService.partialUpdate(mediaPhotoDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, mediaPhotoDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /media-photos} : get all the Media Photos.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Media Photos in body.
     */
    @GetMapping("")
    public ResponseEntity<List<MediaPhotoDTO>> getAllMediaPhotos(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("REST request to get all MediaPhotos");
        return PagedResponses.ok(mediaPhotoService.findAll(), pageable);
    }

    /**
     * {@code GET  /media-photos/:id} : get the "id" mediaPhoto.
     *
     * @param id the id of the mediaPhotoDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the mediaPhotoDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MediaPhotoDTO> getMediaPhoto(@PathVariable("id") Long id) {
        LOG.debug("REST request to get MediaPhoto : {}", id);
        Optional<MediaPhotoDTO> mediaPhotoDTO = mediaPhotoService.findOne(id);
        return ResponseUtil.wrapOrNotFound(mediaPhotoDTO);
    }

    /**
     * {@code DELETE  /media-photos/:id} : delete the "id" mediaPhoto.
     *
     * @param id the id of the mediaPhotoDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("media:photo:write")
    public ResponseEntity<Void> deleteMediaPhoto(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete MediaPhoto : {}", id);
        mediaPhotoService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
