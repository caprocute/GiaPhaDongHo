package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.ChangeRequestAsserts.*;
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
import vn.giapha.domain.ChangeRequest;
import vn.giapha.repository.ChangeRequestRepository;
import vn.giapha.service.ChangeRequestService;
import vn.giapha.service.dto.ChangeRequestDTO;
import vn.giapha.service.mapper.ChangeRequestMapper;

/**
 * Integration tests for the {@link ChangeRequestResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class ChangeRequestResourceIT {

    private static final String DEFAULT_REQUESTER_USER_ID = "AAAAAAAAAA";
    private static final String UPDATED_REQUESTER_USER_ID = "BBBBBBBBBB";

    private static final String DEFAULT_ENTITY_TYPE = "AAAAAAAAAA";
    private static final String UPDATED_ENTITY_TYPE = "BBBBBBBBBB";

    private static final String DEFAULT_SUMMARY = "AAAAAAAAAA";
    private static final String UPDATED_SUMMARY = "BBBBBBBBBB";

    private static final String DEFAULT_DIFF_JSON = "AAAAAAAAAA";
    private static final String UPDATED_DIFF_JSON = "BBBBBBBBBB";

    private static final String DEFAULT_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_STATUS = "BBBBBBBBBB";

    private static final String DEFAULT_REVIEWER_NOTE = "AAAAAAAAAA";
    private static final String UPDATED_REVIEWER_NOTE = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.ofEpochMilli(1703756156789L);

    private static final Instant DEFAULT_REVIEWED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_REVIEWED_AT = Instant.ofEpochMilli(1703756156789L);

    private static final String ENTITY_API_URL = "/api/change-requests";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private ChangeRequestRepository changeRequestRepository;

    @Mock
    private ChangeRequestRepository changeRequestRepositoryMock;

    @Autowired
    private ChangeRequestMapper changeRequestMapper;

    @Mock
    private ChangeRequestService changeRequestServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restChangeRequestMockMvc;

    private ChangeRequest changeRequest;

    private ChangeRequest insertedChangeRequest;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ChangeRequest createEntity() {
        return new ChangeRequest()
            .requesterUserId(DEFAULT_REQUESTER_USER_ID)
            .entityType(DEFAULT_ENTITY_TYPE)
            .summary(DEFAULT_SUMMARY)
            .diffJson(DEFAULT_DIFF_JSON)
            .status(DEFAULT_STATUS)
            .reviewerNote(DEFAULT_REVIEWER_NOTE)
            .createdAt(DEFAULT_CREATED_AT)
            .reviewedAt(DEFAULT_REVIEWED_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static ChangeRequest createUpdatedEntity() {
        return new ChangeRequest()
            .requesterUserId(UPDATED_REQUESTER_USER_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .summary(UPDATED_SUMMARY)
            .diffJson(UPDATED_DIFF_JSON)
            .status(UPDATED_STATUS)
            .reviewerNote(UPDATED_REVIEWER_NOTE)
            .createdAt(UPDATED_CREATED_AT)
            .reviewedAt(UPDATED_REVIEWED_AT);
    }

    @BeforeEach
    void initTest() {
        changeRequest = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedChangeRequest != null) {
            changeRequestRepository.delete(insertedChangeRequest);
            insertedChangeRequest = null;
        }
    }

    @Test
    @Transactional
    void createChangeRequest() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the ChangeRequest
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);
        var returnedChangeRequestDTO = om.readValue(
            restChangeRequestMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(changeRequestDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            ChangeRequestDTO.class
        );

        // Validate the ChangeRequest in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedChangeRequest = changeRequestMapper.toEntity(returnedChangeRequestDTO);
        assertChangeRequestUpdatableFieldsEquals(returnedChangeRequest, getPersistedChangeRequest(returnedChangeRequest));

        insertedChangeRequest = returnedChangeRequest;
    }

    @Test
    @Transactional
    void createChangeRequestWithExistingId() throws Exception {
        // Create the ChangeRequest with an existing ID
        changeRequest.setId(1L);
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restChangeRequestMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ChangeRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkRequesterUserIdIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        changeRequest.setRequesterUserId(null);

        // Create the ChangeRequest, which fails.
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);

        restChangeRequestMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkEntityTypeIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        changeRequest.setEntityType(null);

        // Create the ChangeRequest, which fails.
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);

        restChangeRequestMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllChangeRequests() throws Exception {
        // Initialize the database
        insertedChangeRequest = changeRequestRepository.saveAndFlush(changeRequest);

        // Get all the changeRequestList
        restChangeRequestMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(changeRequest.getId().intValue())))
            .andExpect(jsonPath("$.[*].requesterUserId").value(hasItem(DEFAULT_REQUESTER_USER_ID)))
            .andExpect(jsonPath("$.[*].entityType").value(hasItem(DEFAULT_ENTITY_TYPE)))
            .andExpect(jsonPath("$.[*].summary").value(hasItem(DEFAULT_SUMMARY)))
            .andExpect(jsonPath("$.[*].diffJson").value(hasItem(DEFAULT_DIFF_JSON)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)))
            .andExpect(jsonPath("$.[*].reviewerNote").value(hasItem(DEFAULT_REVIEWER_NOTE)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())))
            .andExpect(jsonPath("$.[*].reviewedAt").value(hasItem(DEFAULT_REVIEWED_AT.toString())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllChangeRequestsWithEagerRelationshipsIsEnabled() throws Exception {
        when(changeRequestServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restChangeRequestMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(changeRequestServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllChangeRequestsWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(changeRequestServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restChangeRequestMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(changeRequestRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getChangeRequest() throws Exception {
        // Initialize the database
        insertedChangeRequest = changeRequestRepository.saveAndFlush(changeRequest);

        // Get the changeRequest
        restChangeRequestMockMvc
            .perform(get(ENTITY_API_URL_ID, changeRequest.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(changeRequest.getId().intValue()))
            .andExpect(jsonPath("$.requesterUserId").value(DEFAULT_REQUESTER_USER_ID))
            .andExpect(jsonPath("$.entityType").value(DEFAULT_ENTITY_TYPE))
            .andExpect(jsonPath("$.summary").value(DEFAULT_SUMMARY))
            .andExpect(jsonPath("$.diffJson").value(DEFAULT_DIFF_JSON))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS))
            .andExpect(jsonPath("$.reviewerNote").value(DEFAULT_REVIEWER_NOTE))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()))
            .andExpect(jsonPath("$.reviewedAt").value(DEFAULT_REVIEWED_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingChangeRequest() throws Exception {
        // Get the changeRequest
        restChangeRequestMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingChangeRequest() throws Exception {
        // Initialize the database
        insertedChangeRequest = changeRequestRepository.saveAndFlush(changeRequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the changeRequest
        ChangeRequest updatedChangeRequest = changeRequestRepository.findById(changeRequest.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedChangeRequest are not directly saved in db
        em.detach(updatedChangeRequest);
        updatedChangeRequest
            .requesterUserId(UPDATED_REQUESTER_USER_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .summary(UPDATED_SUMMARY)
            .diffJson(UPDATED_DIFF_JSON)
            .status(UPDATED_STATUS)
            .reviewerNote(UPDATED_REVIEWER_NOTE)
            .createdAt(UPDATED_CREATED_AT)
            .reviewedAt(UPDATED_REVIEWED_AT);
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(updatedChangeRequest);

        restChangeRequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, changeRequestDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isOk());

        // Validate the ChangeRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedChangeRequestToMatchAllProperties(updatedChangeRequest);
    }

    @Test
    @Transactional
    void putNonExistingChangeRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        changeRequest.setId(longCount.incrementAndGet());

        // Create the ChangeRequest
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChangeRequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, changeRequestDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ChangeRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchChangeRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        changeRequest.setId(longCount.incrementAndGet());

        // Create the ChangeRequest
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChangeRequestMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ChangeRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamChangeRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        changeRequest.setId(longCount.incrementAndGet());

        // Create the ChangeRequest
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChangeRequestMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ChangeRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateChangeRequestWithPatch() throws Exception {
        // Initialize the database
        insertedChangeRequest = changeRequestRepository.saveAndFlush(changeRequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the changeRequest using partial update
        ChangeRequest partialUpdatedChangeRequest = new ChangeRequest();
        partialUpdatedChangeRequest.setId(changeRequest.getId());

        partialUpdatedChangeRequest.diffJson(UPDATED_DIFF_JSON).reviewerNote(UPDATED_REVIEWER_NOTE);

        restChangeRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChangeRequest.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChangeRequest))
            )
            .andExpect(status().isOk());

        // Validate the ChangeRequest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChangeRequestUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedChangeRequest, changeRequest),
            getPersistedChangeRequest(changeRequest)
        );
    }

    @Test
    @Transactional
    void fullUpdateChangeRequestWithPatch() throws Exception {
        // Initialize the database
        insertedChangeRequest = changeRequestRepository.saveAndFlush(changeRequest);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the changeRequest using partial update
        ChangeRequest partialUpdatedChangeRequest = new ChangeRequest();
        partialUpdatedChangeRequest.setId(changeRequest.getId());

        partialUpdatedChangeRequest
            .requesterUserId(UPDATED_REQUESTER_USER_ID)
            .entityType(UPDATED_ENTITY_TYPE)
            .summary(UPDATED_SUMMARY)
            .diffJson(UPDATED_DIFF_JSON)
            .status(UPDATED_STATUS)
            .reviewerNote(UPDATED_REVIEWER_NOTE)
            .createdAt(UPDATED_CREATED_AT)
            .reviewedAt(UPDATED_REVIEWED_AT);

        restChangeRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedChangeRequest.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedChangeRequest))
            )
            .andExpect(status().isOk());

        // Validate the ChangeRequest in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertChangeRequestUpdatableFieldsEquals(partialUpdatedChangeRequest, getPersistedChangeRequest(partialUpdatedChangeRequest));
    }

    @Test
    @Transactional
    void patchNonExistingChangeRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        changeRequest.setId(longCount.incrementAndGet());

        // Create the ChangeRequest
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restChangeRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, changeRequestDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ChangeRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchChangeRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        changeRequest.setId(longCount.incrementAndGet());

        // Create the ChangeRequest
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChangeRequestMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the ChangeRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamChangeRequest() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        changeRequest.setId(longCount.incrementAndGet());

        // Create the ChangeRequest
        ChangeRequestDTO changeRequestDTO = changeRequestMapper.toDto(changeRequest);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restChangeRequestMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(changeRequestDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the ChangeRequest in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteChangeRequest() throws Exception {
        // Initialize the database
        insertedChangeRequest = changeRequestRepository.saveAndFlush(changeRequest);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the changeRequest
        restChangeRequestMockMvc
            .perform(delete(ENTITY_API_URL_ID, changeRequest.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return changeRequestRepository.count();
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

    protected ChangeRequest getPersistedChangeRequest(ChangeRequest changeRequest) {
        return changeRequestRepository.findById(changeRequest.getId()).orElseThrow();
    }

    protected void assertPersistedChangeRequestToMatchAllProperties(ChangeRequest expectedChangeRequest) {
        assertChangeRequestAllPropertiesEquals(expectedChangeRequest, getPersistedChangeRequest(expectedChangeRequest));
    }

    protected void assertPersistedChangeRequestToMatchUpdatableProperties(ChangeRequest expectedChangeRequest) {
        assertChangeRequestAllUpdatablePropertiesEquals(expectedChangeRequest, getPersistedChangeRequest(expectedChangeRequest));
    }
}
