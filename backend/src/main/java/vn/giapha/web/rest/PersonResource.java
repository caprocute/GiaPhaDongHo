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
import vn.giapha.genealogy.api.PersonPrivacyFilter;
import vn.giapha.repository.PersonRepository;
import vn.giapha.service.PersonService;
import vn.giapha.service.dto.PersonDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;
import vn.giapha.web.rest.support.PersonDtoPrivacyMapper;

/**
 * REST controller for managing {@link vn.giapha.domain.Person}.
 */
@RestController
@RequestMapping("/api/people")
public class PersonResource {

    private static final Logger LOG = LoggerFactory.getLogger(PersonResource.class);

    private static final String ENTITY_NAME = "person";

    @Value("${jhipster.clientApp.name:giapha}")
    private String applicationName;

    private final PersonService personService;

    private final PersonRepository personRepository;

    private final PersonPrivacyFilter personPrivacyFilter;

    public PersonResource(
        PersonService personService,
        PersonRepository personRepository,
        PersonPrivacyFilter personPrivacyFilter
    ) {
        this.personService = personService;
        this.personRepository = personRepository;
        this.personPrivacyFilter = personPrivacyFilter;
    }

    /**
     * {@code POST  /people} : Create a new person.
     *
     * @param personDTO the personDTO to create.
     * @return the {@link ResponseEntity} with status {@code 201 (Created)} and with body the new personDTO, or with status {@code 400 (Bad Request)} if the person has already an ID.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PostMapping("")
    @RequiresPermission("genealogy:person:write")
    public ResponseEntity<PersonDTO> createPerson(@Valid @RequestBody PersonDTO personDTO) throws URISyntaxException {
        LOG.debug("REST request to save Person : {}", personDTO);
        if (personDTO.getId() != null) {
            throw new BadRequestAlertException("A new person cannot already have an ID", ENTITY_NAME, "idexists");
        }
        personDTO = PersonDtoPrivacyMapper.apply(personService.save(personDTO), personPrivacyFilter);
        return ResponseEntity.created(new URI("/api/people/" + personDTO.getId()))
            .headers(HeaderUtil.createEntityCreationAlert(applicationName, false, ENTITY_NAME, personDTO.getId().toString()))
            .body(personDTO);
    }

    /**
     * {@code PUT  /people/:id} : Updates an existing person.
     *
     * @param id the id of the personDTO to save.
     * @param personDTO the personDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated personDTO,
     * or with status {@code 400 (Bad Request)} if the personDTO is not valid,
     * or with status {@code 500 (Internal Server Error)} if the personDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PutMapping("/{id}")
    @RequiresPermission("genealogy:person:write")
    public ResponseEntity<PersonDTO> updatePerson(
        @PathVariable(value = "id", required = false) final Long id,
        @Valid @RequestBody PersonDTO personDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to update Person : {}, {}", id, personDTO);
        if (personDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, personDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!personRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        personDTO = PersonDtoPrivacyMapper.apply(personService.update(personDTO), personPrivacyFilter);
        return ResponseEntity.ok()
            .headers(HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, personDTO.getId().toString()))
            .body(personDTO);
    }

    /**
     * {@code PATCH  /people/:id} : Partial updates given fields of an existing person, field will ignore if it is null
     *
     * @param id the id of the personDTO to save.
     * @param personDTO the personDTO to update.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the updated personDTO,
     * or with status {@code 400 (Bad Request)} if the personDTO is not valid,
     * or with status {@code 404 (Not Found)} if the personDTO is not found,
     * or with status {@code 500 (Internal Server Error)} if the personDTO couldn't be updated.
     * @throws URISyntaxException if the Location URI syntax is incorrect.
     */
    @PatchMapping(value = "/{id}", consumes = { "application/json", "application/merge-patch+json" })
    @RequiresPermission("genealogy:person:write")
    public ResponseEntity<PersonDTO> partialUpdatePerson(
        @PathVariable(value = "id", required = false) final Long id,
        @NotNull @RequestBody PersonDTO personDTO
    ) throws URISyntaxException {
        LOG.debug("REST request to partial update Person partially : {}, {}", id, personDTO);
        if (personDTO.getId() == null) {
            throw new BadRequestAlertException("Invalid id", ENTITY_NAME, "idnull");
        }
        if (!Objects.equals(id, personDTO.getId())) {
            throw new BadRequestAlertException("Invalid ID", ENTITY_NAME, "idinvalid");
        }

        if (!personRepository.existsById(id)) {
            throw new BadRequestAlertException("Entity not found", ENTITY_NAME, "idnotfound");
        }

        Optional<PersonDTO> result = personService
            .partialUpdate(personDTO)
            .map(dto -> PersonDtoPrivacyMapper.apply(dto, personPrivacyFilter));

        return ResponseUtil.wrapOrNotFound(
            result,
            HeaderUtil.createEntityUpdateAlert(applicationName, false, ENTITY_NAME, personDTO.getId().toString())
        );
    }

    /**
     * {@code GET  /people} : get all the People.
     *
     * @param pageable the pagination information.
     * @param eagerload flag to eager load entities from relationships (This is applicable for many-to-many).
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and the list of People in body.
     */
    @GetMapping("")
    public ResponseEntity<List<PersonDTO>> getAllPeople(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable,
        @RequestParam(name = "eagerload", required = false, defaultValue = "true") boolean eagerload
    ) {
        LOG.debug("REST request to get a page of People");
        Page<PersonDTO> page;
        if (eagerload) {
            page = personService.findAllWithEagerRelationships(pageable);
        } else {
            page = personService.findAll(pageable);
        }
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        List<PersonDTO> body = page.getContent().stream().map(dto -> PersonDtoPrivacyMapper.apply(dto, personPrivacyFilter)).toList();
        return ResponseEntity.ok().headers(headers).body(body);
    }

    /**
     * {@code GET  /people/:id} : get the "id" person.
     *
     * @param id the id of the personDTO to retrieve.
     * @return the {@link ResponseEntity} with status {@code 200 (OK)} and with body the personDTO, or with status {@code 404 (Not Found)}.
     */
    @GetMapping("/{id}")
    public ResponseEntity<PersonDTO> getPerson(@PathVariable("id") Long id) {
        LOG.debug("REST request to get Person : {}", id);
        Optional<PersonDTO> personDTO = personService.findOne(id).map(dto -> PersonDtoPrivacyMapper.apply(dto, personPrivacyFilter));
        return ResponseUtil.wrapOrNotFound(personDTO);
    }

    /**
     * {@code DELETE  /people/:id} : delete the "id" person.
     *
     * @param id the id of the personDTO to delete.
     * @return the {@link ResponseEntity} with status {@code 204 (NO_CONTENT)}.
     */
    @DeleteMapping("/{id}")
    @RequiresPermission("genealogy:person:write")
    public ResponseEntity<Void> deletePerson(@PathVariable("id") Long id) {
        LOG.debug("REST request to delete Person : {}", id);
        personService.delete(id);
        return ResponseEntity.noContent()
            .headers(HeaderUtil.createEntityDeletionAlert(applicationName, false, ENTITY_NAME, id.toString()))
            .build();
    }
}
