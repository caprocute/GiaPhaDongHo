package vn.giapha.web.rest;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
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
import vn.giapha.domain.UnionMember;
import vn.giapha.repository.UnionMemberRepository;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST controller for managing {@link vn.giapha.domain.UnionMember}.
 */
@RestController
@RequestMapping("/api/union-members")
@Transactional
public class UnionMemberResource {

    private static final Logger LOG = LoggerFactory.getLogger(UnionMemberResource.class);

    private static final String ENTITY_NAME = "unionMember";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final UnionMemberRepository unionMemberRepository;

    public UnionMemberResource(UnionMemberRepository unionMemberRepository) {
        this.unionMemberRepository = unionMemberRepository;
    }

    /**
     * {@code POST  /union-members} : Create a new unionMember.
     *
     * @param unionMember the unionMember to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new unionMember, or with status {@code 400 (Bad Request)} if the unionMember has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    public ResponseEntity<UnionMember> createUnionMember(@Valid @RequestBody UnionMember unionMember) throws URISyntaxException {
        LOG.debug("REST request to save UnionMember : {}", unionMember);
        if (unionMember.getId() != null) {
            throw new BadRequestAlertException("A new unionMember cannot already have an ID", ENTITY_NAME, "idexists");
        }
        unionMember = unionMemberRepository.save(unionMember);
        return ResponseEntity.created(new URI("/api/union-members/" + unionMember.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, unionMember.getId().toString()))
            .body(unionMember);
    }

    /**
     * {@code PUT  /union-members/:id} : Updates an existing unionMember.
     *
     * @param id the id of the unionMember to save.
     * @param unionMember the unionMember to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated unionMember,
     * or with status {@code 400 (Bad Request)} if the unionMember is not valid,
     * or with status {@code 500 (Internal Server Error)} if the unionMember couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    public ResponseEntity<UnionMember> updateUnionMember(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody UnionMember unionMember
    ) throws URISyntaxException {
        LOG.debug("REST request to update UnionMember : {}, {}", id, unionMember);
        if (unionMember.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, unionMember.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!unionMemberRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        unionMember = unionMemberRepository.save(unionMember);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, unionMember.getId().toString()))
            .body(unionMember);
    }

    /**
     * {@code PATCH  /union-members/:id} : Partial updates given fields of an existing unionMember, field will ignore if it is null
     *
     * @param id the id of the unionMember to save.
     * @param unionMember the unionMember to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated unionMember,
     * or with status {@code 400 (Bad Request)} if the unionMember is not valid,
     * or with status {@code 404 (Not Found)} if the unionMember is not found,
     * or with status {@code 500 (Internal Server Error)} if the unionMember couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    public ResponseEntity<UnionMember> partialUpdateUnionMember(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody UnionMember unionMember
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update UnionMember partially : {}, {}", id, unionMember);
        if (unionMember.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, unionMember.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!unionMemberRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<UnionMember> result = unionMemberRepository
            .findById(unionMember.getId())
            .map(existingUnionMember -> {
                updateIfPresent(existingUnionMember::setRole, unionMember.getRole());

                return existingUnionMember;
            })
            .map(unionMemberRepository::save);

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, unionMember.getId().toString())
        );
    }

    /**
     * {@code GET  /union-members} : get all the Union Members.
     *
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of Union Members in body.
     */
    @GetMapping("")
    public List<UnionMember> getAllUnionMembers(
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get all UnionMembers");
        if (eagerload) {
            return unionMemberRepository.findAllWithEagerRelationships();
        } else {
            return unionMemberRepository.findAll();
        }
    }

    /**
     * {@code GET  /union-members/:id} : get the "id" unionMember.
     *
     * @param id the id of the unionMember to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the unionMember, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<UnionMember> getUnionMember(@PathVariable("id") Long id) {
        LOG.debug("REST request to get UnionMember : {}", id);
        Optional<UnionMember> unionMember = unionMemberRepository.findOneWithEagerRelationships(id);
        return ResponseUtil.wrapOrNotFound(unionMember);
    }

    /**
     * {@code DELETE  /union-members/:id} : delete the "id" unionMember.
     *
     * @param id the id of the unionMember to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUnionMember(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete UnionMember : {}", id);
        unionMemberRepository.deleteById(id);
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
