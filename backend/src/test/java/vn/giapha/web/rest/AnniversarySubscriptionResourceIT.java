package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.AnniversarySubscriptionAsserts.*;
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
import vn.giapha.domain.AnniversarySubscription;
import vn.giapha.repository.AnniversarySubscriptionRepository;
import vn.giapha.service.AnniversarySubscriptionService;
import vn.giapha.service.dto.AnniversarySubscriptionDTO;
import vn.giapha.service.mapper.AnniversarySubscriptionMapper;

/**
 * Integration tests for the {@link AnniversarySubscriptionResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class AnniversarySubscriptionResourceIT {

    private static final String DEFAULT_USER_ID = "AAAAAAAAAA";
    private static final String UPDATED_USER_ID = "BBBBBBBBBB";

    private static final Integer DEFAULT_DAYS_BEFORE = 1;
    private static final Integer UPDATED_DAYS_BEFORE = 2;

    private static final String DEFAULT_CHANNELS = "AAAAAAAAAA";
    private static final String UPDATED_CHANNELS = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/anniversary-subscriptions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private AnniversarySubscriptionRepository anniversarySubscriptionRepository;

    @Mock
    private AnniversarySubscriptionRepository anniversarySubscriptionRepositoryMock;

    @Autowired
    private AnniversarySubscriptionMapper anniversarySubscriptionMapper;

    @Mock
    private AnniversarySubscriptionService anniversarySubscriptionServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restAnniversarySubscriptionMockMvc;

    private AnniversarySubscription anniversarySubscription;

    private AnniversarySubscription insertedAnniversarySubscription;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AnniversarySubscription createEntity() {
        return new AnniversarySubscription().userId(DEFAULT_USER_ID).daysBefore(DEFAULT_DAYS_BEFORE).channels(DEFAULT_CHANNELS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static AnniversarySubscription createUpdatedEntity() {
        return new AnniversarySubscription().userId(UPDATED_USER_ID).daysBefore(UPDATED_DAYS_BEFORE).channels(UPDATED_CHANNELS);
    }

    @BeforeEach
    void initTest() {
        anniversarySubscription = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedAnniversarySubscription != null) {
            anniversarySubscriptionRepository.delete(insertedAnniversarySubscription);
            insertedAnniversarySubscription = null;
        }
    }

    @Test
    @Transactional
    void createAnniversarySubscription() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the AnniversarySubscription
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(anniversarySubscription);
        var returnedAnniversarySubscriptionDTO = om.readValue(
            restAnniversarySubscriptionMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            AnniversarySubscriptionDTO.class
        );

        // Validate the AnniversarySubscription in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedAnniversarySubscription = anniversarySubscriptionMapper.toEntity(returnedAnniversarySubscriptionDTO);
        assertAnniversarySubscriptionUpdatableFieldsEquals(
            returnedAnniversarySubscription,
            getPersistedAnniversarySubscription(returnedAnniversarySubscription)
        );

        insertedAnniversarySubscription = returnedAnniversarySubscription;
    }

    @Test
    @Transactional
    void createAnniversarySubscriptionWithExistingId() throws Exception {
        // Create the AnniversarySubscription with an existing ID
        anniversarySubscription.setId(1L);
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(anniversarySubscription);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restAnniversarySubscriptionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AnniversarySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkUserIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        anniversarySubscription.setUserId(null);

        // Create the AnniversarySubscription, which fails.
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(anniversarySubscription);

        restAnniversarySubscriptionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllAnniversarySubscriptions() throws Exception {
        // Initialize the database
        insertedAnniversarySubscription = anniversarySubscriptionRepository.saveAndFlush(anniversarySubscription);

        // Get all the anniversarySubscriptionList
        restAnniversarySubscriptionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(anniversarySubscription.getId().intValue())))
            .andExpect(jsonPath("$.[*].userId").value(hasItem(DEFAULT_USER_ID)))
            .andExpect(jsonPath("$.[*].daysBefore").value(hasItem(DEFAULT_DAYS_BEFORE)))
            .andExpect(jsonPath("$.[*].channels").value(hasItem(DEFAULT_CHANNELS)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllAnniversarySubscriptionsWithEagerRelationshipsIsEnabled() throws Exception {
        when(anniversarySubscriptionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restAnniversarySubscriptionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(anniversarySubscriptionServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllAnniversarySubscriptionsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(anniversarySubscriptionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restAnniversarySubscriptionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(anniversarySubscriptionRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getAnniversarySubscription() throws Exception {
        // Initialize the database
        insertedAnniversarySubscription = anniversarySubscriptionRepository.saveAndFlush(anniversarySubscription);

        // Get the anniversarySubscription
        restAnniversarySubscriptionMockMvc
            .perform(get(ENTITY_API_URL_ID, anniversarySubscription.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(anniversarySubscription.getId().intValue()))
            .andExpect(jsonPath("$.userId").value(DEFAULT_USER_ID))
            .andExpect(jsonPath("$.daysBefore").value(DEFAULT_DAYS_BEFORE))
            .andExpect(jsonPath("$.channels").value(DEFAULT_CHANNELS));
    }

    @Test
    @Transactional
    void getNonExistingAnniversarySubscription() throws Exception {
        // Get the anniversarySubscription
        restAnniversarySubscriptionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingAnniversarySubscription() throws Exception {
        // Initialize the database
        insertedAnniversarySubscription = anniversarySubscriptionRepository.saveAndFlush(anniversarySubscription);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the anniversarySubscription
        AnniversarySubscription updatedAnniversarySubscription = anniversarySubscriptionRepository
            .findById(anniversarySubscription.getId())
            .orElseThrow();
        // Disconnect from session so that the updates on updatedAnniversarySubscription are not directly saved in db
        em.detach(updatedAnniversarySubscription);
        updatedAnniversarySubscription.userId(UPDATED_USER_ID).daysBefore(UPDATED_DAYS_BEFORE).channels(UPDATED_CHANNELS);
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(updatedAnniversarySubscription);

        restAnniversarySubscriptionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, anniversarySubscriptionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
            )
            .andExpect(status().isOk());

        // Validate the AnniversarySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedAnniversarySubscriptionToMatchAllProperties(updatedAnniversarySubscription);
    }

    @Test
    @Transactional
    void putNonExistingAnniversarySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        anniversarySubscription.setId(longCount.incrementAndGet());

        // Create the AnniversarySubscription
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(anniversarySubscription);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAnniversarySubscriptionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, anniversarySubscriptionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AnniversarySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchAnniversarySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        anniversarySubscription.setId(longCount.incrementAndGet());

        // Create the AnniversarySubscription
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(anniversarySubscription);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAnniversarySubscriptionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AnniversarySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamAnniversarySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        anniversarySubscription.setId(longCount.incrementAndGet());

        // Create the AnniversarySubscription
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(anniversarySubscription);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAnniversarySubscriptionMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AnniversarySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateAnniversarySubscriptionWithPatch() throws Exception {
        // Initialize the database
        insertedAnniversarySubscription = anniversarySubscriptionRepository.saveAndFlush(anniversarySubscription);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the anniversarySubscription using partial update
        AnniversarySubscription partialUpdatedAnniversarySubscription = new AnniversarySubscription();
        partialUpdatedAnniversarySubscription.setId(anniversarySubscription.getId());

        partialUpdatedAnniversarySubscription.channels(UPDATED_CHANNELS);

        restAnniversarySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAnniversarySubscription.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAnniversarySubscription))
            )
            .andExpect(status().isOk());

        // Validate the AnniversarySubscription in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAnniversarySubscriptionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedAnniversarySubscription, anniversarySubscription),
            getPersistedAnniversarySubscription(anniversarySubscription)
        );
    }

    @Test
    @Transactional
    void fullUpdateAnniversarySubscriptionWithPatch() throws Exception {
        // Initialize the database
        insertedAnniversarySubscription = anniversarySubscriptionRepository.saveAndFlush(anniversarySubscription);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the anniversarySubscription using partial update
        AnniversarySubscription partialUpdatedAnniversarySubscription = new AnniversarySubscription();
        partialUpdatedAnniversarySubscription.setId(anniversarySubscription.getId());

        partialUpdatedAnniversarySubscription.userId(UPDATED_USER_ID).daysBefore(UPDATED_DAYS_BEFORE).channels(UPDATED_CHANNELS);

        restAnniversarySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedAnniversarySubscription.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedAnniversarySubscription))
            )
            .andExpect(status().isOk());

        // Validate the AnniversarySubscription in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertAnniversarySubscriptionUpdatableFieldsEquals(
            partialUpdatedAnniversarySubscription,
            getPersistedAnniversarySubscription(partialUpdatedAnniversarySubscription)
        );
    }

    @Test
    @Transactional
    void patchNonExistingAnniversarySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        anniversarySubscription.setId(longCount.incrementAndGet());

        // Create the AnniversarySubscription
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(anniversarySubscription);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restAnniversarySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, anniversarySubscriptionDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AnniversarySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchAnniversarySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        anniversarySubscription.setId(longCount.incrementAndGet());

        // Create the AnniversarySubscription
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(anniversarySubscription);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAnniversarySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the AnniversarySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamAnniversarySubscription() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        anniversarySubscription.setId(longCount.incrementAndGet());

        // Create the AnniversarySubscription
        AnniversarySubscriptionDTO anniversarySubscriptionDTO = anniversarySubscriptionMapper.toDto(anniversarySubscription);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restAnniversarySubscriptionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(anniversarySubscriptionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the AnniversarySubscription in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteAnniversarySubscription() throws Exception {
        // Initialize the database
        insertedAnniversarySubscription = anniversarySubscriptionRepository.saveAndFlush(anniversarySubscription);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the anniversarySubscription
        restAnniversarySubscriptionMockMvc
            .perform(delete(ENTITY_API_URL_ID, anniversarySubscription.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return anniversarySubscriptionRepository.count();
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

    protected AnniversarySubscription getPersistedAnniversarySubscription(AnniversarySubscription anniversarySubscription) {
        return anniversarySubscriptionRepository.findById(anniversarySubscription.getId()).orElseThrow();
    }

    protected void assertPersistedAnniversarySubscriptionToMatchAllProperties(AnniversarySubscription expectedAnniversarySubscription) {
        assertAnniversarySubscriptionAllPropertiesEquals(
            expectedAnniversarySubscription,
            getPersistedAnniversarySubscription(expectedAnniversarySubscription)
        );
    }

    protected void assertPersistedAnniversarySubscriptionToMatchUpdatableProperties(
        AnniversarySubscription expectedAnniversarySubscription
    ) {
        assertAnniversarySubscriptionAllUpdatablePropertiesEquals(
            expectedAnniversarySubscription,
            getPersistedAnniversarySubscription(expectedAnniversarySubscription)
        );
    }
}
