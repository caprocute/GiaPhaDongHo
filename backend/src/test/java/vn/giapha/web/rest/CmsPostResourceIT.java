package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.CmsPostAsserts.*;
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
import vn.giapha.domain.CmsPost;
import vn.giapha.repository.CmsPostRepository;
import vn.giapha.service.CmsPostService;
import vn.giapha.service.dto.CmsPostDTO;
import vn.giapha.service.mapper.CmsPostMapper;

/**
 * Integration tests for the {@link CmsPostResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class CmsPostResourceIT {

    private static final String DEFAULT_SLUG = "AAAAAAAAAA";
    private static final String UPDATED_SLUG = "BBBBBBBBBB";

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_SUMMARY = "AAAAAAAAAA";
    private static final String UPDATED_SUMMARY = "BBBBBBBBBB";

    private static final String DEFAULT_BODY_HTML = "AAAAAAAAAA";
    private static final String UPDATED_BODY_HTML = "BBBBBBBBBB";

    private static final String DEFAULT_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_STATUS = "BBBBBBBBBB";

    private static final Instant DEFAULT_PUBLISHED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_PUBLISHED_AT = Instant.ofEpochMilli(1703756156789L);

    private static final Long DEFAULT_VIEW_COUNT = 1L;
    private static final Long UPDATED_VIEW_COUNT = 2L;

    private static final String DEFAULT_AUTHOR_NAME = "AAAAAAAAAA";
    private static final String UPDATED_AUTHOR_NAME = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/cms-posts";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CmsPostRepository cmsPostRepository;

    @Mock
    private CmsPostRepository cmsPostRepositoryMock;

    @Autowired
    private CmsPostMapper cmsPostMapper;

    @Mock
    private CmsPostService cmsPostServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCmsPostMockMvc;

    private CmsPost cmsPost;

    private CmsPost insertedCmsPost;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CmsPost createEntity() {
        return new CmsPost()
            .slug(DEFAULT_SLUG)
            .title(DEFAULT_TITLE)
            .summary(DEFAULT_SUMMARY)
            .bodyHtml(DEFAULT_BODY_HTML)
            .status(DEFAULT_STATUS)
            .publishedAt(DEFAULT_PUBLISHED_AT)
            .viewCount(DEFAULT_VIEW_COUNT)
            .authorName(DEFAULT_AUTHOR_NAME);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CmsPost createUpdatedEntity() {
        return new CmsPost()
            .slug(UPDATED_SLUG)
            .title(UPDATED_TITLE)
            .summary(UPDATED_SUMMARY)
            .bodyHtml(UPDATED_BODY_HTML)
            .status(UPDATED_STATUS)
            .publishedAt(UPDATED_PUBLISHED_AT)
            .viewCount(UPDATED_VIEW_COUNT)
            .authorName(UPDATED_AUTHOR_NAME);
    }

    @BeforeEach
    void initTest() {
        cmsPost = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCmsPost != null) {
            cmsPostRepository.delete(insertedCmsPost);
            insertedCmsPost = null;
        }
    }

    @Test
    @Transactional
    void createCmsPost() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CmsPost
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);
        var returnedCmsPostDTO = om.readValue(
            restCmsPostMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsPostDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CmsPostDTO.class
        );

        // Validate the CmsPost in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCmsPost = cmsPostMapper.toEntity(returnedCmsPostDTO);
        assertCmsPostUpdatableFieldsEquals(returnedCmsPost, getPersistedCmsPost(returnedCmsPost));

        insertedCmsPost = returnedCmsPost;
    }

    @Test
    @Transactional
    void createCmsPostWithExistingId() throws Exception {
        // Create the CmsPost with an existing ID
        cmsPost.setId(1L);
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCmsPostMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsPostDTO)))
            .andExpect(status().isBadRequest());

        // Validate the CmsPost in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkSlugIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cmsPost.setSlug(null);

        // Create the CmsPost, which fails.
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);

        restCmsPostMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsPostDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        cmsPost.setTitle(null);

        // Create the CmsPost, which fails.
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);

        restCmsPostMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsPostDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllCmsPosts() throws Exception {
        // Initialize the database
        insertedCmsPost = cmsPostRepository.saveAndFlush(cmsPost);

        // Get all the cmsPostList
        restCmsPostMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(cmsPost.getId().intValue())))
            .andExpect(jsonPath("$.[*].slug").value(hasItem(DEFAULT_SLUG)))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].summary").value(hasItem(DEFAULT_SUMMARY)))
            .andExpect(jsonPath("$.[*].bodyHtml").value(hasItem(DEFAULT_BODY_HTML)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)))
            .andExpect(jsonPath("$.[*].publishedAt").value(hasItem(DEFAULT_PUBLISHED_AT.toString())))
            .andExpect(jsonPath("$.[*].viewCount").value(hasItem(DEFAULT_VIEW_COUNT.intValue())))
            .andExpect(jsonPath("$.[*].authorName").value(hasItem(DEFAULT_AUTHOR_NAME)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCmsPostsWithEagerRelationshipsIsEnabled() throws Exception {
        when(cmsPostServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCmsPostMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(cmsPostServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCmsPostsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(cmsPostServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCmsPostMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(cmsPostRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getCmsPost() throws Exception {
        // Initialize the database
        insertedCmsPost = cmsPostRepository.saveAndFlush(cmsPost);

        // Get the cmsPost
        restCmsPostMockMvc
            .perform(get(ENTITY_API_URL_ID, cmsPost.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(cmsPost.getId().intValue()))
            .andExpect(jsonPath("$.slug").value(DEFAULT_SLUG))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.summary").value(DEFAULT_SUMMARY))
            .andExpect(jsonPath("$.bodyHtml").value(DEFAULT_BODY_HTML))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS))
            .andExpect(jsonPath("$.publishedAt").value(DEFAULT_PUBLISHED_AT.toString()))
            .andExpect(jsonPath("$.viewCount").value(DEFAULT_VIEW_COUNT.intValue()))
            .andExpect(jsonPath("$.authorName").value(DEFAULT_AUTHOR_NAME));
    }

    @Test
    @Transactional
    void getNonExistingCmsPost() throws Exception {
        // Get the cmsPost
        restCmsPostMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCmsPost() throws Exception {
        // Initialize the database
        insertedCmsPost = cmsPostRepository.saveAndFlush(cmsPost);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cmsPost
        CmsPost updatedCmsPost = cmsPostRepository.findById(cmsPost.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCmsPost are not directly saved in db
        em.detach(updatedCmsPost);
        updatedCmsPost
            .slug(UPDATED_SLUG)
            .title(UPDATED_TITLE)
            .summary(UPDATED_SUMMARY)
            .bodyHtml(UPDATED_BODY_HTML)
            .status(UPDATED_STATUS)
            .publishedAt(UPDATED_PUBLISHED_AT)
            .viewCount(UPDATED_VIEW_COUNT)
            .authorName(UPDATED_AUTHOR_NAME);
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(updatedCmsPost);

        restCmsPostMockMvc
            .perform(
                put(ENTITY_API_URL_ID, cmsPostDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cmsPostDTO))
            )
            .andExpect(status().isOk());

        // Validate the CmsPost in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCmsPostToMatchAllProperties(updatedCmsPost);
    }

    @Test
    @Transactional
    void putNonExistingCmsPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsPost.setId(longCount.incrementAndGet());

        // Create the CmsPost
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCmsPostMockMvc
            .perform(
                put(ENTITY_API_URL_ID, cmsPostDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cmsPostDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsPost in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCmsPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsPost.setId(longCount.incrementAndGet());

        // Create the CmsPost
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsPostMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cmsPostDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsPost in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCmsPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsPost.setId(longCount.incrementAndGet());

        // Create the CmsPost
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsPostMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsPostDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the CmsPost in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCmsPostWithPatch() throws Exception {
        // Initialize the database
        insertedCmsPost = cmsPostRepository.saveAndFlush(cmsPost);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cmsPost using partial update
        CmsPost partialUpdatedCmsPost = new CmsPost();
        partialUpdatedCmsPost.setId(cmsPost.getId());

        partialUpdatedCmsPost
            .title(UPDATED_TITLE)
            .summary(UPDATED_SUMMARY)
            .publishedAt(UPDATED_PUBLISHED_AT)
            .authorName(UPDATED_AUTHOR_NAME);

        restCmsPostMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCmsPost.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCmsPost))
            )
            .andExpect(status().isOk());

        // Validate the CmsPost in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCmsPostUpdatableFieldsEquals(createUpdateProxyForBean(partialUpdatedCmsPost, cmsPost), getPersistedCmsPost(cmsPost));
    }

    @Test
    @Transactional
    void fullUpdateCmsPostWithPatch() throws Exception {
        // Initialize the database
        insertedCmsPost = cmsPostRepository.saveAndFlush(cmsPost);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cmsPost using partial update
        CmsPost partialUpdatedCmsPost = new CmsPost();
        partialUpdatedCmsPost.setId(cmsPost.getId());

        partialUpdatedCmsPost
            .slug(UPDATED_SLUG)
            .title(UPDATED_TITLE)
            .summary(UPDATED_SUMMARY)
            .bodyHtml(UPDATED_BODY_HTML)
            .status(UPDATED_STATUS)
            .publishedAt(UPDATED_PUBLISHED_AT)
            .viewCount(UPDATED_VIEW_COUNT)
            .authorName(UPDATED_AUTHOR_NAME);

        restCmsPostMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCmsPost.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCmsPost))
            )
            .andExpect(status().isOk());

        // Validate the CmsPost in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCmsPostUpdatableFieldsEquals(partialUpdatedCmsPost, getPersistedCmsPost(partialUpdatedCmsPost));
    }

    @Test
    @Transactional
    void patchNonExistingCmsPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsPost.setId(longCount.incrementAndGet());

        // Create the CmsPost
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCmsPostMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, cmsPostDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(cmsPostDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsPost in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCmsPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsPost.setId(longCount.incrementAndGet());

        // Create the CmsPost
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsPostMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(cmsPostDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsPost in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCmsPost() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsPost.setId(longCount.incrementAndGet());

        // Create the CmsPost
        CmsPostDTO cmsPostDTO = cmsPostMapper.toDto(cmsPost);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsPostMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(cmsPostDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CmsPost in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCmsPost() throws Exception {
        // Initialize the database
        insertedCmsPost = cmsPostRepository.saveAndFlush(cmsPost);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the cmsPost
        restCmsPostMockMvc
            .perform(delete(ENTITY_API_URL_ID, cmsPost.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return cmsPostRepository.count();
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

    protected CmsPost getPersistedCmsPost(CmsPost cmsPost) {
        return cmsPostRepository.findById(cmsPost.getId()).orElseThrow();
    }

    protected void assertPersistedCmsPostToMatchAllProperties(CmsPost expectedCmsPost) {
        assertCmsPostAllPropertiesEquals(expectedCmsPost, getPersistedCmsPost(expectedCmsPost));
    }

    protected void assertPersistedCmsPostToMatchUpdatableProperties(CmsPost expectedCmsPost) {
        assertCmsPostAllUpdatablePropertiesEquals(expectedCmsPost, getPersistedCmsPost(expectedCmsPost));
    }
}
