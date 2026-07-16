package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.ClanEventAsserts.*;
import static vn.giapha.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
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
import vn.giapha.domain.ClanEvent;
import vn.giapha.repository.ClanEventRepository;
import vn.giapha.service.ClanEventService;
import vn.giapha.service.dto.ClanEventDTO;
import vn.giapha.service.mapper.ClanEventMapper;

/**
 * Integration tests for the {@link ClanEventResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ClanEventResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final Instant DEFAULT_START_SOLAR = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_START_SOLAR = Instant.ofEpochMilli(1703756156789L);

    private static final String DEFAULT_LUNAR_JSON = "AAAAAAAAAA";
    private static final String UPDATED_LUNAR_JSON = "BBBBBBBBBB";

    private static final String DEFAULT_LOCATION = "AAAAAAAAAA";
    private static final String UPDATED_LOCATION = "BBBBBBBBBB";

    private static final String DEFAULT_CHECKLIST_JSON = "AAAAAAAAAA";
    private static final String UPDATED_CHECKLIST_JSON = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/clan-events";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ClanEventRepository clanEventRepository;

    @Mock
    private ClanEventRepository clanEventRepositoryMock;

    @Autowired
    private ClanEventMapper clanEventMapper;

    @Mock
    private ClanEventService clanEventServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restClanEventMockMvc;

    private ClanEvent clanEvent;

    private ClanEvent insertedClanEvent;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClanEvent createEntity() {
        return new ClanEvent()
            .title(DEFAULT_TITLE)
            .startSolar(DEFAULT_START_SOLAR)
            .lunarJson(DEFAULT_LUNAR_JSON)
            .location(DEFAULT_LOCATION)
            .checklistJson(DEFAULT_CHECKLIST_JSON);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ClanEvent createUpdatedEntity() {
        return new ClanEvent()
            .title(UPDATED_TITLE)
            .startSolar(UPDATED_START_SOLAR)
            .lunarJson(UPDATED_LUNAR_JSON)
            .location(UPDATED_LOCATION)
            .checklistJson(UPDATED_CHECKLIST_JSON);
    }

    @BeforeEach
    void initTest() {
        clanEvent = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedClanEvent != null) {
            clanEventRepository.delete(insertedClanEvent);
            insertedClanEvent = null;
        }
    }

    @Test
    @Transactional
    void createClanEvent() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ClanEvent
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(clanEvent);
        var returnedClanEventDTO = om.readValue(
            restClanEventMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(clanEventDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ClanEventDTO.class
        );

        // Validate the ClanEvent in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedClanEvent = clanEventMapper.toEntity(returnedClanEventDTO);
        assertClanEventUpdatableFieldsEquals(returnedClanEvent, getPersistedClanEvent(returnedClanEvent));

        insertedClanEvent = returnedClanEvent;
    }

    @Test
    @Transactional
    void createClanEventWithExistingId() throws Exception {
        // Create the ClanEvent with an existing ID
        clanEvent.setId(1L);
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(clanEvent);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restClanEventMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(clanEventDTO)))
            .andExpect(status().isBadRequest());

        // Validate the ClanEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        clanEvent.setTitle(null);

        // Create the ClanEvent, which fails.
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(clanEvent);

        restClanEventMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(clanEventDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllClanEvents() throws Exception {
        // Initialize the database
        insertedClanEvent = clanEventRepository.saveAndFlush(clanEvent);

        // Get all the clanEventList
        restClanEventMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(clanEvent.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].startSolar").value(hasItem(DEFAULT_START_SOLAR.toString())))
            .andExpect(jsonPath("$.[*].lunarJson").value(hasItem(DEFAULT_LUNAR_JSON)))
            .andExpect(jsonPath("$.[*].location").value(hasItem(DEFAULT_LOCATION)))
            .andExpect(jsonPath("$.[*].checklistJson").value(hasItem(DEFAULT_CHECKLIST_JSON)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClanEventsWithEagerRelationshipsIsEnabled() throws Exception {
        when(clanEventServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClanEventMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(clanEventServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllClanEventsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(clanEventServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restClanEventMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(clanEventRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getClanEvent() throws Exception {
        // Initialize the database
        insertedClanEvent = clanEventRepository.saveAndFlush(clanEvent);

        // Get the clanEvent
        restClanEventMockMvc
            .perform(get(ENTITY_API_URL_ID, clanEvent.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(clanEvent.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.startSolar").value(DEFAULT_START_SOLAR.toString()))
            .andExpect(jsonPath("$.lunarJson").value(DEFAULT_LUNAR_JSON))
            .andExpect(jsonPath("$.location").value(DEFAULT_LOCATION))
            .andExpect(jsonPath("$.checklistJson").value(DEFAULT_CHECKLIST_JSON));
    }

    @Test
    @Transactional
    void getNonExistingClanEvent() throws Exception {
        // Get the clanEvent
        restClanEventMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingClanEvent() throws Exception {
        // Initialize the database
        insertedClanEvent = clanEventRepository.saveAndFlush(clanEvent);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the clanEvent
        ClanEvent updatedClanEvent = clanEventRepository.findById(clanEvent.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedClanEvent are not directly saved in db
        em.detach(updatedClanEvent);
        updatedClanEvent
            .title(UPDATED_TITLE)
            .startSolar(UPDATED_START_SOLAR)
            .lunarJson(UPDATED_LUNAR_JSON)
            .location(UPDATED_LOCATION)
            .checklistJson(UPDATED_CHECKLIST_JSON);
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(updatedClanEvent);

        restClanEventMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clanEventDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(clanEventDTO))
            )
            .andExpect(status().isOk());

        // Validate the ClanEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedClanEventToMatchAllProperties(updatedClanEvent);
    }

    @Test
    @Transactional
    void putNonExistingClanEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        clanEvent.setId(longCount.incrementAndGet());

        // Create the ClanEvent
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(clanEvent);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClanEventMockMvc
            .perform(
                put(ENTITY_API_URL_ID, clanEventDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(clanEventDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClanEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchClanEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        clanEvent.setId(longCount.incrementAndGet());

        // Create the ClanEvent
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(clanEvent);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClanEventMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(clanEventDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClanEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamClanEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        clanEvent.setId(longCount.incrementAndGet());

        // Create the ClanEvent
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(clanEvent);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClanEventMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(clanEventDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClanEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateClanEventWithPatch() throws Exception {
        // Initialize the database
        insertedClanEvent = clanEventRepository.saveAndFlush(clanEvent);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the clanEvent using partial update
        ClanEvent partialUpdatedClanEvent = new ClanEvent();
        partialUpdatedClanEvent.setId(clanEvent.getId());

        partialUpdatedClanEvent.startSolar(UPDATED_START_SOLAR).lunarJson(UPDATED_LUNAR_JSON);

        restClanEventMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClanEvent.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedClanEvent))
            )
            .andExpect(status().isOk());

        // Validate the ClanEvent in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertClanEventUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedClanEvent, clanEvent),
            getPersistedClanEvent(clanEvent)
        );
    }

    @Test
    @Transactional
    void fullUpdateClanEventWithPatch() throws Exception {
        // Initialize the database
        insertedClanEvent = clanEventRepository.saveAndFlush(clanEvent);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the clanEvent using partial update
        ClanEvent partialUpdatedClanEvent = new ClanEvent();
        partialUpdatedClanEvent.setId(clanEvent.getId());

        partialUpdatedClanEvent
            .title(UPDATED_TITLE)
            .startSolar(UPDATED_START_SOLAR)
            .lunarJson(UPDATED_LUNAR_JSON)
            .location(UPDATED_LOCATION)
            .checklistJson(UPDATED_CHECKLIST_JSON);

        restClanEventMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedClanEvent.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedClanEvent))
            )
            .andExpect(status().isOk());

        // Validate the ClanEvent in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertClanEventUpdatableFieldsEquals(partialUpdatedClanEvent, getPersistedClanEvent(partialUpdatedClanEvent));
    }

    @Test
    @Transactional
    void patchNonExistingClanEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        clanEvent.setId(longCount.incrementAndGet());

        // Create the ClanEvent
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(clanEvent);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restClanEventMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, clanEventDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(clanEventDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClanEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchClanEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        clanEvent.setId(longCount.incrementAndGet());

        // Create the ClanEvent
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(clanEvent);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClanEventMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(clanEventDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ClanEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamClanEvent() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        clanEvent.setId(longCount.incrementAndGet());

        // Create the ClanEvent
        ClanEventDTO clanEventDTO = clanEventMapper.toDto(clanEvent);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restClanEventMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(clanEventDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ClanEvent in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteClanEvent() throws Exception {
        // Initialize the database
        insertedClanEvent = clanEventRepository.saveAndFlush(clanEvent);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the clanEvent
        restClanEventMockMvc
            .perform(delete(ENTITY_API_URL_ID, clanEvent.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return clanEventRepository.count();
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

    protected ClanEvent getPersistedClanEvent(ClanEvent clanEvent) {
        return clanEventRepository.findById(clanEvent.getId()).orElseThrow();
    }

    protected void assertPersistedClanEventToMatchAllProperties(ClanEvent expectedClanEvent) {
        assertClanEventAllPropertiesEquals(expectedClanEvent, getPersistedClanEvent(expectedClanEvent));
    }

    protected void assertPersistedClanEventToMatchUpdatableProperties(ClanEvent expectedClanEvent) {
        assertClanEventAllUpdatablePropertiesEquals(expectedClanEvent, getPersistedClanEvent(expectedClanEvent));
    }
}
