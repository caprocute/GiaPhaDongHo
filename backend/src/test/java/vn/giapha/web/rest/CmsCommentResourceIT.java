package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.CmsCommentAsserts.*;
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
import vn.giapha.domain.CmsComment;
import vn.giapha.repository.CmsCommentRepository;
import vn.giapha.service.CmsCommentService;
import vn.giapha.service.dto.CmsCommentDTO;
import vn.giapha.service.mapper.CmsCommentMapper;

/**
 * Integration tests for the {@link CmsCommentResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class CmsCommentResourceIT {

    private static final String DEFAULT_AUTHOR_NAME = "AAAAAAAAAA";
    private static final String UPDATED_AUTHOR_NAME = "BBBBBBBBBB";

    private static final String DEFAULT_BODY = "AAAAAAAAAA";
    private static final String UPDATED_BODY = "BBBBBBBBBB";

    private static final String DEFAULT_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_STATUS = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.ofEpochMilli(1703756156789L);

    private static final String ENTITY_API_URL = "/api/cms-comments";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private CmsCommentRepository cmsCommentRepository;

    @Mock
    private CmsCommentRepository cmsCommentRepositoryMock;

    @Autowired
    private CmsCommentMapper cmsCommentMapper;

    @Mock
    private CmsCommentService cmsCommentServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restCmsCommentMockMvc;

    private CmsComment cmsComment;

    private CmsComment insertedCmsComment;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CmsComment createEntity() {
        return new CmsComment().authorName(DEFAULT_AUTHOR_NAME).body(DEFAULT_BODY).status(DEFAULT_STATUS).createdAt(DEFAULT_CREATED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static CmsComment createUpdatedEntity() {
        return new CmsComment().authorName(UPDATED_AUTHOR_NAME).body(UPDATED_BODY).status(UPDATED_STATUS).createdAt(UPDATED_CREATED_AT);
    }

    @BeforeEach
    void initTest() {
        cmsComment = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedCmsComment != null) {
            cmsCommentRepository.delete(insertedCmsComment);
            insertedCmsComment = null;
        }
    }

    @Test
    @Transactional
    void createCmsComment() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the CmsComment
        CmsCommentDTO cmsCommentDTO = cmsCommentMapper.toDto(cmsComment);
        var returnedCmsCommentDTO = om.readValue(
            restCmsCommentMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsCommentDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            CmsCommentDTO.class
        );

        // Validate the CmsComment in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedCmsComment = cmsCommentMapper.toEntity(returnedCmsCommentDTO);
        assertCmsCommentUpdatableFieldsEquals(returnedCmsComment, getPersistedCmsComment(returnedCmsComment));

        insertedCmsComment = returnedCmsComment;
    }

    @Test
    @Transactional
    void createCmsCommentWithExistingId() throws Exception {
        // Create the CmsComment with an existing ID
        cmsComment.setId(1L);
        CmsCommentDTO cmsCommentDTO = cmsCommentMapper.toDto(cmsComment);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restCmsCommentMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsCommentDTO)))
            .andExpect(status().isBadRequest());

        // Validate the CmsComment in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllCmsComments() throws Exception {
        // Initialize the database
        insertedCmsComment = cmsCommentRepository.saveAndFlush(cmsComment);

        // Get all the cmsCommentList
        restCmsCommentMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(cmsComment.getId().intValue())))
            .andExpect(jsonPath("$.[*].authorName").value(hasItem(DEFAULT_AUTHOR_NAME)))
            .andExpect(jsonPath("$.[*].body").value(hasItem(DEFAULT_BODY)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCmsCommentsWithEagerRelationshipsIsEnabled() throws Exception {
        when(cmsCommentServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCmsCommentMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(cmsCommentServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllCmsCommentsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(cmsCommentServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restCmsCommentMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(cmsCommentRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getCmsComment() throws Exception {
        // Initialize the database
        insertedCmsComment = cmsCommentRepository.saveAndFlush(cmsComment);

        // Get the cmsComment
        restCmsCommentMockMvc
            .perform(get(ENTITY_API_URL_ID, cmsComment.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(cmsComment.getId().intValue()))
            .andExpect(jsonPath("$.authorName").value(DEFAULT_AUTHOR_NAME))
            .andExpect(jsonPath("$.body").value(DEFAULT_BODY))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingCmsComment() throws Exception {
        // Get the cmsComment
        restCmsCommentMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingCmsComment() throws Exception {
        // Initialize the database
        insertedCmsComment = cmsCommentRepository.saveAndFlush(cmsComment);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cmsComment
        CmsComment updatedCmsComment = cmsCommentRepository.findById(cmsComment.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedCmsComment are not directly saved in db
        em.detach(updatedCmsComment);
        updatedCmsComment.authorName(UPDATED_AUTHOR_NAME).body(UPDATED_BODY).status(UPDATED_STATUS).createdAt(UPDATED_CREATED_AT);
        CmsCommentDTO cmsCommentDTO = cmsCommentMapper.toDto(updatedCmsComment);

        restCmsCommentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, cmsCommentDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cmsCommentDTO))
            )
            .andExpect(status().isOk());

        // Validate the CmsComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedCmsCommentToMatchAllProperties(updatedCmsComment);
    }

    @Test
    @Transactional
    void putNonExistingCmsComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsComment.setId(longCount.incrementAndGet());

        // Create the CmsComment
        CmsCommentDTO cmsCommentDTO = cmsCommentMapper.toDto(cmsComment);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCmsCommentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, cmsCommentDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cmsCommentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchCmsComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsComment.setId(longCount.incrementAndGet());

        // Create the CmsComment
        CmsCommentDTO cmsCommentDTO = cmsCommentMapper.toDto(cmsComment);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsCommentMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(cmsCommentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamCmsComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsComment.setId(longCount.incrementAndGet());

        // Create the CmsComment
        CmsCommentDTO cmsCommentDTO = cmsCommentMapper.toDto(cmsComment);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsCommentMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(cmsCommentDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the CmsComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateCmsCommentWithPatch() throws Exception {
        // Initialize the database
        insertedCmsComment = cmsCommentRepository.saveAndFlush(cmsComment);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cmsComment using partial update
        CmsComment partialUpdatedCmsComment = new CmsComment();
        partialUpdatedCmsComment.setId(cmsComment.getId());

        partialUpdatedCmsComment.body(UPDATED_BODY).status(UPDATED_STATUS).createdAt(UPDATED_CREATED_AT);

        restCmsCommentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCmsComment.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCmsComment))
            )
            .andExpect(status().isOk());

        // Validate the CmsComment in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCmsCommentUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedCmsComment, cmsComment),
            getPersistedCmsComment(cmsComment)
        );
    }

    @Test
    @Transactional
    void fullUpdateCmsCommentWithPatch() throws Exception {
        // Initialize the database
        insertedCmsComment = cmsCommentRepository.saveAndFlush(cmsComment);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the cmsComment using partial update
        CmsComment partialUpdatedCmsComment = new CmsComment();
        partialUpdatedCmsComment.setId(cmsComment.getId());

        partialUpdatedCmsComment.authorName(UPDATED_AUTHOR_NAME).body(UPDATED_BODY).status(UPDATED_STATUS).createdAt(UPDATED_CREATED_AT);

        restCmsCommentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedCmsComment.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedCmsComment))
            )
            .andExpect(status().isOk());

        // Validate the CmsComment in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertCmsCommentUpdatableFieldsEquals(partialUpdatedCmsComment, getPersistedCmsComment(partialUpdatedCmsComment));
    }

    @Test
    @Transactional
    void patchNonExistingCmsComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsComment.setId(longCount.incrementAndGet());

        // Create the CmsComment
        CmsCommentDTO cmsCommentDTO = cmsCommentMapper.toDto(cmsComment);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restCmsCommentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, cmsCommentDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(cmsCommentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchCmsComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsComment.setId(longCount.incrementAndGet());

        // Create the CmsComment
        CmsCommentDTO cmsCommentDTO = cmsCommentMapper.toDto(cmsComment);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsCommentMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(cmsCommentDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the CmsComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamCmsComment() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        cmsComment.setId(longCount.incrementAndGet());

        // Create the CmsComment
        CmsCommentDTO cmsCommentDTO = cmsCommentMapper.toDto(cmsComment);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restCmsCommentMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(cmsCommentDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the CmsComment in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteCmsComment() throws Exception {
        // Initialize the database
        insertedCmsComment = cmsCommentRepository.saveAndFlush(cmsComment);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the cmsComment
        restCmsCommentMockMvc
            .perform(delete(ENTITY_API_URL_ID, cmsComment.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return cmsCommentRepository.count();
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

    protected CmsComment getPersistedCmsComment(CmsComment cmsComment) {
        return cmsCommentRepository.findById(cmsComment.getId()).orElseThrow();
    }

    protected void assertPersistedCmsCommentToMatchAllProperties(CmsComment expectedCmsComment) {
        assertCmsCommentAllPropertiesEquals(expectedCmsComment, getPersistedCmsComment(expectedCmsComment));
    }

    protected void assertPersistedCmsCommentToMatchUpdatableProperties(CmsComment expectedCmsComment) {
        assertCmsCommentAllUpdatablePropertiesEquals(expectedCmsComment, getPersistedCmsComment(expectedCmsComment));
    }
}
