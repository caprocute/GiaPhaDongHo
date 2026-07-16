package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.DonationCampaignAsserts.*;
import static vn.giapha.web.rest.TestUtil.createUpdateProxyForBean;
import static vn.giapha.web.rest.TestUtil.sameNumber;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.math.BigDecimal;
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
import vn.giapha.domain.DonationCampaign;
import vn.giapha.repository.DonationCampaignRepository;
import vn.giapha.service.DonationCampaignService;
import vn.giapha.service.dto.DonationCampaignDTO;
import vn.giapha.service.mapper.DonationCampaignMapper;

/**
 * Integration tests for the {@link DonationCampaignResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DonationCampaignResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final BigDecimal DEFAULT_GOAL_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_GOAL_AMOUNT = new BigDecimal(2);

    private static final BigDecimal DEFAULT_RAISED_AMOUNT = new BigDecimal(1);
    private static final BigDecimal UPDATED_RAISED_AMOUNT = new BigDecimal(2);

    private static final String DEFAULT_VIETQR_PAYLOAD = "AAAAAAAAAA";
    private static final String UPDATED_VIETQR_PAYLOAD = "BBBBBBBBBB";

    private static final String DEFAULT_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_STATUS = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/donation-campaigns";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DonationCampaignRepository donationCampaignRepository;

    @Mock
    private DonationCampaignRepository donationCampaignRepositoryMock;

    @Autowired
    private DonationCampaignMapper donationCampaignMapper;

    @Mock
    private DonationCampaignService donationCampaignServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDonationCampaignMockMvc;

    private DonationCampaign donationCampaign;

    private DonationCampaign insertedDonationCampaign;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DonationCampaign createEntity() {
        return new DonationCampaign()
            .title(DEFAULT_TITLE)
            .goalAmount(DEFAULT_GOAL_AMOUNT)
            .raisedAmount(DEFAULT_RAISED_AMOUNT)
            .vietqrPayload(DEFAULT_VIETQR_PAYLOAD)
            .status(DEFAULT_STATUS);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DonationCampaign createUpdatedEntity() {
        return new DonationCampaign()
            .title(UPDATED_TITLE)
            .goalAmount(UPDATED_GOAL_AMOUNT)
            .raisedAmount(UPDATED_RAISED_AMOUNT)
            .vietqrPayload(UPDATED_VIETQR_PAYLOAD)
            .status(UPDATED_STATUS);
    }

    @BeforeEach
    void initTest() {
        donationCampaign = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDonationCampaign != null) {
            donationCampaignRepository.delete(insertedDonationCampaign);
            insertedDonationCampaign = null;
        }
    }

    @Test
    @Transactional
    void createDonationCampaign() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the DonationCampaign
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(donationCampaign);
        var returnedDonationCampaignDTO = om.readValue(
            restDonationCampaignMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(donationCampaignDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DonationCampaignDTO.class
        );

        // Validate the DonationCampaign in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDonationCampaign = donationCampaignMapper.toEntity(returnedDonationCampaignDTO);
        assertDonationCampaignUpdatableFieldsEquals(returnedDonationCampaign, getPersistedDonationCampaign(returnedDonationCampaign));

        insertedDonationCampaign = returnedDonationCampaign;
    }

    @Test
    @Transactional
    void createDonationCampaignWithExistingId() throws Exception {
        // Create the DonationCampaign with an existing ID
        donationCampaign.setId(1L);
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(donationCampaign);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDonationCampaignMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(donationCampaignDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationCampaign in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        donationCampaign.setTitle(null);

        // Create the DonationCampaign, which fails.
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(donationCampaign);

        restDonationCampaignMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(donationCampaignDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDonationCampaigns() throws Exception {
        // Initialize the database
        insertedDonationCampaign = donationCampaignRepository.saveAndFlush(donationCampaign);

        // Get all the donationCampaignList
        restDonationCampaignMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(donationCampaign.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].goalAmount").value(hasItem(sameNumber(DEFAULT_GOAL_AMOUNT))))
            .andExpect(jsonPath("$.[*].raisedAmount").value(hasItem(sameNumber(DEFAULT_RAISED_AMOUNT))))
            .andExpect(jsonPath("$.[*].vietqrPayload").value(hasItem(DEFAULT_VIETQR_PAYLOAD)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDonationCampaignsWithEagerRelationshipsIsEnabled() throws Exception {
        when(donationCampaignServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDonationCampaignMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(donationCampaignServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDonationCampaignsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(donationCampaignServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDonationCampaignMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(donationCampaignRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getDonationCampaign() throws Exception {
        // Initialize the database
        insertedDonationCampaign = donationCampaignRepository.saveAndFlush(donationCampaign);

        // Get the donationCampaign
        restDonationCampaignMockMvc
            .perform(get(ENTITY_API_URL_ID, donationCampaign.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(donationCampaign.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.goalAmount").value(sameNumber(DEFAULT_GOAL_AMOUNT)))
            .andExpect(jsonPath("$.raisedAmount").value(sameNumber(DEFAULT_RAISED_AMOUNT)))
            .andExpect(jsonPath("$.vietqrPayload").value(DEFAULT_VIETQR_PAYLOAD))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS));
    }

    @Test
    @Transactional
    void getNonExistingDonationCampaign() throws Exception {
        // Get the donationCampaign
        restDonationCampaignMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDonationCampaign() throws Exception {
        // Initialize the database
        insertedDonationCampaign = donationCampaignRepository.saveAndFlush(donationCampaign);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the donationCampaign
        DonationCampaign updatedDonationCampaign = donationCampaignRepository.findById(donationCampaign.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDonationCampaign are not directly saved in db
        em.detach(updatedDonationCampaign);
        updatedDonationCampaign
            .title(UPDATED_TITLE)
            .goalAmount(UPDATED_GOAL_AMOUNT)
            .raisedAmount(UPDATED_RAISED_AMOUNT)
            .vietqrPayload(UPDATED_VIETQR_PAYLOAD)
            .status(UPDATED_STATUS);
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(updatedDonationCampaign);

        restDonationCampaignMockMvc
            .perform(
                put(ENTITY_API_URL_ID, donationCampaignDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(donationCampaignDTO))
            )
            .andExpect(status().isOk());

        // Validate the DonationCampaign in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDonationCampaignToMatchAllProperties(updatedDonationCampaign);
    }

    @Test
    @Transactional
    void putNonExistingDonationCampaign() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationCampaign.setId(longCount.incrementAndGet());

        // Create the DonationCampaign
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(donationCampaign);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDonationCampaignMockMvc
            .perform(
                put(ENTITY_API_URL_ID, donationCampaignDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(donationCampaignDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationCampaign in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDonationCampaign() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationCampaign.setId(longCount.incrementAndGet());

        // Create the DonationCampaign
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(donationCampaign);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDonationCampaignMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(donationCampaignDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationCampaign in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDonationCampaign() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationCampaign.setId(longCount.incrementAndGet());

        // Create the DonationCampaign
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(donationCampaign);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDonationCampaignMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(donationCampaignDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DonationCampaign in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDonationCampaignWithPatch() throws Exception {
        // Initialize the database
        insertedDonationCampaign = donationCampaignRepository.saveAndFlush(donationCampaign);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the donationCampaign using partial update
        DonationCampaign partialUpdatedDonationCampaign = new DonationCampaign();
        partialUpdatedDonationCampaign.setId(donationCampaign.getId());

        partialUpdatedDonationCampaign.title(UPDATED_TITLE).raisedAmount(UPDATED_RAISED_AMOUNT).status(UPDATED_STATUS);

        restDonationCampaignMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDonationCampaign.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDonationCampaign))
            )
            .andExpect(status().isOk());

        // Validate the DonationCampaign in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDonationCampaignUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDonationCampaign, donationCampaign),
            getPersistedDonationCampaign(donationCampaign)
        );
    }

    @Test
    @Transactional
    void fullUpdateDonationCampaignWithPatch() throws Exception {
        // Initialize the database
        insertedDonationCampaign = donationCampaignRepository.saveAndFlush(donationCampaign);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the donationCampaign using partial update
        DonationCampaign partialUpdatedDonationCampaign = new DonationCampaign();
        partialUpdatedDonationCampaign.setId(donationCampaign.getId());

        partialUpdatedDonationCampaign
            .title(UPDATED_TITLE)
            .goalAmount(UPDATED_GOAL_AMOUNT)
            .raisedAmount(UPDATED_RAISED_AMOUNT)
            .vietqrPayload(UPDATED_VIETQR_PAYLOAD)
            .status(UPDATED_STATUS);

        restDonationCampaignMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDonationCampaign.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDonationCampaign))
            )
            .andExpect(status().isOk());

        // Validate the DonationCampaign in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDonationCampaignUpdatableFieldsEquals(
            partialUpdatedDonationCampaign,
            getPersistedDonationCampaign(partialUpdatedDonationCampaign)
        );
    }

    @Test
    @Transactional
    void patchNonExistingDonationCampaign() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationCampaign.setId(longCount.incrementAndGet());

        // Create the DonationCampaign
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(donationCampaign);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDonationCampaignMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, donationCampaignDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(donationCampaignDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationCampaign in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDonationCampaign() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationCampaign.setId(longCount.incrementAndGet());

        // Create the DonationCampaign
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(donationCampaign);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDonationCampaignMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(donationCampaignDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DonationCampaign in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDonationCampaign() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        donationCampaign.setId(longCount.incrementAndGet());

        // Create the DonationCampaign
        DonationCampaignDTO donationCampaignDTO = donationCampaignMapper.toDto(donationCampaign);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDonationCampaignMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(donationCampaignDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DonationCampaign in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDonationCampaign() throws Exception {
        // Initialize the database
        insertedDonationCampaign = donationCampaignRepository.saveAndFlush(donationCampaign);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the donationCampaign
        restDonationCampaignMockMvc
            .perform(delete(ENTITY_API_URL_ID, donationCampaign.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return donationCampaignRepository.count();
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

    protected DonationCampaign getPersistedDonationCampaign(DonationCampaign donationCampaign) {
        return donationCampaignRepository.findById(donationCampaign.getId()).orElseThrow();
    }

    protected void assertPersistedDonationCampaignToMatchAllProperties(DonationCampaign expectedDonationCampaign) {
        assertDonationCampaignAllPropertiesEquals(expectedDonationCampaign, getPersistedDonationCampaign(expectedDonationCampaign));
    }

    protected void assertPersistedDonationCampaignToMatchUpdatableProperties(DonationCampaign expectedDonationCampaign) {
        assertDonationCampaignAllUpdatablePropertiesEquals(
            expectedDonationCampaign,
            getPersistedDonationCampaign(expectedDonationCampaign)
        );
    }
}
