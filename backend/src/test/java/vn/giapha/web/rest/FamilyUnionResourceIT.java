package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.FamilyUnionAsserts.*;
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
import vn.giapha.domain.FamilyUnion;
import vn.giapha.repository.FamilyUnionRepository;
import vn.giapha.service.FamilyUnionService;
import vn.giapha.service.dto.FamilyUnionDTO;
import vn.giapha.service.mapper.FamilyUnionMapper;

/**
 * Integration tests for the {@link FamilyUnionResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class FamilyUnionResourceIT {

    private static final Integer DEFAULT_ORDER_NO = 1;
    private static final Integer UPDATED_ORDER_NO = 2;

    private static final String DEFAULT_MARRIAGE_INFO_JSON = "AAAAAAAAAA";
    private static final String UPDATED_MARRIAGE_INFO_JSON = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/family-unions";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private FamilyUnionRepository familyUnionRepository;

    @Mock
    private FamilyUnionRepository familyUnionRepositoryMock;

    @Autowired
    private FamilyUnionMapper familyUnionMapper;

    @Mock
    private FamilyUnionService familyUnionServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFamilyUnionMockMvc;

    private FamilyUnion familyUnion;

    private FamilyUnion insertedFamilyUnion;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FamilyUnion createEntity() {
        return new FamilyUnion().orderNo(DEFAULT_ORDER_NO).marriageInfoJson(DEFAULT_MARRIAGE_INFO_JSON);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FamilyUnion createUpdatedEntity() {
        return new FamilyUnion().orderNo(UPDATED_ORDER_NO).marriageInfoJson(UPDATED_MARRIAGE_INFO_JSON);
    }

    @BeforeEach
    void initTest() {
        familyUnion = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedFamilyUnion != null) {
            familyUnionRepository.delete(insertedFamilyUnion);
            insertedFamilyUnion = null;
        }
    }

    @Test
    @Transactional
    void createFamilyUnion() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the FamilyUnion
        FamilyUnionDTO familyUnionDTO = familyUnionMapper.toDto(familyUnion);
        var returnedFamilyUnionDTO = om.readValue(
            restFamilyUnionMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(familyUnionDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            FamilyUnionDTO.class
        );

        // Validate the FamilyUnion in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedFamilyUnion = familyUnionMapper.toEntity(returnedFamilyUnionDTO);
        assertFamilyUnionUpdatableFieldsEquals(returnedFamilyUnion, getPersistedFamilyUnion(returnedFamilyUnion));

        insertedFamilyUnion = returnedFamilyUnion;
    }

    @Test
    @Transactional
    void createFamilyUnionWithExistingId() throws Exception {
        // Create the FamilyUnion with an existing ID
        familyUnion.setId(1L);
        FamilyUnionDTO familyUnionDTO = familyUnionMapper.toDto(familyUnion);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFamilyUnionMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(familyUnionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FamilyUnion in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllFamilyUnions() throws Exception {
        // Initialize the database
        insertedFamilyUnion = familyUnionRepository.saveAndFlush(familyUnion);

        // Get all the familyUnionList
        restFamilyUnionMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(familyUnion.getId().intValue())))
            .andExpect(jsonPath("$.[*].orderNo").value(hasItem(DEFAULT_ORDER_NO)))
            .andExpect(jsonPath("$.[*].marriageInfoJson").value(hasItem(DEFAULT_MARRIAGE_INFO_JSON)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllFamilyUnionsWithEagerRelationshipsIsEnabled() throws Exception {
        when(familyUnionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restFamilyUnionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(familyUnionServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllFamilyUnionsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(familyUnionServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restFamilyUnionMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(familyUnionRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getFamilyUnion() throws Exception {
        // Initialize the database
        insertedFamilyUnion = familyUnionRepository.saveAndFlush(familyUnion);

        // Get the familyUnion
        restFamilyUnionMockMvc
            .perform(get(ENTITY_API_URL_ID, familyUnion.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(familyUnion.getId().intValue()))
            .andExpect(jsonPath("$.orderNo").value(DEFAULT_ORDER_NO))
            .andExpect(jsonPath("$.marriageInfoJson").value(DEFAULT_MARRIAGE_INFO_JSON));
    }

    @Test
    @Transactional
    void getNonExistingFamilyUnion() throws Exception {
        // Get the familyUnion
        restFamilyUnionMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingFamilyUnion() throws Exception {
        // Initialize the database
        insertedFamilyUnion = familyUnionRepository.saveAndFlush(familyUnion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the familyUnion
        FamilyUnion updatedFamilyUnion = familyUnionRepository.findById(familyUnion.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedFamilyUnion are not directly saved in db
        em.detach(updatedFamilyUnion);
        updatedFamilyUnion.orderNo(UPDATED_ORDER_NO).marriageInfoJson(UPDATED_MARRIAGE_INFO_JSON);
        FamilyUnionDTO familyUnionDTO = familyUnionMapper.toDto(updatedFamilyUnion);

        restFamilyUnionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, familyUnionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(familyUnionDTO))
            )
            .andExpect(status().isOk());

        // Validate the FamilyUnion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedFamilyUnionToMatchAllProperties(updatedFamilyUnion);
    }

    @Test
    @Transactional
    void putNonExistingFamilyUnion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyUnion.setId(longCount.incrementAndGet());

        // Create the FamilyUnion
        FamilyUnionDTO familyUnionDTO = familyUnionMapper.toDto(familyUnion);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFamilyUnionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, familyUnionDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(familyUnionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FamilyUnion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFamilyUnion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyUnion.setId(longCount.incrementAndGet());

        // Create the FamilyUnion
        FamilyUnionDTO familyUnionDTO = familyUnionMapper.toDto(familyUnion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFamilyUnionMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(familyUnionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FamilyUnion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFamilyUnion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyUnion.setId(longCount.incrementAndGet());

        // Create the FamilyUnion
        FamilyUnionDTO familyUnionDTO = familyUnionMapper.toDto(familyUnion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFamilyUnionMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(familyUnionDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the FamilyUnion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFamilyUnionWithPatch() throws Exception {
        // Initialize the database
        insertedFamilyUnion = familyUnionRepository.saveAndFlush(familyUnion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the familyUnion using partial update
        FamilyUnion partialUpdatedFamilyUnion = new FamilyUnion();
        partialUpdatedFamilyUnion.setId(familyUnion.getId());

        restFamilyUnionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFamilyUnion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFamilyUnion))
            )
            .andExpect(status().isOk());

        // Validate the FamilyUnion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFamilyUnionUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedFamilyUnion, familyUnion),
            getPersistedFamilyUnion(familyUnion)
        );
    }

    @Test
    @Transactional
    void fullUpdateFamilyUnionWithPatch() throws Exception {
        // Initialize the database
        insertedFamilyUnion = familyUnionRepository.saveAndFlush(familyUnion);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the familyUnion using partial update
        FamilyUnion partialUpdatedFamilyUnion = new FamilyUnion();
        partialUpdatedFamilyUnion.setId(familyUnion.getId());

        partialUpdatedFamilyUnion.orderNo(UPDATED_ORDER_NO).marriageInfoJson(UPDATED_MARRIAGE_INFO_JSON);

        restFamilyUnionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFamilyUnion.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFamilyUnion))
            )
            .andExpect(status().isOk());

        // Validate the FamilyUnion in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFamilyUnionUpdatableFieldsEquals(partialUpdatedFamilyUnion, getPersistedFamilyUnion(partialUpdatedFamilyUnion));
    }

    @Test
    @Transactional
    void patchNonExistingFamilyUnion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyUnion.setId(longCount.incrementAndGet());

        // Create the FamilyUnion
        FamilyUnionDTO familyUnionDTO = familyUnionMapper.toDto(familyUnion);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFamilyUnionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, familyUnionDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(familyUnionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FamilyUnion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFamilyUnion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyUnion.setId(longCount.incrementAndGet());

        // Create the FamilyUnion
        FamilyUnionDTO familyUnionDTO = familyUnionMapper.toDto(familyUnion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFamilyUnionMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(familyUnionDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FamilyUnion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFamilyUnion() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyUnion.setId(longCount.incrementAndGet());

        // Create the FamilyUnion
        FamilyUnionDTO familyUnionDTO = familyUnionMapper.toDto(familyUnion);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFamilyUnionMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(familyUnionDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FamilyUnion in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFamilyUnion() throws Exception {
        // Initialize the database
        insertedFamilyUnion = familyUnionRepository.saveAndFlush(familyUnion);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the familyUnion
        restFamilyUnionMockMvc
            .perform(delete(ENTITY_API_URL_ID, familyUnion.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return familyUnionRepository.count();
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

    protected FamilyUnion getPersistedFamilyUnion(FamilyUnion familyUnion) {
        return familyUnionRepository.findById(familyUnion.getId()).orElseThrow();
    }

    protected void assertPersistedFamilyUnionToMatchAllProperties(FamilyUnion expectedFamilyUnion) {
        assertFamilyUnionAllPropertiesEquals(expectedFamilyUnion, getPersistedFamilyUnion(expectedFamilyUnion));
    }

    protected void assertPersistedFamilyUnionToMatchUpdatableProperties(FamilyUnion expectedFamilyUnion) {
        assertFamilyUnionAllUpdatablePropertiesEquals(expectedFamilyUnion, getPersistedFamilyUnion(expectedFamilyUnion));
    }
}
