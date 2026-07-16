package vn.giapha.web.rest;

import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.function.Consumer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import tech.jhipster.web.util.HeaderUtil;
import tech.jhipster.web.util.ResponseUtil;
import vn.giapha.domain.UnionChild;
import vn.giapha.repository.UnionChildRepository;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.UnionChild}.
 */
@RestController
@RequestMapping("/api/union-children")
@Transactional
public class UnionChildResource {

    private static final Logger LOG = LoggerFactory.getLogger(UnionChildResource.class);

    private static final String ENTITY_NAME = "unionChild";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final UnionChildRepository unionChildRepository;

    public UnionChildResource(UnionChildRepository unionChildRepository) {
        this.unionChildRepository = unionChildRepository;
    }

    /**
     * {@code POST  /union-children} : Create a new unionChild.
     *
     * @param unionChild the unionChild to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new unionChild, or with status {@code 400 (Bad Request)} if the unionChild has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<UnionChild> createUnionChild(@RequestBody UnionChild unionChild) throws URISyntaxException {
        LOG.debug("REST request to save UnionChild : {}", unionChild);
        if (unionChild.getId() != null) {
            throw new BadRequestAlertException("A new unionChild cannot already have an ID", ENTITY_NAME, "idexists");
        }
        unionChild = unionChildRepository.save(unionChild);
        return ResponseEntity.created(new URI("/api/union-children/" + unionChild.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, unionChild.getId().toString()))
            .body(unionChild);
    }

    /**
     * {@code PUT  /union-children/:id} : Updates an existing unionChild.
     *
     * @param id the id of the unionChild to save.
     * @param unionChild the unionChild to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated unionChild,
     * or with status {@code 400 (Bad Request)} if the unionChild is not valid,
     * or with status {@code 500 (Internal Server Error)} if the unionChild couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UnionChild> updateUnionChild(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody UnionChild unionChild
    ) throws URISyntaxException {
        LOG.debug("REST request to update UnionChild : {}, {}", id, unionChild);
        if (unionChild.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, unionChild.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!unionChildRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        unionChild = unionChildRepository.save(unionChild);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, unionChild.getId().toString()))
            .body(unionChild);
    }

    /**
     * {@code PATCH  /union-children/:id} : Partial updates given fields of an existing unionChild, field will ignore if it is null
     *
     * @param id the id of the unionChild to save.
     * @param unionChild the unionChild to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated unionChild,
     * or with status {@code 400 (Bad Request)} if the unionChild is not valid,
     * or with status {@code 404 (Not Found)} if the unionChild is not found,
     * or with status {@code 500 (Internal Server Error)} if the unionChild couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<UnionChild> partialUpdateUnionChild(
        @PathVariable(value = "id", required = false) final Long id,
        @RequestBody UnionChild unionChild
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update UnionChild partially : {}, {}", id, unionChild);
        if (unionChild.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, unionChild.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!unionChildRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<UnionChild> result = unionChildRepository
            .findById(unionChild.getId())
            .map(existingUnionChild -> {
                updateIfPresent(existingUnionChild::setOrderNo, unionChild.getOrderNo());

                return existingUnionChild;
            })
            .map(unionChildRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, unionChild.getId().toString())
        );
    }

    /**
     * {@code GET  /union-children} : get all the Union Children.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Union Children in body.
     */
    @GetMapping("")
    public List<UnionChild> getAllUnionChildren(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all UnionChildren");
        if (eagerload) {
            return unionChildRepository.findAllWithEagerRelationships();
        } else {
            return unionChildRepository.findAll();
        }
    }

    /**
     * {@code GET  /union-children/:id} : get the "id" unionChild.
     *
     * @param id the id of the unionChild to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the unionChild, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UnionChild> getUnionChild(@PathVariable("id") Long id) {
        LOG.debug("REST request to get UnionChild : {}", id);
        Optional<UnionChild> unionChild = unionChildRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(unionChild);
    }

    /**
     * {@code DELETE  /union-children/:id} : delete the "id" unionChild.
     *
     * @param id the id of the unionChild to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnionChild(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete UnionChild : {}", id);
        unionChildRepository.deleteById(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }

    private <T> void updateIfPresent(Consumer<T> setter, T value) {
        if (value != null) {
            setter.accept(value);
        }
    }
}
