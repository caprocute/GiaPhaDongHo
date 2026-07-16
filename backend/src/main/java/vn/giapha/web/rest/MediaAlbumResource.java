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
import vn.giapha.repository.MediaAlbumRepository;
import vn.giapha.service.MediaAlbumService;
import vn.giapha.service.dto.MediaAlbumDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.MediaAlbum}.
 */
@RestController
@RequestMapping("/api/media-albums")
public class MediaAlbumResource {

    private static final Logger LOG = LoggerFactory.getLogger(MediaAlbumResource.class);

    private static final String ENTITY_NAME = "mediaAlbum";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final MediaAlbumService mediaAlbumService;

    private final MediaAlbumRepository mediaAlbumRepository;

    public MediaAlbumResource(MediaAlbumService mediaAlbumService, MediaAlbumRepository mediaAlbumRepository) {
        this.mediaAlbumService = mediaAlbumService;
        this.mediaAlbumRepository = mediaAlbumRepository;
    }

    /**
     * {@code POST  /media-albums} : Create a new mediaAlbum.
     *
     * @param mediaAlbumDTO the mediaAlbumDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new mediaAlbumDTO, or with status {@code 400 (Bad Request)} if the mediaAlbum has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("media:album:write")
    public ResponseEntity<MediaAlbumDTO> createMediaAlbum(@Valid @RequestBody MediaAlbumDTO mediaAlbumDTO) throws URISyntaxException {
        LOG.debug("REST request to save MediaAlbum : {}", mediaAlbumDTO);
        if (mediaAlbumDTO.getId() != null) {
            throw new BadRequestAlertException("A new mediaAlbum cannot already have an ID", ENTITY_NAME, "idexists");
        }
        mediaAlbumDTO = mediaAlbumService.save(mediaAlbumDTO);
        return ResponseEntity.created(new URI("/api/media-albums/" + mediaAlbumDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, mediaAlbumDTO.getId().toString()))
            .body(mediaAlbumDTO);
    }

    /**
     * {@code PUT  /media-albums/:id} : Updates an existing mediaAlbum.
     *
     * @param id the id of the mediaAlbumDTO to save.
     * @param mediaAlbumDTO the mediaAlbumDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mediaAlbumDTO,
     * or with status {@code 400 (Bad Request)} if the mediaAlbumDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the mediaAlbumDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("media:album:write")
    public ResponseEntity<MediaAlbumDTO> updateMediaAlbum(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody MediaAlbumDTO mediaAlbumDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update MediaAlbum : {}, {}", id, mediaAlbumDTO);
        if (mediaAlbumDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mediaAlbumDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!mediaAlbumRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        mediaAlbumDTO = mediaAlbumService.update(mediaAlbumDTO);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, mediaAlbumDTO.getId().toString()))
            .body(mediaAlbumDTO);
    }

    /**
     * {@code PATCH  /media-albums/:id} : Partial updates given fields of an existing mediaAlbum, field will ignore if it is null
     *
     * @param id the id of the mediaAlbumDTO to save.
     * @param mediaAlbumDTO the mediaAlbumDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated mediaAlbumDTO,
     * or with status {@code 400 (Bad Request)} if the mediaAlbumDTO is not valid,
     * or with status {@code 404 (Not Found)} if the mediaAlbumDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the mediaAlbumDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("media:album:write")
    public ResponseEntity<MediaAlbumDTO> partialUpdateMediaAlbum(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody MediaAlbumDTO mediaAlbumDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update MediaAlbum partially : {}, {}", id, mediaAlbumDTO);
        if (mediaAlbumDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, mediaAlbumDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!mediaAlbumRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<MediaAlbumDTO> result = mediaAlbumService.partialUpdate(mediaAlbumDTO);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, mediaAlbumDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /media-albums} : get all the Media Albums.
     *
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Media Albums in body.
     */
    @GetMapping("")
    public List<MediaAlbumDTO> getAllMediaAlbums() {
        LOG.debug("REST request to get all MediaAlbums");
        return mediaAlbumService.findAll();
    }

    /**
     * {@code GET  /media-albums/:id} : get the "id" mediaAlbum.
     *
     * @param id the id of the mediaAlbumDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the mediaAlbumDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MediaAlbumDTO> getMediaAlbum(@PathVariable("id") Long id) {
        LOG.debug("REST request to get MediaAlbum : {}", id);
        Optional<MediaAlbumDTO> mediaAlbumDTO = mediaAlbumService.findOne(id);
        return ResponseUtil.wrapOrNotFound(mediaAlbumDTO);
    }

    /**
     * {@code DELETE  /media-albums/:id} : delete the "id" mediaAlbum.
     *
     * @param id the id of the mediaAlbumDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("media:album:write")
    public ResponseEntity<Void> deleteMediaAlbum(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete MediaAlbum : {}", id);
        mediaAlbumService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
