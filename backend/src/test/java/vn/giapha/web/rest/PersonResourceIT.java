package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.PersonAsserts.*;
import static vn.giapha.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.IntegrationTest;
import vn.giapha.domain.Person;
import vn.giapha.repository.PersonRepository;
import vn.giapha.service.PersonService;
import vn.giapha.service.dto.PersonDTO;
import vn.giapha.service.mapper.PersonMapper;

/**
 * Integration tests for the {@link PersonResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class PersonResourceIT {

    private static final String DEFAULT_CODE = "AAAAAAAAAA";
    private static final String UPDATED_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_FULL_NAME = "AAAAAAAAAA";
    private static final String UPDATED_FULL_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_TEN_HUY = "AAAAAAAAAA";
    private static final String UPDATED_TEN_HUY = "BBBBBBBBBB";

    private static final String DEFAULT_TEN_THUONG = "AAAAAAAAAA";
    private static final String UPDATED_TEN_THUONG = "BBBBBBBBBB";

    private static final String DEFAULT_GENDER = "AAAAAAAAAA";
    private static final String UPDATED_GENDER = "BBBBBBBBBB";

    private static final String DEFAULT_LIFE_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_LIFE_STATUS = "BBBBBBBBBB";

    private static final Integer DEFAULT_GENERATION = 1;
    private static final Integer UPDATED_GENERATION = 2;

    private static final String DEFAULT_LINEAGE_PATH = "AAAAAAAAAA";
    private static final String UPDATED_LINEAGE_PATH = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_BIRTH_SOLAR = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_BIRTH_SOLAR = LocalDate.parse("2023-12-28");

    private static final String DEFAULT_BIRTH_LUNAR_JSON = "AAAAAAAAAA";
    private static final String UPDATED_BIRTH_LUNAR_JSON = "BBBBBBBBBB";

    private static final LocalDate DEFAULT_DEATH_SOLAR = LocalDate.ofEpochDay(0L);
    private static final LocalDate UPDATED_DEATH_SOLAR = LocalDate.parse("2023-12-28");

    private static final String DEFAULT_DEATH_LUNAR_JSON = "AAAAAAAAAA";
    private static final String UPDATED_DEATH_LUNAR_JSON = "BBBBBBBBBB";

    private static final String DEFAULT_GRAVE_INFO = "AAAAAAAAAA";
    private static final String UPDATED_GRAVE_INFO = "BBBBBBBBBB";

    private static final Double DEFAULT_GRAVE_LAT = 1D;
    private static final Double UPDATED_GRAVE_LAT = 2D;

    private static final Double DEFAULT_GRAVE_LNG = 1D;
    private static final Double UPDATED_GRAVE_LNG = 2D;

    private static final String DEFAULT_BIOGRAPHY = "AAAAAAAAAA";
    private static final String UPDATED_BIOGRAPHY = "BBBBBBBBBB";

    private static final String DEFAULT_NOTES = "AAAAAAAAAA";
    private static final String UPDATED_NOTES = "BBBBBBBBBB";

    private static final String DEFAULT_PRIVACY = "AAAAAAAAAA";
    private static final String UPDATED_PRIVACY = "BBBBBBBBBB";

    private static final String DEFAULT_LINKED_USER_ID = "AAAAAAAAAA";
    private static final String UPDATED_LINKED_USER_ID = "BBBBBBBBBB";

    private static final Integer DEFAULT_VERSION = 1;
    private static final Integer UPDATED_VERSION = 2;

    private static final String ENTITY_API_URL = "/api/people";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private PersonRepository personRepository;

    @Mock
    private PersonRepository personRepositoryMock;

    @Autowired
    private PersonMapper personMapper;

    @Mock
    private PersonService personServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restPersonMockMvc;

    private Person person;

    private Person insertedPerson;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Person createEntity() {
        return new Person()
            .code(DEFAULT_CODE)
            .fullName(DEFAULT_FULL_NAME)
            .tenHuy(DEFAULT_TEN_HUY)
            .tenThuong(DEFAULT_TEN_THUONG)
            .gender(DEFAULT_GENDER)
            .lifeStatus(DEFAULT_LIFE_STATUS)
            .generation(DEFAULT_GENERATION)
            .lineagePath(DEFAULT_LINEAGE_PATH)
            .birthSolar(DEFAULT_BIRTH_SOLAR)
            .birthLunarJson(DEFAULT_BIRTH_LUNAR_JSON)
            .deathSolar(DEFAULT_DEATH_SOLAR)
            .deathLunarJson(DEFAULT_DEATH_LUNAR_JSON)
            .graveInfo(DEFAULT_GRAVE_INFO)
            .graveLat(DEFAULT_GRAVE_LAT)
            .graveLng(DEFAULT_GRAVE_LNG)
            .biography(DEFAULT_BIOGRAPHY)
            .notes(DEFAULT_NOTES)
            .privacy(DEFAULT_PRIVACY)
            .linkedUserId(DEFAULT_LINKED_USER_ID)
            .version(DEFAULT_VERSION);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static Person createUpdatedEntity() {
        return new Person()
            .code(UPDATED_CODE)
            .fullName(UPDATED_FULL_NAME)
            .tenHuy(UPDATED_TEN_HUY)
            .tenThuong(UPDATED_TEN_THUONG)
            .gender(UPDATED_GENDER)
            .lifeStatus(UPDATED_LIFE_STATUS)
            .generation(UPDATED_GENERATION)
            .lineagePath(UPDATED_LINEAGE_PATH)
            .birthSolar(UPDATED_BIRTH_SOLAR)
            .birthLunarJson(UPDATED_BIRTH_LUNAR_JSON)
            .deathSolar(UPDATED_DEATH_SOLAR)
            .deathLunarJson(UPDATED_DEATH_LUNAR_JSON)
            .graveInfo(UPDATED_GRAVE_INFO)
            .graveLat(UPDATED_GRAVE_LAT)
            .graveLng(UPDATED_GRAVE_LNG)
            .biography(UPDATED_BIOGRAPHY)
            .notes(UPDATED_NOTES)
            .privacy(UPDATED_PRIVACY)
            .linkedUserId(UPDATED_LINKED_USER_ID)
            .version(UPDATED_VERSION);
    }

    @BeforeEach
    void initTest() {
        person = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedPerson != null) {
            personRepository.delete(insertedPerson);
            insertedPerson = null;
        }
    }

    @Test
    @Transactional
    void createPerson() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the Person
        PersonDTO personDTO = personMapper.toDto(person);
        var returnedPersonDTO = om.readValue(
            restPersonMockMvc
                .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personDTO)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            PersonDTO.class
        );

        // Validate the Person in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedPerson = personMapper.toEntity(returnedPersonDTO);
        assertPersonUpdatableFieldsEquals(returnedPerson, getPersistedPerson(returnedPerson));

        insertedPerson = returnedPerson;
    }

    @Test
    @Transactional
    void createPersonWithExistingId() throws Exception {
        // Create the Person with an existing ID
        person.setId(1L);
        PersonDTO personDTO = personMapper.toDto(person);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restPersonMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personDTO)))
            .andExpect(status().isBadRequest());

        // Validate the Person in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkCodeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        person.setCode(null);

        // Create the Person, which fails.
        PersonDTO personDTO = personMapper.toDto(person);

        restPersonMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkFullNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        person.setFullName(null);

        // Create the Person, which fails.
        PersonDTO personDTO = personMapper.toDto(person);

        restPersonMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkGenderIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        person.setGender(null);

        // Create the Person, which fails.
        PersonDTO personDTO = personMapper.toDto(person);

        restPersonMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLifeStatusIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        person.setLifeStatus(null);

        // Create the Person, which fails.
        PersonDTO personDTO = personMapper.toDto(person);

        restPersonMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllPeople() throws Exception {
        // Initialize the database
        insertedPerson = personRepository.saveAndFlush(person);

        // Get all the personList
        restPersonMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(person.getId().intValue())))
            .andExpect(jsonPath("$.[*].code").value(hasItem(DEFAULT_CODE)))
            .andExpect(jsonPath("$.[*].fullName").value(hasItem(DEFAULT_FULL_NAME)))
            .andExpect(jsonPath("$.[*].tenHuy").value(hasItem(DEFAULT_TEN_HUY)))
            .andExpect(jsonPath("$.[*].tenThuong").value(hasItem(DEFAULT_TEN_THUONG)))
            .andExpect(jsonPath("$.[*].gender").value(hasItem(DEFAULT_GENDER)))
            .andExpect(jsonPath("$.[*].lifeStatus").value(hasItem(DEFAULT_LIFE_STATUS)))
            .andExpect(jsonPath("$.[*].generation").value(hasItem(DEFAULT_GENERATION)))
            .andExpect(jsonPath("$.[*].lineagePath").value(hasItem(DEFAULT_LINEAGE_PATH)))
            .andExpect(jsonPath("$.[*].birthSolar").value(hasItem(DEFAULT_BIRTH_SOLAR.toString())))
            .andExpect(jsonPath("$.[*].birthLunarJson").value(hasItem(DEFAULT_BIRTH_LUNAR_JSON)))
            .andExpect(jsonPath("$.[*].deathSolar").value(hasItem(DEFAULT_DEATH_SOLAR.toString())))
            .andExpect(jsonPath("$.[*].deathLunarJson").value(hasItem(DEFAULT_DEATH_LUNAR_JSON)))
            .andExpect(jsonPath("$.[*].graveInfo").value(hasItem(DEFAULT_GRAVE_INFO)))
            .andExpect(jsonPath("$.[*].graveLat").value(hasItem(DEFAULT_GRAVE_LAT)))
            .andExpect(jsonPath("$.[*].graveLng").value(hasItem(DEFAULT_GRAVE_LNG)))
            .andExpect(jsonPath("$.[*].biography").value(hasItem(DEFAULT_BIOGRAPHY)))
            .andExpect(jsonPath("$.[*].notes").value(hasItem(DEFAULT_NOTES)))
            .andExpect(jsonPath("$.[*].privacy").value(hasItem(DEFAULT_PRIVACY)))
            .andExpect(jsonPath("$.[*].linkedUserId").value(hasItem(DEFAULT_LINKED_USER_ID)))
            .andExpect(jsonPath("$.[*].version").value(hasItem(DEFAULT_VERSION)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllPeopleWithEagerRelationshipsIsEnabled() throws Exception {
        when(personServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restPersonMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(personServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllPeopleWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(personServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restPersonMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(personRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getPerson() throws Exception {
        // Initialize the database
        insertedPerson = personRepository.saveAndFlush(person);

        // Get the person
        restPersonMockMvc
            .perform(get(ENTITY_API_URL_ID, person.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(person.getId().intValue()))
            .andExpect(jsonPath("$.code").value(DEFAULT_CODE))
            .andExpect(jsonPath("$.fullName").value(DEFAULT_FULL_NAME))
            .andExpect(jsonPath("$.tenHuy").value(DEFAULT_TEN_HUY))
            .andExpect(jsonPath("$.tenThuong").value(DEFAULT_TEN_THUONG))
            .andExpect(jsonPath("$.gender").value(DEFAULT_GENDER))
            .andExpect(jsonPath("$.lifeStatus").value(DEFAULT_LIFE_STATUS))
            .andExpect(jsonPath("$.generation").value(DEFAULT_GENERATION))
            .andExpect(jsonPath("$.lineagePath").value(DEFAULT_LINEAGE_PATH))
            .andExpect(jsonPath("$.birthSolar").value(DEFAULT_BIRTH_SOLAR.toString()))
            .andExpect(jsonPath("$.birthLunarJson").value(DEFAULT_BIRTH_LUNAR_JSON))
            .andExpect(jsonPath("$.deathSolar").value(DEFAULT_DEATH_SOLAR.toString()))
            .andExpect(jsonPath("$.deathLunarJson").value(DEFAULT_DEATH_LUNAR_JSON))
            .andExpect(jsonPath("$.graveInfo").value(DEFAULT_GRAVE_INFO))
            .andExpect(jsonPath("$.graveLat").value(DEFAULT_GRAVE_LAT))
            .andExpect(jsonPath("$.graveLng").value(DEFAULT_GRAVE_LNG))
            .andExpect(jsonPath("$.biography").value(DEFAULT_BIOGRAPHY))
            .andExpect(jsonPath("$.notes").value(DEFAULT_NOTES))
            .andExpect(jsonPath("$.privacy").value(DEFAULT_PRIVACY))
            .andExpect(jsonPath("$.linkedUserId").value(DEFAULT_LINKED_USER_ID))
            .andExpect(jsonPath("$.version").value(DEFAULT_VERSION));
    }

    @Test
    @Transactional
    void getNonExistingPerson() throws Exception {
        // Get the person
        restPersonMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingPerson() throws Exception {
        // Initialize the database
        insertedPerson = personRepository.saveAndFlush(person);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the person
        Person updatedPerson = personRepository.findById(person.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedPerson are not directly saved in db
        em.detach(updatedPerson);
        updatedPerson
            .code(UPDATED_CODE)
            .fullName(UPDATED_FULL_NAME)
            .tenHuy(UPDATED_TEN_HUY)
            .tenThuong(UPDATED_TEN_THUONG)
            .gender(UPDATED_GENDER)
            .lifeStatus(UPDATED_LIFE_STATUS)
            .generation(UPDATED_GENERATION)
            .lineagePath(UPDATED_LINEAGE_PATH)
            .birthSolar(UPDATED_BIRTH_SOLAR)
            .birthLunarJson(UPDATED_BIRTH_LUNAR_JSON)
            .deathSolar(UPDATED_DEATH_SOLAR)
            .deathLunarJson(UPDATED_DEATH_LUNAR_JSON)
            .graveInfo(UPDATED_GRAVE_INFO)
            .graveLat(UPDATED_GRAVE_LAT)
            .graveLng(UPDATED_GRAVE_LNG)
            .biography(UPDATED_BIOGRAPHY)
            .notes(UPDATED_NOTES)
            .privacy(UPDATED_PRIVACY)
            .linkedUserId(UPDATED_LINKED_USER_ID)
            .version(UPDATED_VERSION);
        PersonDTO personDTO = personMapper.toDto(updatedPerson);

        restPersonMockMvc
            .perform(
                put(ENTITY_API_URL_ID, personDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(personDTO))
            )
            .andExpect(status().isOk());

        // Validate the Person in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedPersonToMatchAllProperties(updatedPerson);
    }

    @Test
    @Transactional
    void putNonExistingPerson() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        person.setId(longCount.incrementAndGet());

        // Create the Person
        PersonDTO personDTO = personMapper.toDto(person);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPersonMockMvc
            .perform(
                put(ENTITY_API_URL_ID, personDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(personDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Person in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchPerson() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        person.setId(longCount.incrementAndGet());

        // Create the Person
        PersonDTO personDTO = personMapper.toDto(person);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPersonMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(personDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Person in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamPerson() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        person.setId(longCount.incrementAndGet());

        // Create the Person
        PersonDTO personDTO = personMapper.toDto(person);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPersonMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(personDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the Person in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdatePersonWithPatch() throws Exception {
        // Initialize the database
        insertedPerson = personRepository.saveAndFlush(person);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the person using partial update
        Person partialUpdatedPerson = new Person();
        partialUpdatedPerson.setId(person.getId());

        partialUpdatedPerson
            .fullName(UPDATED_FULL_NAME)
            .tenHuy(UPDATED_TEN_HUY)
            .lifeStatus(UPDATED_LIFE_STATUS)
            .lineagePath(UPDATED_LINEAGE_PATH)
            .graveInfo(UPDATED_GRAVE_INFO)
            .graveLat(UPDATED_GRAVE_LAT)
            .graveLng(UPDATED_GRAVE_LNG)
            .linkedUserId(UPDATED_LINKED_USER_ID)
            .version(UPDATED_VERSION);

        restPersonMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPerson.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPerson))
            )
            .andExpect(status().isOk());

        // Validate the Person in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersonUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedPerson, person), getPersistedPerson(person));
    }

    @Test
    @Transactional
    void fullUpdatePersonWithPatch() throws Exception {
        // Initialize the database
        insertedPerson = personRepository.saveAndFlush(person);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the person using partial update
        Person partialUpdatedPerson = new Person();
        partialUpdatedPerson.setId(person.getId());

        partialUpdatedPerson
            .code(UPDATED_CODE)
            .fullName(UPDATED_FULL_NAME)
            .tenHuy(UPDATED_TEN_HUY)
            .tenThuong(UPDATED_TEN_THUONG)
            .gender(UPDATED_GENDER)
            .lifeStatus(UPDATED_LIFE_STATUS)
            .generation(UPDATED_GENERATION)
            .lineagePath(UPDATED_LINEAGE_PATH)
            .birthSolar(UPDATED_BIRTH_SOLAR)
            .birthLunarJson(UPDATED_BIRTH_LUNAR_JSON)
            .deathSolar(UPDATED_DEATH_SOLAR)
            .deathLunarJson(UPDATED_DEATH_LUNAR_JSON)
            .graveInfo(UPDATED_GRAVE_INFO)
            .graveLat(UPDATED_GRAVE_LAT)
            .graveLng(UPDATED_GRAVE_LNG)
            .biography(UPDATED_BIOGRAPHY)
            .notes(UPDATED_NOTES)
            .privacy(UPDATED_PRIVACY)
            .linkedUserId(UPDATED_LINKED_USER_ID)
            .version(UPDATED_VERSION);

        restPersonMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedPerson.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedPerson))
            )
            .andExpect(status().isOk());

        // Validate the Person in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersonUpdatableFieldsEquals(partialUpdatedPerson, getPersistedPerson(partialUpdatedPerson));
    }

    @Test
    @Transactional
    void patchNonExistingPerson() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        person.setId(longCount.incrementAndGet());

        // Create the Person
        PersonDTO personDTO = personMapper.toDto(person);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restPersonMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, personDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(personDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Person in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchPerson() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        person.setId(longCount.incrementAndGet());

        // Create the Person
        PersonDTO personDTO = personMapper.toDto(person);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPersonMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(personDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the Person in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamPerson() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        person.setId(longCount.incrementAndGet());

        // Create the Person
        PersonDTO personDTO = personMapper.toDto(person);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restPersonMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(personDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the Person in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deletePerson() throws Exception {
        // Initialize the database
        insertedPerson = personRepository.saveAndFlush(person);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the person
        restPersonMockMvc
            .perform(delete(ENTITY_API_URL_ID, person.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return personRepository.count();
    }

    protected void assertIncrementedRepositoryCount(long countBefore) {
        assertThat(countBefore + 1).isEqualTo(getRepositoryCount());
    }

    protected void assertDecrementedRepositoryCount(long countBefore) {
        assertThat(countBefore - 1).isEqualTo(getRepositoryCount());
    }

    protected void assertSameRepositoryCount(long countBefore) {
        assertThat(countBefore).isEqualTo(getRepositoryCount());
    }

    protected Person getPersistedPerson(Person person) {
        return personRepository.findById(person.getId()).orElseThrow();
    }

    protected void assertPersistedPersonToMatchAllProperties(Person expectedPerson) {
        assertPersonAllPropertiesEquals(expectedPerson, getPersistedPerson(expectedPerson));
    }

    protected void assertPersistedPersonToMatchUpdatableProperties(Person expectedPerson) {
        assertPersonAllUpdatablePropertiesEquals(expectedPerson, getPersistedPerson(expectedPerson));
    }
}
