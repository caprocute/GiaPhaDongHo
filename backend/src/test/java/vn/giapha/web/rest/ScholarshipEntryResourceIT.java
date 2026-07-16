package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.ScholarshipEntryAsserts.*;
import static vn.giapha.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
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
import vn.giapha.domain.ScholarshipEntry;
import vn.giapha.repository.ScholarshipEntryRepository;
import vn.giapha.service.ScholarshipEntryService;
import vn.giapha.service.dto.ScholarshipEntryDTO;
import vn.giapha.service.mapper.ScholarshipEntryMapper;

/**
 * Integration tests for the {@link ScholarshipEntryResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ScholarshipEntryResourceIT {

    private static final String DEFAULT_PERSON_NAME = "AAAAAAAAAA";
    private static final String UPDATED_PERSON_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_ACHIEVEMENT = "AAAAAAAAAA";
    private static final String UPDATED_ACHIEVEMENT = "BBBBBBBBBB";

    private static final Integer DEFAULT_YEAR = 1;
    private static final Integer UPDATED_YEAR = 2;

    private static final String DEFAULT_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_STATUS = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/scholarship-entries";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ScholarshipEntryRepository scholarshipEntryRepository;

    @Mock
    private ScholarshipEntryRepository scholarshipEntryRepositoryMock;

    @Autowired
    private ScholarshipEntryMapper scholarshipEntryMapper;

    @Mock
    private ScholarshipEntryService scholarshipEntryServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restScholarshipEntryMockMvc;

    private ScholarshipEntry scholarshipEntry;

    private ScholarshipEntry insertedScholarshipEntry;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ScholarshipEntry createEntity() {
        return new ScholarshipEntry()
            .personName(DEFAULT_PERSON_NAME)
            .achievement(DEFAULT_ACHIEVEMENT)
            .year(DEFAULT_YEAR)
            .status(DEFAULT_STATUS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ScholarshipEntry createUpdatedEntity() {
        return new ScholarshipEntry()
            .personName(UPDATED_PERSON_NAME)
            .achievement(UPDATED_ACHIEVEMENT)
            .year(UPDATED_YEAR)
            .status(UPDATED_STATUS);
    }

    @BeforeEach
    void initTest() {
        scholarshipEntry = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedScholarshipEntry != null) {
            scholarshipEntryRepository.delete(insertedScholarshipEntry);
            insertedScholarshipEntry = null;
        }
    }

    @Test
    @Transactional
    void createScholarshipEntry() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ScholarshipEntry
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);
        var returnedScholarshipEntryDTO = om.readValue(
            restScholarshipEntryMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(scholarshipEntryDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ScholarshipEntryDTO.class
        );

        // Validate the ScholarshipEntry in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedScholarshipEntry = scholarshipEntryMapper.toEntity(returnedScholarshipEntryDTO);
        assertScholarshipEntryUpdatableFieldsEquals(returnedScholarshipEntry, getPersistedScholarshipEntry(returnedScholarshipEntry));

        insertedScholarshipEntry = returnedScholarshipEntry;
    }

    @Test
    @Transactional
    void createScholarshipEntryWithExistingId() throws Exception {
        // Create the ScholarshipEntry with an existing ID
        scholarshipEntry.setId(1L);
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restScholarshipEntryMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ScholarshipEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkPersonNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        scholarshipEntry.setPersonName(null);

        // Create the ScholarshipEntry, which fails.
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);

        restScholarshipEntryMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkAchievementIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        scholarshipEntry.setAchievement(null);

        // Create the ScholarshipEntry, which fails.
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);

        restScholarshipEntryMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllScholarshipEntries() throws Exception {
        // Initialize the database
        insertedScholarshipEntry = scholarshipEntryRepository.saveAndFlush(scholarshipEntry);

        // Get all the scholarshipEntryList
        restScholarshipEntryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(scholarshipEntry.getId().intValue())))
            .andExpect(jsonPath("$.[*].personName").value(hasItem(DEFAULT_PERSON_NAME)))
            .andExpect(jsonPath("$.[*].achievement").value(hasItem(DEFAULT_ACHIEVEMENT)))
            .andExpect(jsonPath("$.[*].year").value(hasItem(DEFAULT_YEAR)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllScholarshipEntriesWithEagerRelationshipsIsEnabled() throws Exception {
        when(scholarshipEntryServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restScholarshipEntryMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(scholarshipEntryServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllScholarshipEntriesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(scholarshipEntryServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restScholarshipEntryMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(scholarshipEntryRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getScholarshipEntry() throws Exception {
        // Initialize the database
        insertedScholarshipEntry = scholarshipEntryRepository.saveAndFlush(scholarshipEntry);

        // Get the scholarshipEntry
        restScholarshipEntryMockMvc
            .perform(get(ENTITY_API_URL_ID, scholarshipEntry.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(scholarshipEntry.getId().intValue()))
            .andExpect(jsonPath("$.personName").value(DEFAULT_PERSON_NAME))
            .andExpect(jsonPath("$.achievement").value(DEFAULT_ACHIEVEMENT))
            .andExpect(jsonPath("$.year").value(DEFAULT_YEAR))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS));
    }

    @Test
    @Transactional
    void getNonExistingScholarshipEntry() throws Exception {
        // Get the scholarshipEntry
        restScholarshipEntryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingScholarshipEntry() throws Exception {
        // Initialize the database
        insertedScholarshipEntry = scholarshipEntryRepository.saveAndFlush(scholarshipEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the scholarshipEntry
        ScholarshipEntry updatedScholarshipEntry = scholarshipEntryRepository.findById(scholarshipEntry.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedScholarshipEntry are not directly saved in db
        em.detach(updatedScholarshipEntry);
        updatedScholarshipEntry.personName(UPDATED_PERSON_NAME).achievement(UPDATED_ACHIEVEMENT).year(UPDATED_YEAR).status(UPDATED_STATUS);
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(updatedScholarshipEntry);

        restScholarshipEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, scholarshipEntryDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isOk());

        // Validate the ScholarshipEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedScholarshipEntryToMatchAllProperties(updatedScholarshipEntry);
    }

    @Test
    @Transactional
    void putNonExistingScholarshipEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        scholarshipEntry.setId(longCount.incrementAndGet());

        // Create the ScholarshipEntry
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restScholarshipEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, scholarshipEntryDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ScholarshipEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchScholarshipEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        scholarshipEntry.setId(longCount.incrementAndGet());

        // Create the ScholarshipEntry
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restScholarshipEntryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ScholarshipEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamScholarshipEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        scholarshipEntry.setId(longCount.incrementAndGet());

        // Create the ScholarshipEntry
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restScholarshipEntryMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ScholarshipEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateScholarshipEntryWithPatch() throws Exception {
        // Initialize the database
        insertedScholarshipEntry = scholarshipEntryRepository.saveAndFlush(scholarshipEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the scholarshipEntry using partial update
        ScholarshipEntry partialUpdatedScholarshipEntry = new ScholarshipEntry();
        partialUpdatedScholarshipEntry.setId(scholarshipEntry.getId());

        partialUpdatedScholarshipEntry.personName(UPDATED_PERSON_NAME).status(UPDATED_STATUS);

        restScholarshipEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedScholarshipEntry.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedScholarshipEntry))
            )
            .andExpect(status().isOk());

        // Validate the ScholarshipEntry in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertScholarshipEntryUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedScholarshipEntry, scholarshipEntry),
            getPersistedScholarshipEntry(scholarshipEntry)
        );
    }

    @Test
    @Transactional
    void fullUpdateScholarshipEntryWithPatch() throws Exception {
        // Initialize the database
        insertedScholarshipEntry = scholarshipEntryRepository.saveAndFlush(scholarshipEntry);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the scholarshipEntry using partial update
        ScholarshipEntry partialUpdatedScholarshipEntry = new ScholarshipEntry();
        partialUpdatedScholarshipEntry.setId(scholarshipEntry.getId());

        partialUpdatedScholarshipEntry
            .personName(UPDATED_PERSON_NAME)
            .achievement(UPDATED_ACHIEVEMENT)
            .year(UPDATED_YEAR)
            .status(UPDATED_STATUS);

        restScholarshipEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedScholarshipEntry.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedScholarshipEntry))
            )
            .andExpect(status().isOk());

        // Validate the ScholarshipEntry in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertScholarshipEntryUpdatableFieldsEquals(
            partialUpdatedScholarshipEntry,
            getPersistedScholarshipEntry(partialUpdatedScholarshipEntry)
        );
    }

    @Test
    @Transactional
    void patchNonExistingScholarshipEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        scholarshipEntry.setId(longCount.incrementAndGet());

        // Create the ScholarshipEntry
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restScholarshipEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, scholarshipEntryDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ScholarshipEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchScholarshipEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        scholarshipEntry.setId(longCount.incrementAndGet());

        // Create the ScholarshipEntry
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restScholarshipEntryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ScholarshipEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamScholarshipEntry() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        scholarshipEntry.setId(longCount.incrementAndGet());

        // Create the ScholarshipEntry
        ScholarshipEntryDTO scholarshipEntryDTO = scholarshipEntryMapper.toDto(scholarshipEntry);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restScholarshipEntryMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(scholarshipEntryDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ScholarshipEntry in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteScholarshipEntry() throws Exception {
        // Initialize the database
        insertedScholarshipEntry = scholarshipEntryRepository.saveAndFlush(scholarshipEntry);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the scholarshipEntry
        restScholarshipEntryMockMvc
            .perform(delete(ENTITY_API_URL_ID, scholarshipEntry.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return scholarshipEntryRepository.count();
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

    protected ScholarshipEntry getPersistedScholarshipEntry(ScholarshipEntry scholarshipEntry) {
        return scholarshipEntryRepository.findById(scholarshipEntry.getId()).orElseThrow();
    }

    protected void assertPersistedScholarshipEntryToMatchAllProperties(ScholarshipEntry expectedScholarshipEntry) {
        assertScholarshipEntryAllPropertiesEquals(expectedScholarshipEntry, getPersistedScholarshipEntry(expectedScholarshipEntry));
    }

    protected void assertPersistedScholarshipEntryToMatchUpdatableProperties(ScholarshipEntry expectedScholarshipEntry) {
        assertScholarshipEntryAllUpdatablePropertiesEquals(
            expectedScholarshipEntry,
            getPersistedScholarshipEntry(expectedScholarshipEntry)
        );
    }
}
