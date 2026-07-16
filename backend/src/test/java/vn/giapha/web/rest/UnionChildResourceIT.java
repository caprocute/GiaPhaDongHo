package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.UnionChildAsserts.*;
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
import vn.giapha.domain.UnionChild;
import vn.giapha.repository.UnionChildRepository;

/**
 * Integration tests for the {@link UnionChildResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class UnionChildResourceIT {

    private static final Integer DEFAULT_ORDER_NO = 1;
    private static final Integer UPDATED_ORDER_NO = 2;

    private static final String ENTITY_API_URL = "/api/union-children";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private UnionChildRepository unionChildRepository;

    @Mock
    private UnionChildRepository unionChildRepositoryMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restUnionChildMockMvc;

    private UnionChild unionChild;

    private UnionChild insertedUnionChild;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UnionChild createEntity() {
        return new UnionChild().orderNo(DEFAULT_ORDER_NO);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static UnionChild createUpdatedEntity() {
        return new UnionChild().orderNo(UPDATED_ORDER_NO);
    }

    @BeforeEach
    void initTest() {
        unionChild = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedUnionChild != null) {
            unionChildRepository.delete(insertedUnionChild);
            insertedUnionChild = null;
        }
    }

    @Test
    @Transactional
    void createUnionChild() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the UnionChild
        var returnedUnionChild = om.readValue(
            restUnionChildMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unionChild))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            UnionChild.class
        );

        // Validate the UnionChild in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        assertUnionChildUpdatableFieldsEquals(returnedUnionChild, getPersistedUnionChild(returnedUnionChild));

        insertedUnionChild = returnedUnionChild;
    }

    @Test
    @Transactional
    void createUnionChildWithExistingId() throws Exception {
        // Create the UnionChild with an existing ID
        unionChild.setId(1L);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restUnionChildMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unionChild)))
            .andExpect(status().isBadRequest());

        // Validate the UnionChild in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void getAllUnionChildren() throws Exception {
        // Initialize the database
        insertedUnionChild = unionChildRepository.saveAndFlush(unionChild);

        // Get all the unionChildList
        restUnionChildMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(unionChild.getId().intValue())))
            .andExpect(jsonPath("$.[*].orderNo").value(hasItem(DEFAULT_ORDER_NO)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllUnionChildrenWithEagerRelationshipsIsEnabled() throws Exception {
        when(unionChildRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restUnionChildMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(unionChildRepositoryMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllUnionChildrenWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(unionChildRepositoryMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restUnionChildMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(unionChildRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getUnionChild() throws Exception {
        // Initialize the database
        insertedUnionChild = unionChildRepository.saveAndFlush(unionChild);

        // Get the unionChild
        restUnionChildMockMvc
            .perform(get(ENTITY_API_URL_ID, unionChild.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(unionChild.getId().intValue()))
            .andExpect(jsonPath("$.orderNo").value(DEFAULT_ORDER_NO));
    }

    @Test
    @Transactional
    void getNonExistingUnionChild() throws Exception {
        // Get the unionChild
        restUnionChildMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingUnionChild() throws Exception {
        // Initialize the database
        insertedUnionChild = unionChildRepository.saveAndFlush(unionChild);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the unionChild
        UnionChild updatedUnionChild = unionChildRepository.findById(unionChild.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedUnionChild are not directly saved in db
        em.detach(updatedUnionChild);
        updatedUnionChild.orderNo(UPDATED_ORDER_NO);

        restUnionChildMockMvc
            .perform(
                put(ENTITY_API_URL_ID, updatedUnionChild.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(updatedUnionChild))
            )
            .andExpect(status().isOk());

        // Validate the UnionChild in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedUnionChildToMatchAllProperties(updatedUnionChild);
    }

    @Test
    @Transactional
    void putNonExistingUnionChild() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionChild.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUnionChildMockMvc
            .perform(
                put(ENTITY_API_URL_ID, unionChild.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(unionChild))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnionChild in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchUnionChild() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionChild.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnionChildMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(unionChild))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnionChild in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamUnionChild() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionChild.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnionChildMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(unionChild)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the UnionChild in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateUnionChildWithPatch() throws Exception {
        // Initialize the database
        insertedUnionChild = unionChildRepository.saveAndFlush(unionChild);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the unionChild using partial update
        UnionChild partialUpdatedUnionChild = new UnionChild();
        partialUpdatedUnionChild.setId(unionChild.getId());

        restUnionChildMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUnionChild.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUnionChild))
            )
            .andExpect(status().isOk());

        // Validate the UnionChild in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUnionChildUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedUnionChild, unionChild),
            getPersistedUnionChild(unionChild)
        );
    }

    @Test
    @Transactional
    void fullUpdateUnionChildWithPatch() throws Exception {
        // Initialize the database
        insertedUnionChild = unionChildRepository.saveAndFlush(unionChild);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the unionChild using partial update
        UnionChild partialUpdatedUnionChild = new UnionChild();
        partialUpdatedUnionChild.setId(unionChild.getId());

        partialUpdatedUnionChild.orderNo(UPDATED_ORDER_NO);

        restUnionChildMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedUnionChild.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedUnionChild))
            )
            .andExpect(status().isOk());

        // Validate the UnionChild in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertUnionChildUpdatableFieldsEquals(partialUpdatedUnionChild, getPersistedUnionChild(partialUpdatedUnionChild));
    }

    @Test
    @Transactional
    void patchNonExistingUnionChild() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionChild.setId(longCount.incrementAndGet());

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restUnionChildMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, unionChild.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(unionChild))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnionChild in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchUnionChild() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionChild.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnionChildMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(unionChild))
            )
            .andExpect(status().isBadRequest());

        // Validate the UnionChild in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamUnionChild() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        unionChild.setId(longCount.incrementAndGet());

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restUnionChildMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(unionChild))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the UnionChild in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteUnionChild() throws Exception {
        // Initialize the database
        insertedUnionChild = unionChildRepository.saveAndFlush(unionChild);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the unionChild
        restUnionChildMockMvc
            .perform(delete(ENTITY_API_URL_ID, unionChild.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return unionChildRepository.count();
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

    protected UnionChild getPersistedUnionChild(UnionChild unionChild) {
        return unionChildRepository.findById(unionChild.getId()).orElseThrow();
    }

    protected void assertPersistedUnionChildToMatchAllProperties(UnionChild expectedUnionChild) {
        assertUnionChildAllPropertiesEquals(expectedUnionChild, getPersistedUnionChild(expectedUnionChild));
    }

    protected void assertPersistedUnionChildToMatchUpdatableProperties(UnionChild expectedUnionChild) {
        assertUnionChildAllUpdatablePropertiesEquals(expectedUnionChild, getPersistedUnionChild(expectedUnionChild));
    }
}
