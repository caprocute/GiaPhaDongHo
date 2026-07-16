package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.FamilyTreeAsserts.*;
import static vn.giapha.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.util.Random;
import java.util.concurrent.atomic.AtomicLong;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.IntegrationTest;
import vn.giapha.domain.FamilyTree;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.mapper.FamilyTreeMapper;

/**
 * Integration tests for the {@link FamilyTreeResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class FamilyTreeResourceIT {

    private static final String DEFAULT_SLUG = "AAAAAAAAAA";
    private static final String UPDATED_SLUG = "BBBBBBBBBB";

    private static final String DEFAULT_SURNAME = "AAAAAAAAAA";
    private static final String UPDATED_SURNAME = "BBBBBBBBBB";

    private static final String DEFAULT_BRANCH_NAME = "AAAAAAAAAA";
    private static final String UPDATED_BRANCH_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_PROVINCE_CODE = "AAAAAAAAAA";
    private static final String UPDATED_PROVINCE_CODE = "BBBBBBBBBB";

    private static final String DEFAULT_META_JSON = "AAAAAAAAAA";
    private static final String UPDATED_META_JSON = "BBBBBBBBBB";

    private static final String DEFAULT_STATS_CACHE_JSON = "AAAAAAAAAA";
    private static final String UPDATED_STATS_CACHE_JSON = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/family-trees";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private FamilyTreeRepository familyTreeRepository;

    @Autowired
    private FamilyTreeMapper familyTreeMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restFamilyTreeMockMvc;

    private FamilyTree familyTree;

    private FamilyTree insertedFamilyTree;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FamilyTree createEntity() {
        return new FamilyTree()
            .slug(DEFAULT_SLUG)
            .surname(DEFAULT_SURNAME)
            .branchName(DEFAULT_BRANCH_NAME)
            .provinceCode(DEFAULT_PROVINCE_CODE)
            .metaJson(DEFAULT_META_JSON)
            .statsCacheJson(DEFAULT_STATS_CACHE_JSON);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static FamilyTree createUpdatedEntity() {
        return new FamilyTree()
            .slug(UPDATED_SLUG)
            .surname(UPDATED_SURNAME)
            .branchName(UPDATED_BRANCH_NAME)
            .provinceCode(UPDATED_PROVINCE_CODE)
            .metaJson(UPDATED_META_JSON)
            .statsCacheJson(UPDATED_STATS_CACHE_JSON);
    }

    @BeforeEach
    void initTest() {
        familyTree = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedFamilyTree != null) {
            familyTreeRepository.delete(insertedFamilyTree);
            insertedFamilyTree = null;
        }
    }

    @Test
    @Transactional
    void createFamilyTree() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the FamilyTree
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);
        var returnedFamilyTreeDTO = om.readValue(
            restFamilyTreeMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(familyTreeDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            FamilyTreeDTO.class
        );

        // Validate the FamilyTree in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedFamilyTree = familyTreeMapper.toEntity(returnedFamilyTreeDTO);
        assertFamilyTreeUpdatableFieldsEquals(returnedFamilyTree, getPersistedFamilyTree(returnedFamilyTree));

        insertedFamilyTree = returnedFamilyTree;
    }

    @Test
    @Transactional
    void createFamilyTreeWithExistingId() throws Exception {
        // Create the FamilyTree with an existing ID
        familyTree.setId(1L);
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restFamilyTreeMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(familyTreeDTO)))
            .andExpect(status().isBadRequest());

        // Validate the FamilyTree in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkSlugIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        familyTree.setSlug(null);

        // Create the FamilyTree, which fails.
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);

        restFamilyTreeMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(familyTreeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkSurnameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        familyTree.setSurname(null);

        // Create the FamilyTree, which fails.
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);

        restFamilyTreeMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(familyTreeDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllFamilyTrees() throws Exception {
        // Initialize the database
        insertedFamilyTree = familyTreeRepository.saveAndFlush(familyTree);

        // Get all the familyTreeList
        restFamilyTreeMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(familyTree.getId().intValue())))
            .andExpect(jsonPath("$.[*].slug").value(hasItem(DEFAULT_SLUG)))
            .andExpect(jsonPath("$.[*].surname").value(hasItem(DEFAULT_SURNAME)))
            .andExpect(jsonPath("$.[*].branchName").value(hasItem(DEFAULT_BRANCH_NAME)))
            .andExpect(jsonPath("$.[*].provinceCode").value(hasItem(DEFAULT_PROVINCE_CODE)))
            .andExpect(jsonPath("$.[*].metaJson").value(hasItem(DEFAULT_META_JSON)))
            .andExpect(jsonPath("$.[*].statsCacheJson").value(hasItem(DEFAULT_STATS_CACHE_JSON)));
    }

    @Test
    @Transactional
    void getFamilyTree() throws Exception {
        // Initialize the database
        insertedFamilyTree = familyTreeRepository.saveAndFlush(familyTree);

        // Get the familyTree
        restFamilyTreeMockMvc
            .perform(get(ENTITY_API_URL_ID, familyTree.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(familyTree.getId().intValue()))
            .andExpect(jsonPath("$.slug").value(DEFAULT_SLUG))
            .andExpect(jsonPath("$.surname").value(DEFAULT_SURNAME))
            .andExpect(jsonPath("$.branchName").value(DEFAULT_BRANCH_NAME))
            .andExpect(jsonPath("$.provinceCode").value(DEFAULT_PROVINCE_CODE))
            .andExpect(jsonPath("$.metaJson").value(DEFAULT_META_JSON))
            .andExpect(jsonPath("$.statsCacheJson").value(DEFAULT_STATS_CACHE_JSON));
    }

    @Test
    @Transactional
    void getNonExistingFamilyTree() throws Exception {
        // Get the familyTree
        restFamilyTreeMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingFamilyTree() throws Exception {
        // Initialize the database
        insertedFamilyTree = familyTreeRepository.saveAndFlush(familyTree);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the familyTree
        FamilyTree updatedFamilyTree = familyTreeRepository.findById(familyTree.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedFamilyTree are not directly saved in db
        em.detach(updatedFamilyTree);
        updatedFamilyTree
            .slug(UPDATED_SLUG)
            .surname(UPDATED_SURNAME)
            .branchName(UPDATED_BRANCH_NAME)
            .provinceCode(UPDATED_PROVINCE_CODE)
            .metaJson(UPDATED_META_JSON)
            .statsCacheJson(UPDATED_STATS_CACHE_JSON);
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(updatedFamilyTree);

        restFamilyTreeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, familyTreeDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(familyTreeDTO))
            )
            .andExpect(status().isOk());

        // Validate the FamilyTree in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedFamilyTreeToMatchAllProperties(updatedFamilyTree);
    }

    @Test
    @Transactional
    void putNonExistingFamilyTree() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyTree.setId(longCount.incrementAndGet());

        // Create the FamilyTree
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFamilyTreeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, familyTreeDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(familyTreeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FamilyTree in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchFamilyTree() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyTree.setId(longCount.incrementAndGet());

        // Create the FamilyTree
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFamilyTreeMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(familyTreeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FamilyTree in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamFamilyTree() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyTree.setId(longCount.incrementAndGet());

        // Create the FamilyTree
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFamilyTreeMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(familyTreeDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the FamilyTree in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateFamilyTreeWithPatch() throws Exception {
        // Initialize the database
        insertedFamilyTree = familyTreeRepository.saveAndFlush(familyTree);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the familyTree using partial update
        FamilyTree partialUpdatedFamilyTree = new FamilyTree();
        partialUpdatedFamilyTree.setId(familyTree.getId());

        partialUpdatedFamilyTree.slug(UPDATED_SLUG).metaJson(UPDATED_META_JSON).statsCacheJson(UPDATED_STATS_CACHE_JSON);

        restFamilyTreeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFamilyTree.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFamilyTree))
            )
            .andExpect(status().isOk());

        // Validate the FamilyTree in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFamilyTreeUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedFamilyTree, familyTree),
            getPersistedFamilyTree(familyTree)
        );
    }

    @Test
    @Transactional
    void fullUpdateFamilyTreeWithPatch() throws Exception {
        // Initialize the database
        insertedFamilyTree = familyTreeRepository.saveAndFlush(familyTree);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the familyTree using partial update
        FamilyTree partialUpdatedFamilyTree = new FamilyTree();
        partialUpdatedFamilyTree.setId(familyTree.getId());

        partialUpdatedFamilyTree
            .slug(UPDATED_SLUG)
            .surname(UPDATED_SURNAME)
            .branchName(UPDATED_BRANCH_NAME)
            .provinceCode(UPDATED_PROVINCE_CODE)
            .metaJson(UPDATED_META_JSON)
            .statsCacheJson(UPDATED_STATS_CACHE_JSON);

        restFamilyTreeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedFamilyTree.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedFamilyTree))
            )
            .andExpect(status().isOk());

        // Validate the FamilyTree in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertFamilyTreeUpdatableFieldsEquals(partialUpdatedFamilyTree, getPersistedFamilyTree(partialUpdatedFamilyTree));
    }

    @Test
    @Transactional
    void patchNonExistingFamilyTree() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyTree.setId(longCount.incrementAndGet());

        // Create the FamilyTree
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restFamilyTreeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, familyTreeDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(familyTreeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FamilyTree in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchFamilyTree() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyTree.setId(longCount.incrementAndGet());

        // Create the FamilyTree
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFamilyTreeMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(familyTreeDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the FamilyTree in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamFamilyTree() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        familyTree.setId(longCount.incrementAndGet());

        // Create the FamilyTree
        FamilyTreeDTO familyTreeDTO = familyTreeMapper.toDto(familyTree);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restFamilyTreeMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(familyTreeDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the FamilyTree in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteFamilyTree() throws Exception {
        // Initialize the database
        insertedFamilyTree = familyTreeRepository.saveAndFlush(familyTree);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the familyTree
        restFamilyTreeMockMvc
            .perform(delete(ENTITY_API_URL_ID, familyTree.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return familyTreeRepository.count();
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

    protected FamilyTree getPersistedFamilyTree(FamilyTree familyTree) {
        return familyTreeRepository.findById(familyTree.getId()).orElseThrow();
    }

    protected void assertPersistedFamilyTreeToMatchAllProperties(FamilyTree expectedFamilyTree) {
        assertFamilyTreeAllPropertiesEquals(expectedFamilyTree, getPersistedFamilyTree(expectedFamilyTree));
    }

    protected void assertPersistedFamilyTreeToMatchUpdatableProperties(FamilyTree expectedFamilyTree) {
        assertFamilyTreeAllUpdatablePropertiesEquals(expectedFamilyTree, getPersistedFamilyTree(expectedFamilyTree));
    }
}
