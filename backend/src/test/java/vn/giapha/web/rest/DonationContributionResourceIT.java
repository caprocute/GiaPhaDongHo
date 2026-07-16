package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.DonationContributionAsserts.*;
import static vn.giapha.web.rest.TestUtil.createUpdateProxyForBean;
import static vn.giapha.web.rest.TestUtil.sameNumber;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
import vn.giapha.domain.DonationContribution;
import vn.giapha.repository.DonationContributionRepository;
import vn.giapha.service.DonationContributionService;
import vn.giapha.service.dto.DonationContributionDTO;
import vn.giapha.service.mapper.DonationContributionMapper;

/**
 * Integration tests for the {@link DonationContributionResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DonationContributionResourceIT {

    private static final String DEFAULT_DONOR_NAME = "AAAAAAAAAA";
    private static final String UPDATED_DONOR_NAME = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_AMOUNT = new BigDecimal(2);

    private static final String DEFAULT_KIND = "AAAAAAAAAA";
    private static final String UPDATED_KIND = "BBBBBBBBBB";

    private static final String DEFAULT_NOTE = "AAAAAAAAAA";
    private static final String UPDATED_NOTE = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.ofEpochMilli(1703756156789L);

    private static final String ENTITY_API_URL = "/api/donation-contributions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DonationContributionRepository donationContributionRepository;

    @Mock
    private DonationContributionRepository donationContributionRepositoryMock;

    @Autowired
    private DonationContributionMapper donationContributionMapper;

    @Mock
    private DonationContributionService donationContributionServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDonationContributionMockMvc;

    private DonationContribution donationContribution;

    private DonationContribution insertedDonationContribution;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DonationContribution createEntity() {
        return new DonationContribution()
            .donorName(DEFAULT_DONOR_NAME)
            .amount(DEFAULT_AMOUNT)
            .kind(DEFAULT_KIND)
            .note(DEFAULT_NOTE)
            .createdAt(DEFAULT_CREATED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DonationContribution createUpdatedEntity() {
        return new DonationContribution()
            .donorName(UPDATED_DONOR_NAME)
            .amount(UPDATED_AMOUNT)
            .kind(UPDATED_KIND)
            .note(UPDATED_NOTE)
            .createdAt(UPDATED_CREATED_AT);
    }

    @BeforeEach
    void initTest() {
        donationContribution = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDonationContribution != null) {
            donationContributionRepository.delete(insertedDonationContribution);
            insertedDonationContribution = null;
        }
    }

    @Test
    @Transactional
    void createDonationContribution() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the DonationContribution
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(donationContribution);
        var returnedDonationContributionDTO = om.readValue(
            restDonationContributionMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(donationContributionDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DonationContributionDTO.class
        );

        // Validate the DonationContribution in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDonationContribution = donationContributionMapper.toEntity(returnedDonationContributionDTO);
        assertDonationContributionUpdatableFieldsEquals(
            returnedDonationContribution,
            getPersistedDonationContribution(returnedDonationContribution)
        );

        insertedDonationContribution = returnedDonationContribution;
    }

    @Test
    @Transactional
    void createDonationContributionWithExistingId() throws Exception {
        // Create the DonationContribution with an existing ID
        donationContribution.setId(1L);
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(donationContribution);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDonationContributionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(donationContributionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationContribution in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkDonorNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        donationContribution.setDonorName(null);

        // Create the DonationContribution, which fails.
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(donationContribution);

        restDonationContributionMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(donationContributionDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDonationContributions() throws Exception {
        // Initialize the database
        insertedDonationContribution = donationContributionRepository.saveAndFlush(donationContribution);

        // Get all the donationContributionList
        restDonationContributionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(donationContribution.getId().intValue())))
            .andExpect(jsonPath("$.[*].donorName").value(hasItem(DEFAULT_DONOR_NAME)))
            .andExpect(jsonPath("$.[*].amount").value(hasItem(sameNumber(DEFAULT_AMOUNT))))
            .andExpect(jsonPath("$.[*].kind").value(hasItem(DEFAULT_KIND)))
            .andExpect(jsonPath("$.[*].note").value(hasItem(DEFAULT_NOTE)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDonationContributionsWithEagerRelationshipsIsEnabled() throws Exception {
        when(donationContributionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDonationContributionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(donationContributionServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDonationContributionsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(donationContributionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDonationContributionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(donationContributionRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getDonationContribution() throws Exception {
        // Initialize the database
        insertedDonationContribution = donationContributionRepository.saveAndFlush(donationContribution);

        // Get the donationContribution
        restDonationContributionMockMvc
            .perform(get(ENTITY_API_URL_ID, donationContribution.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(donationContribution.getId().intValue()))
            .andExpect(jsonPath("$.donorName").value(DEFAULT_DONOR_NAME))
            .andExpect(jsonPath("$.amount").value(sameNumber(DEFAULT_AMOUNT)))
            .andExpect(jsonPath("$.kind").value(DEFAULT_KIND))
            .andExpect(jsonPath("$.note").value(DEFAULT_NOTE))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingDonationContribution() throws Exception {
        // Get the donationContribution
        restDonationContributionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDonationContribution() throws Exception {
        // Initialize the database
        insertedDonationContribution = donationContributionRepository.saveAndFlush(donationContribution);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the donationContribution
        DonationContribution updatedDonationContribution = donationContributionRepository
            .findById(donationContribution.getId())
            .orElseThrow();
        // Disconnect from session so that the updates on updatedDonationContribution are not directly saved in db
        em.detach(updatedDonationContribution);
        updatedDonationContribution
            .donorName(UPDATED_DONOR_NAME)
            .amount(UPDATED_AMOUNT)
            .kind(UPDATED_KIND)
            .note(UPDATED_NOTE)
            .createdAt(UPDATED_CREATED_AT);
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(updatedDonationContribution);

        restDonationContributionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, donationContributionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(donationContributionDTO))
            )
            .andExpect(status().isOk());

        // Validate the DonationContribution in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDonationContributionToMatchAllProperties(updatedDonationContribution);
    }

    @Test
    @Transactional
    void putNonExistingDonationContribution() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationContribution.setId(longCount.incrementAndGet());

        // Create the DonationContribution
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(donationContribution);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDonationContributionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, donationContributionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(donationContributionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationContribution in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDonationContribution() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationContribution.setId(longCount.incrementAndGet());

        // Create the DonationContribution
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(donationContribution);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDonationContributionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(donationContributionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationContribution in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDonationContribution() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationContribution.setId(longCount.incrementAndGet());

        // Create the DonationContribution
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(donationContribution);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDonationContributionMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(donationContributionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DonationContribution in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDonationContributionWithPatch() throws Exception {
        // Initialize the database
        insertedDonationContribution = donationContributionRepository.saveAndFlush(donationContribution);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the donationContribution using partial update
        DonationContribution partialUpdatedDonationContribution = new DonationContribution();
        partialUpdatedDonationContribution.setId(donationContribution.getId());

        partialUpdatedDonationContribution.donorName(UPDATED_DONOR_NAME).kind(UPDATED_KIND).createdAt(UPDATED_CREATED_AT);

        restDonationContributionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDonationContribution.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDonationContribution))
            )
            .andExpect(status().isOk());

        // Validate the DonationContribution in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDonationContributionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDonationContribution, donationContribution),
            getPersistedDonationContribution(donationContribution)
        );
    }

    @Test
    @Transactional
    void fullUpdateDonationContributionWithPatch() throws Exception {
        // Initialize the database
        insertedDonationContribution = donationContributionRepository.saveAndFlush(donationContribution);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the donationContribution using partial update
        DonationContribution partialUpdatedDonationContribution = new DonationContribution();
        partialUpdatedDonationContribution.setId(donationContribution.getId());

        partialUpdatedDonationContribution
            .donorName(UPDATED_DONOR_NAME)
            .amount(UPDATED_AMOUNT)
            .kind(UPDATED_KIND)
            .note(UPDATED_NOTE)
            .createdAt(UPDATED_CREATED_AT);

        restDonationContributionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDonationContribution.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDonationContribution))
            )
            .andExpect(status().isOk());

        // Validate the DonationContribution in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDonationContributionUpdatableFieldsEquals(
            partialUpdatedDonationContribution,
            getPersistedDonationContribution(partialUpdatedDonationContribution)
        );
    }

    @Test
    @Transactional
    void patchNonExistingDonationContribution() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationContribution.setId(longCount.incrementAndGet());

        // Create the DonationContribution
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(donationContribution);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDonationContributionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, donationContributionDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(donationContributionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationContribution in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDonationContribution() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationContribution.setId(longCount.incrementAndGet());

        // Create the DonationContribution
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(donationContribution);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDonationContributionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(donationContributionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationContribution in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDonationContribution() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationContribution.setId(longCount.incrementAndGet());

        // Create the DonationContribution
        DonationContributionDTO donationContributionDTO = donationContributionMapper.toDto(donationContribution);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDonationContributionMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(donationContributionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DonationContribution in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDonationContribution() throws Exception {
        // Initialize the database
        insertedDonationContribution = donationContributionRepository.saveAndFlush(donationContribution);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the donationContribution
        restDonationContributionMockMvc
            .perform(delete(ENTITY_API_URL_ID, donationContribution.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return donationContributionRepository.count();
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

    protected DonationContribution getPersistedDonationContribution(DonationContribution donationContribution) {
        return donationContributionRepository.findById(donationContribution.getId()).orElseThrow();
    }

    protected void assertPersistedDonationContributionToMatchAllProperties(DonationContribution expectedDonationContribution) {
        assertDonationContributionAllPropertiesEquals(
            expectedDonationContribution,
            getPersistedDonationContribution(expectedDonationContribution)
        );
    }

    protected void assertPersistedDonationContributionToMatchUpdatableProperties(DonationContribution expectedDonationContribution) {
        assertDonationContributionAllUpdatablePropertiesEquals(
            expectedDonationContribution,
            getPersistedDonationContribution(expectedDonationContribution)
        );
    }
}
