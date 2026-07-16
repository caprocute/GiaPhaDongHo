package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.EventRsvpAsserts.*;
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
import vn.giapha.domain.EventRsvp;
import vn.giapha.repository.EventRsvpRepository;
import vn.giapha.service.EventRsvpService;
import vn.giapha.service.dto.EventRsvpDTO;
import vn.giapha.service.mapper.EventRsvpMapper;

/**
 * Integration tests for the {@link EventRsvpResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class EventRsvpResourceIT {

    private static final String DEFAULT_HOUSEHOLD_NAME = "AAAAAAAAAA";
    private static final String UPDATED_HOUSEHOLD_NAME = "BBBBBBBBBB";

    private static final Integer DEFAULT_HEADCOUNT = 1;
    private static final Integer UPDATED_HEADCOUNT = 2;

    private static final Integer DEFAULT_VEHICLES = 1;
    private static final Integer UPDATED_VEHICLES = 2;

    private static final String DEFAULT_ASSIGNMENT = "AAAAAAAAAA";
    private static final String UPDATED_ASSIGNMENT = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/event-rsvps";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private EventRsvpRepository eventRsvpRepository;

    @Mock
    private EventRsvpRepository eventRsvpRepositoryMock;

    @Autowired
    private EventRsvpMapper eventRsvpMapper;

    @Mock
    private EventRsvpService eventRsvpServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restEventRsvpMockMvc;

    private EventRsvp eventRsvp;

    private EventRsvp insertedEventRsvp;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EventRsvp createEntity() {
        return new EventRsvp()
            .householdName(DEFAULT_HOUSEHOLD_NAME)
            .headcount(DEFAULT_HEADCOUNT)
            .vehicles(DEFAULT_VEHICLES)
            .assignment(DEFAULT_ASSIGNMENT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static EventRsvp createUpdatedEntity() {
        return new EventRsvp()
            .householdName(UPDATED_HOUSEHOLD_NAME)
            .headcount(UPDATED_HEADCOUNT)
            .vehicles(UPDATED_VEHICLES)
            .assignment(UPDATED_ASSIGNMENT);
    }

    @BeforeEach
    void initTest() {
        eventRsvp = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedEventRsvp != null) {
            eventRsvpRepository.delete(insertedEventRsvp);
            insertedEventRsvp = null;
        }
    }

    @Test
    @Transactional
    void createEventRsvp() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the EventRsvp
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(eventRsvp);
        var returnedEventRsvpDTO = om.readValue(
            restEventRsvpMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(eventRsvpDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            EventRsvpDTO.class
        );

        // Validate the EventRsvp in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedEventRsvp = eventRsvpMapper.toEntity(returnedEventRsvpDTO);
        assertEventRsvpUpdatableFieldsEquals(returnedEventRsvp, getPersistedEventRsvp(returnedEventRsvp));

        insertedEventRsvp = returnedEventRsvp;
    }

    @Test
    @Transactional
    void createEventRsvpWithExistingId() throws Exception {
        // Create the EventRsvp with an existing ID
        eventRsvp.setId(1L);
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(eventRsvp);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restEventRsvpMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(eventRsvpDTO)))
            .andExpect(status().isBadRequest());

        // Validate the EventRsvp in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkHouseholdNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        eventRsvp.setHouseholdName(null);

        // Create the EventRsvp, which fails.
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(eventRsvp);

        restEventRsvpMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(eventRsvpDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllEventRsvps() throws Exception {
        // Initialize the database
        insertedEventRsvp = eventRsvpRepository.saveAndFlush(eventRsvp);

        // Get all the eventRsvpList
        restEventRsvpMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(eventRsvp.getId().intValue())))
            .andExpect(jsonPath("$.[*].householdName").value(hasItem(DEFAULT_HOUSEHOLD_NAME)))
            .andExpect(jsonPath("$.[*].headcount").value(hasItem(DEFAULT_HEADCOUNT)))
            .andExpect(jsonPath("$.[*].vehicles").value(hasItem(DEFAULT_VEHICLES)))
            .andExpect(jsonPath("$.[*].assignment").value(hasItem(DEFAULT_ASSIGNMENT)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllEventRsvpsWithEagerRelationshipsIsEnabled() throws Exception {
        when(eventRsvpServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restEventRsvpMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(eventRsvpServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllEventRsvpsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(eventRsvpServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restEventRsvpMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(eventRsvpRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getEventRsvp() throws Exception {
        // Initialize the database
        insertedEventRsvp = eventRsvpRepository.saveAndFlush(eventRsvp);

        // Get the eventRsvp
        restEventRsvpMockMvc
            .perform(get(ENTITY_API_URL_ID, eventRsvp.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(eventRsvp.getId().intValue()))
            .andExpect(jsonPath("$.householdName").value(DEFAULT_HOUSEHOLD_NAME))
            .andExpect(jsonPath("$.headcount").value(DEFAULT_HEADCOUNT))
            .andExpect(jsonPath("$.vehicles").value(DEFAULT_VEHICLES))
            .andExpect(jsonPath("$.assignment").value(DEFAULT_ASSIGNMENT));
    }

    @Test
    @Transactional
    void getNonExistingEventRsvp() throws Exception {
        // Get the eventRsvp
        restEventRsvpMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingEventRsvp() throws Exception {
        // Initialize the database
        insertedEventRsvp = eventRsvpRepository.saveAndFlush(eventRsvp);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the eventRsvp
        EventRsvp updatedEventRsvp = eventRsvpRepository.findById(eventRsvp.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedEventRsvp are not directly saved in db
        em.detach(updatedEventRsvp);
        updatedEventRsvp
            .householdName(UPDATED_HOUSEHOLD_NAME)
            .headcount(UPDATED_HEADCOUNT)
            .vehicles(UPDATED_VEHICLES)
            .assignment(UPDATED_ASSIGNMENT);
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(updatedEventRsvp);

        restEventRsvpMockMvc
            .perform(
                put(ENTITY_API_URL_ID, eventRsvpDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(eventRsvpDTO))
            )
            .andExpect(status().isOk());

        // Validate the EventRsvp in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedEventRsvpToMatchAllProperties(updatedEventRsvp);
    }

    @Test
    @Transactional
    void putNonExistingEventRsvp() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        eventRsvp.setId(longCount.incrementAndGet());

        // Create the EventRsvp
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(eventRsvp);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEventRsvpMockMvc
            .perform(
                put(ENTITY_API_URL_ID, eventRsvpDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(eventRsvpDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EventRsvp in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchEventRsvp() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        eventRsvp.setId(longCount.incrementAndGet());

        // Create the EventRsvp
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(eventRsvp);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEventRsvpMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(eventRsvpDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EventRsvp in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamEventRsvp() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        eventRsvp.setId(longCount.incrementAndGet());

        // Create the EventRsvp
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(eventRsvp);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEventRsvpMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(eventRsvpDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the EventRsvp in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateEventRsvpWithPatch() throws Exception {
        // Initialize the database
        insertedEventRsvp = eventRsvpRepository.saveAndFlush(eventRsvp);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the eventRsvp using partial update
        EventRsvp partialUpdatedEventRsvp = new EventRsvp();
        partialUpdatedEventRsvp.setId(eventRsvp.getId());

        partialUpdatedEventRsvp.headcount(UPDATED_HEADCOUNT).vehicles(UPDATED_VEHICLES).assignment(UPDATED_ASSIGNMENT);

        restEventRsvpMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEventRsvp.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEventRsvp))
            )
            .andExpect(status().isOk());

        // Validate the EventRsvp in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEventRsvpUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedEventRsvp, eventRsvp),
            getPersistedEventRsvp(eventRsvp)
        );
    }

    @Test
    @Transactional
    void fullUpdateEventRsvpWithPatch() throws Exception {
        // Initialize the database
        insertedEventRsvp = eventRsvpRepository.saveAndFlush(eventRsvp);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the eventRsvp using partial update
        EventRsvp partialUpdatedEventRsvp = new EventRsvp();
        partialUpdatedEventRsvp.setId(eventRsvp.getId());

        partialUpdatedEventRsvp
            .householdName(UPDATED_HOUSEHOLD_NAME)
            .headcount(UPDATED_HEADCOUNT)
            .vehicles(UPDATED_VEHICLES)
            .assignment(UPDATED_ASSIGNMENT);

        restEventRsvpMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedEventRsvp.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedEventRsvp))
            )
            .andExpect(status().isOk());

        // Validate the EventRsvp in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertEventRsvpUpdatableFieldsEquals(partialUpdatedEventRsvp, getPersistedEventRsvp(partialUpdatedEventRsvp));
    }

    @Test
    @Transactional
    void patchNonExistingEventRsvp() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        eventRsvp.setId(longCount.incrementAndGet());

        // Create the EventRsvp
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(eventRsvp);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restEventRsvpMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, eventRsvpDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(eventRsvpDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EventRsvp in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchEventRsvp() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        eventRsvp.setId(longCount.incrementAndGet());

        // Create the EventRsvp
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(eventRsvp);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEventRsvpMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(eventRsvpDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the EventRsvp in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamEventRsvp() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        eventRsvp.setId(longCount.incrementAndGet());

        // Create the EventRsvp
        EventRsvpDTO eventRsvpDTO = eventRsvpMapper.toDto(eventRsvp);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restEventRsvpMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(eventRsvpDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the EventRsvp in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteEventRsvp() throws Exception {
        // Initialize the database
        insertedEventRsvp = eventRsvpRepository.saveAndFlush(eventRsvp);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the eventRsvp
        restEventRsvpMockMvc
            .perform(delete(ENTITY_API_URL_ID, eventRsvp.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return eventRsvpRepository.count();
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

    protected EventRsvp getPersistedEventRsvp(EventRsvp eventRsvp) {
        return eventRsvpRepository.findById(eventRsvp.getId()).orElseThrow();
    }

    protected void assertPersistedEventRsvpToMatchAllProperties(EventRsvp expectedEventRsvp) {
        assertEventRsvpAllPropertiesEquals(expectedEventRsvp, getPersistedEventRsvp(expectedEventRsvp));
    }

    protected void assertPersistedEventRsvpToMatchUpdatableProperties(EventRsvp expectedEventRsvp) {
        assertEventRsvpAllUpdatablePropertiesEquals(expectedEventRsvp, getPersistedEventRsvp(expectedEventRsvp));
    }
}
