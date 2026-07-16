package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.UnionMemberAsserts.*;
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
import vn.giapha.domain.UnionMember;
import vn.giapha.repository.UnionMemberRepository;

/**
 * Integration tests for the {@link UnionMemberResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class UnionMemberResourceIT {

    private static final String DEFAULT_ROLE = "AAAAAAAAAA";
    private static final String UPDATED_ROLE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/union-members";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private UnionMemberRepository unionMemberRepository;

    @Mock
    private UnionMemberRepository unionMemberRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUnionMemberMockMvc;

    private UnionMember unionMember;

    private UnionMember insertedUnionMember;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UnionMember createEntity() {
        return new UnionMember().role(DEFAULT_ROLE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UnionMember createUpdatedEntity() {
        return new UnionMember().role(UPDATED_ROLE);
    }

    @BeforeEach
    void initTest() {
        unionMember = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedUnionMember != null) {
            unionMemberRepository.delete(insertedUnionMember);
            insertedUnionMember = null;
        }
    }

    @Test
    @Transactional
    void createUnionMember() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the UnionMember
        var returnedUnionMember = om.readValue(
            restUnionMemberMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unionMember))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            UnionMember.class
        );

        // Validate the UnionMember in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertUnionMemberUpdatableFieldsEquals(returnedUnionMember, getPersistedUnionMember(returnedUnionMember));

        insertedUnionMember = returnedUnionMember;
    }

    @Test
    @Transactional
    void createUnionMemberWithExistingId() throws Exception {
        // Create the UnionMember with an existing ID
        unionMember.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restUnionMemberMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unionMember)))
            .andExpect(status().isBadRequest());

        // Validate the UnionMember in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkRoleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        unionMember.setRole(null);

        // Create the UnionMember, which fails.

        restUnionMemberMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unionMember)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllUnionMembers() throws Exception {
        // Initialize the database
        insertedUnionMember = unionMemberRepository.saveAndFlush(unionMember);

        // Get all the unionMemberList
        restUnionMemberMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(unionMember.getId().intValue())))
            .andExpect(jsonPath("$.[*].role").value(hasItem(DEFAULT_ROLE)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllUnionMembersWithEagerRelationshipsIsEnabled() throws Exception {
        when(unionMemberRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restUnionMemberMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(unionMemberRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllUnionMembersWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(unionMemberRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restUnionMemberMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(unionMemberRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getUnionMember() throws Exception {
        // Initialize the database
        insertedUnionMember = unionMemberRepository.saveAndFlush(unionMember);

        // Get the unionMember
        restUnionMemberMockMvc
            .perform(get(ENTITY_API_URL_ID, unionMember.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(unionMember.getId().intValue()))
            .andExpect(jsonPath("$.role").value(DEFAULT_ROLE));
    }

    @Test
    @Transactional
    void getNonExistingUnionMember() throws Exception {
        // Get the unionMember
        restUnionMemberMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingUnionMember() throws Exception {
        // Initialize the database
        insertedUnionMember = unionMemberRepository.saveAndFlush(unionMember);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the unionMember
        UnionMember updatedUnionMember = unionMemberRepository.findById(unionMember.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedUnionMember are not directly saved in db
        em.detach(updatedUnionMember);
        updatedUnionMember.role(UPDATED_ROLE);

        restUnionMemberMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedUnionMember.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedUnionMember))
            )
            .andExpect(status().isOk());

        // Validate the UnionMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedUnionMemberToMatchAllProperties(updatedUnionMember);
    }

    @Test
    @Transactional
    void putNonExistingUnionMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionMember.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUnionMemberMockMvc
            .perform(
                put(ENTITY_API_URL_ID, unionMember.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(unionMember))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnionMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchUnionMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionMember.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnionMemberMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(unionMember))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnionMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamUnionMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionMember.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnionMemberMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unionMember)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the UnionMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateUnionMemberWithPatch() throws Exception {
        // Initialize the database
        insertedUnionMember = unionMemberRepository.saveAndFlush(unionMember);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the unionMember using partial update
        UnionMember partialUpdatedUnionMember = new UnionMember();
        partialUpdatedUnionMember.setId(unionMember.getId());

        restUnionMemberMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUnionMember.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUnionMember))
            )
            .andExpect(status().isOk());

        // Validate the UnionMember in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUnionMemberUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedUnionMember, unionMember),
            getPersistedUnionMember(unionMember)
        );
    }

    @Test
    @Transactional
    void fullUpdateUnionMemberWithPatch() throws Exception {
        // Initialize the database
        insertedUnionMember = unionMemberRepository.saveAndFlush(unionMember);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the unionMember using partial update
        UnionMember partialUpdatedUnionMember = new UnionMember();
        partialUpdatedUnionMember.setId(unionMember.getId());

        partialUpdatedUnionMember.role(UPDATED_ROLE);

        restUnionMemberMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUnionMember.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUnionMember))
            )
            .andExpect(status().isOk());

        // Validate the UnionMember in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUnionMemberUpdatableFieldsEquals(partialUpdatedUnionMember, getPersistedUnionMember(partialUpdatedUnionMember));
    }

    @Test
    @Transactional
    void patchNonExistingUnionMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionMember.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUnionMemberMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, unionMember.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(unionMember))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnionMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchUnionMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionMember.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnionMemberMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(unionMember))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnionMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamUnionMember() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionMember.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnionMemberMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(unionMember))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the UnionMember in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteUnionMember() throws Exception {
        // Initialize the database
        insertedUnionMember = unionMemberRepository.saveAndFlush(unionMember);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the unionMember
        restUnionMemberMockMvc
            .perform(delete(ENTITY_API_URL_ID, unionMember.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return unionMemberRepository.count();
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

    protected UnionMember getPersistedUnionMember(UnionMember unionMember) {
        return unionMemberRepository.findById(unionMember.getId()).orElseThrow();
    }

    protected void assertPersistedUnionMemberToMatchAllProperties(UnionMember expectedUnionMember) {
        assertUnionMemberAllPropertiesEquals(expectedUnionMember, getPersistedUnionMember(expectedUnionMember));
    }

    protected void assertPersistedUnionMemberToMatchUpdatableProperties(UnionMember expectedUnionMember) {
        assertUnionMemberAllUpdatablePropertiesEquals(expectedUnionMember, getPersistedUnionMember(expectedUnionMember));
    }
}
