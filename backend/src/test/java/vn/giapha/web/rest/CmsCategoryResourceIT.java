package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.CmsCategoryAsserts.*;
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
import vn.giapha.domain.CmsCategory;
import vn.giapha.repository.CmsCategoryRepository;
import vn.giapha.service.dto.CmsCategoryDTO;
import vn.giapha.service.mapper.CmsCategoryMapper;

/**
 * Integration tests for the {@link CmsCategoryResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class CmsCategoryResourceIT {

    private static final String DEFAULT_SLUG = "AAAAAAAAAA";
    private static final String UPDATED_SLUG = "BBBBBBBBBB";

    private static final String DEFAULT_NAME = "AAAAAAAAAA";
    private static final String UPDATED_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_LAYOUT = "AAAAAAAAAA";
    private static final String UPDATED_LAYOUT = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/cms-categories";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CmsCategoryRepository cmsCategoryRepository;

    @Autowired
    private CmsCategoryMapper cmsCategoryMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCmsCategoryMockMvc;

    private CmsCategory cmsCategory;

    private CmsCategory insertedCmsCategory;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CmsCategory createEntity() {
        return new CmsCategory().slug(DEFAULT_SLUG).name(DEFAULT_NAME).layout(DEFAULT_LAYOUT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CmsCategory createUpdatedEntity() {
        return new CmsCategory().slug(UPDATED_SLUG).name(UPDATED_NAME).layout(UPDATED_LAYOUT);
    }

    @BeforeEach
    void initTest() {
        cmsCategory = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCmsCategory != null) {
            cmsCategoryRepository.delete(insertedCmsCategory);
            insertedCmsCategory = null;
        }
    }

    @Test
    @Transactional
    void createCmsCategory() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CmsCategory
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);
        var returnedCmsCategoryDTO = om.readValue(
            restCmsCategoryMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsCategoryDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CmsCategoryDTO.class
        );

        // Validate the CmsCategory in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCmsCategory = cmsCategoryMapper.toEntity(returnedCmsCategoryDTO);
        assertCmsCategoryUpdatableFieldsEquals(returnedCmsCategory, getPersistedCmsCategory(returnedCmsCategory));

        insertedCmsCategory = returnedCmsCategory;
    }

    @Test
    @Transactional
    void createCmsCategoryWithExistingId() throws Exception {
        // Create the CmsCategory with an existing ID
        cmsCategory.setId(1L);
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCmsCategoryMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkSlugIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cmsCategory.setSlug(null);

        // Create the CmsCategory, which fails.
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);

        restCmsCategoryMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkNameIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cmsCategory.setName(null);

        // Create the CmsCategory, which fails.
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);

        restCmsCategoryMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCmsCategories() throws Exception {
        // Initialize the database
        insertedCmsCategory = cmsCategoryRepository.saveAndFlush(cmsCategory);

        // Get all the cmsCategoryList
        restCmsCategoryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(cmsCategory.getId().intValue())))
            .andExpect(jsonPath("$.[*].slug").value(hasItem(DEFAULT_SLUG)))
            .andExpect(jsonPath("$.[*].name").value(hasItem(DEFAULT_NAME)))
            .andExpect(jsonPath("$.[*].layout").value(hasItem(DEFAULT_LAYOUT)));
    }

    @Test
    @Transactional
    void getCmsCategory() throws Exception {
        // Initialize the database
        insertedCmsCategory = cmsCategoryRepository.saveAndFlush(cmsCategory);

        // Get the cmsCategory
        restCmsCategoryMockMvc
            .perform(get(ENTITY_API_URL_ID, cmsCategory.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(cmsCategory.getId().intValue()))
            .andExpect(jsonPath("$.slug").value(DEFAULT_SLUG))
            .andExpect(jsonPath("$.name").value(DEFAULT_NAME))
            .andExpect(jsonPath("$.layout").value(DEFAULT_LAYOUT));
    }

    @Test
    @Transactional
    void getNonExistingCmsCategory() throws Exception {
        // Get the cmsCategory
        restCmsCategoryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCmsCategory() throws Exception {
        // Initialize the database
        insertedCmsCategory = cmsCategoryRepository.saveAndFlush(cmsCategory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cmsCategory
        CmsCategory updatedCmsCategory = cmsCategoryRepository.findById(cmsCategory.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCmsCategory are not directly saved in db
        em.detach(updatedCmsCategory);
        updatedCmsCategory.slug(UPDATED_SLUG).name(UPDATED_NAME).layout(UPDATED_LAYOUT);
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(updatedCmsCategory);

        restCmsCategoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, cmsCategoryDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cmsCategoryDTO))
            )
            .andExpect(status().isOk());

        // Validate the CmsCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCmsCategoryToMatchAllProperties(updatedCmsCategory);
    }

    @Test
    @Transactional
    void putNonExistingCmsCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsCategory.setId(longCount.incrementAndGet());

        // Create the CmsCategory
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCmsCategoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, cmsCategoryDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cmsCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCmsCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsCategory.setId(longCount.incrementAndGet());

        // Create the CmsCategory
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsCategoryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cmsCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCmsCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsCategory.setId(longCount.incrementAndGet());

        // Create the CmsCategory
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsCategoryMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsCategoryDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the CmsCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCmsCategoryWithPatch() throws Exception {
        // Initialize the database
        insertedCmsCategory = cmsCategoryRepository.saveAndFlush(cmsCategory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cmsCategory using partial update
        CmsCategory partialUpdatedCmsCategory = new CmsCategory();
        partialUpdatedCmsCategory.setId(cmsCategory.getId());

        partialUpdatedCmsCategory.layout(UPDATED_LAYOUT);

        restCmsCategoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCmsCategory.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCmsCategory))
            )
            .andExpect(status().isOk());

        // Validate the CmsCategory in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCmsCategoryUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedCmsCategory, cmsCategory),
            getPersistedCmsCategory(cmsCategory)
        );
    }

    @Test
    @Transactional
    void fullUpdateCmsCategoryWithPatch() throws Exception {
        // Initialize the database
        insertedCmsCategory = cmsCategoryRepository.saveAndFlush(cmsCategory);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cmsCategory using partial update
        CmsCategory partialUpdatedCmsCategory = new CmsCategory();
        partialUpdatedCmsCategory.setId(cmsCategory.getId());

        partialUpdatedCmsCategory.slug(UPDATED_SLUG).name(UPDATED_NAME).layout(UPDATED_LAYOUT);

        restCmsCategoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCmsCategory.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCmsCategory))
            )
            .andExpect(status().isOk());

        // Validate the CmsCategory in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCmsCategoryUpdatableFieldsEquals(partialUpdatedCmsCategory, getPersistedCmsCategory(partialUpdatedCmsCategory));
    }

    @Test
    @Transactional
    void patchNonExistingCmsCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsCategory.setId(longCount.incrementAndGet());

        // Create the CmsCategory
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCmsCategoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, cmsCategoryDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(cmsCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCmsCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsCategory.setId(longCount.incrementAndGet());

        // Create the CmsCategory
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsCategoryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(cmsCategoryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCmsCategory() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsCategory.setId(longCount.incrementAndGet());

        // Create the CmsCategory
        CmsCategoryDTO cmsCategoryDTO = cmsCategoryMapper.toDto(cmsCategory);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsCategoryMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(cmsCategoryDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CmsCategory in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCmsCategory() throws Exception {
        // Initialize the database
        insertedCmsCategory = cmsCategoryRepository.saveAndFlush(cmsCategory);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the cmsCategory
        restCmsCategoryMockMvc
            .perform(delete(ENTITY_API_URL_ID, cmsCategory.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return cmsCategoryRepository.count();
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

    protected CmsCategory getPersistedCmsCategory(CmsCategory cmsCategory) {
        return cmsCategoryRepository.findById(cmsCategory.getId()).orElseThrow();
    }

    protected void assertPersistedCmsCategoryToMatchAllProperties(CmsCategory expectedCmsCategory) {
        assertCmsCategoryAllPropertiesEquals(expectedCmsCategory, getPersistedCmsCategory(expectedCmsCategory));
    }

    protected void assertPersistedCmsCategoryToMatchUpdatableProperties(CmsCategory expectedCmsCategory) {
        assertCmsCategoryAllUpdatablePropertiesEquals(expectedCmsCategory, getPersistedCmsCategory(expectedCmsCategory));
    }
}
