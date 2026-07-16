package vn.giapha.service;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.Person;
import vn.giapha.genealogy.api.DeathAnniversarySync;
import vn.giapha.genealogy.events.PersonUpdated;
import vn.giapha.repository.PersonRepository;
import vn.giapha.service.dto.PersonDTO;
import vn.giapha.service.mapper.PersonMapper;

/**
 * Service Implementation for managing {@link vn.giapha.domain.Person}.
 */
@Service
@Transactional
public class PersonService {

    private static final Logger LOG = LoggerFactory.getLogger(PersonService.class);

    private final PersonRepository personRepository;

    private final PersonMapper personMapper;

    private final DeathAnniversarySync deathAnniversarySync;

    private final ApplicationEventPublisher events;

    public PersonService(
        PersonRepository personRepository,
        PersonMapper personMapper,
        DeathAnniversarySync deathAnniversarySync,
        ApplicationEventPublisher events
    ) {
        this.personRepository = personRepository;
        this.personMapper = personMapper;
        this.deathAnniversarySync = deathAnniversarySync;
        this.events = events;
    }

    /**
     * Save a person.
     *
     * @param personDTO the entity to save.
     * @return the persisted entity.
     */
    public PersonDTO save(PersonDTO personDTO) {
        LOG.debug("Request to save Person : {}", personDTO);
        Person person = personMapper.toEntity(personDTO);
        person = personRepository.save(person);
        return afterPersist(person);
    }

    /**
     * Update a person.
     *
     * @param personDTO the entity to save.
     * @return the persisted entity.
     */
    public PersonDTO update(PersonDTO personDTO) {
        LOG.debug("Request to update Person : {}", personDTO);
        Person person = personMapper.toEntity(personDTO);
        person = personRepository.save(person);
        return afterPersist(person);
    }

    /**
     * Partially update a person.
     *
     * @param personDTO the entity to update partially.
     * @return the persisted entity.
     */
    public Optional<PersonDTO> partialUpdate(PersonDTO personDTO) {
        LOG.debug("Request to partially update Person : {}", personDTO);

        return personRepository
            .findById(personDTO.getId())
            .map(existingPerson -> {
                personMapper.partialUpdate(existingPerson, personDTO);

                return existingPerson;
            })
            .map(personRepository::save)
            .map(this::afterPersist);
    }

    /**
     * Get all the people.
     *
     * @param pageable the pagination information.
     * @return the list of entities.
     */
    @Transactional(readOnly = true)
    public Page<PersonDTO> findAll(Pageable pageable) {
        LOG.debug("Request to get all People");
        return personRepository.findAll(pageable).map(personMapper::toDto);
    }

    /**
     * Get all the people with eager load of many-to-many relationships.
     *
     * @return the list of entities.
     */
    public Page<PersonDTO> findAllWithEagerRelationships(Pageable pageable) {
        return personRepository.findAllWithEagerRelationships(pageable).map(personMapper::toDto);
    }

    /**
     * Get one person by id.
     *
     * @param id the id of the entity.
     * @return the entity.
     */
    @Transactional(readOnly = true)
    public Optional<PersonDTO> findOne(Long id) {
        LOG.debug("Request to get Person : {}", id);
        return personRepository.findOneWithEagerRelationships(id).map(personMapper::toDto);
    }

    /**
     * Delete the person by id.
     *
     * @param id the id of the entity.
     */
    public void delete(Long id) {
        LOG.debug("Request to delete Person : {}", id);
        deathAnniversarySync.removeForPerson(id);
        personRepository.deleteById(id);
    }

    private PersonDTO afterPersist(Person person) {
        Person withRels = personRepository.findOneWithEagerRelationships(person.getId()).orElse(person);
        deathAnniversarySync.syncFromPerson(withRels);
        PersonDTO dto = personMapper.toDto(withRels);
        String slug = withRels.getTree() != null ? withRels.getTree().getSlug() : null;
        events.publishEvent(new PersonUpdated(dto.getId(), dto.getCode(), slug, dto.getLifeStatus()));
        return dto;
    }
}
