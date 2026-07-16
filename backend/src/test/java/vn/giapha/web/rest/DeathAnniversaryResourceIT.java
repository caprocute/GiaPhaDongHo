package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.DeathAnniversaryAsserts.*;
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
import vn.giapha.domain.DeathAnniversary;
import vn.giapha.repository.DeathAnniversaryRepository;
import vn.giapha.service.DeathAnniversaryService;
import vn.giapha.service.dto.DeathAnniversaryDTO;
import vn.giapha.service.mapper.DeathAnniversaryMapper;

/**
 * Integration tests for the {@link DeathAnniversaryResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class DeathAnniversaryResourceIT {

    private static final Integer DEFAULT_LUNAR_DAY = 1;
    private static final Integer UPDATED_LUNAR_DAY = 2;

    private static final Integer DEFAULT_LUNAR_MONTH = 1;
    private static final Integer UPDATED_LUNAR_MONTH = 2;

    private static final Boolean DEFAULT_LEAP_MONTH = false;
    private static final Boolean UPDATED_LEAP_MONTH = true;

    private static final String DEFAULT_CAN_CHI = "AAAAAAAAAA";
    private static final String UPDATED_CAN_CHI = "BBBBBBBBBB";

    private static final String DEFAULT_NOTE = "AAAAAAAAAA";
    private static final String UPDATED_NOTE = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/death-anniversaries";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private DeathAnniversaryRepository deathAnniversaryRepository;

    @Mock
    private DeathAnniversaryRepository deathAnniversaryRepositoryMock;

    @Autowired
    private DeathAnniversaryMapper deathAnniversaryMapper;

    @Mock
    private DeathAnniversaryService deathAnniversaryServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restDeathAnniversaryMockMvc;

    private DeathAnniversary deathAnniversary;

    private DeathAnniversary insertedDeathAnniversary;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DeathAnniversary createEntity() {
        return new DeathAnniversary()
            .lunarDay(DEFAULT_LUNAR_DAY)
            .lunarMonth(DEFAULT_LUNAR_MONTH)
            .leapMonth(DEFAULT_LEAP_MONTH)
            .canChi(DEFAULT_CAN_CHI)
            .note(DEFAULT_NOTE);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static DeathAnniversary createUpdatedEntity() {
        return new DeathAnniversary()
            .lunarDay(UPDATED_LUNAR_DAY)
            .lunarMonth(UPDATED_LUNAR_MONTH)
            .leapMonth(UPDATED_LEAP_MONTH)
            .canChi(UPDATED_CAN_CHI)
            .note(UPDATED_NOTE);
    }

    @BeforeEach
    void initTest() {
        deathAnniversary = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedDeathAnniversary != null) {
            deathAnniversaryRepository.delete(insertedDeathAnniversary);
            insertedDeathAnniversary = null;
        }
    }

    @Test
    @Transactional
    void createDeathAnniversary() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the DeathAnniversary
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);
        var returnedDeathAnniversaryDTO = om.readValue(
            restDeathAnniversaryMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(deathAnniversaryDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            DeathAnniversaryDTO.class
        );

        // Validate the DeathAnniversary in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedDeathAnniversary = deathAnniversaryMapper.toEntity(returnedDeathAnniversaryDTO);
        assertDeathAnniversaryUpdatableFieldsEquals(returnedDeathAnniversary, getPersistedDeathAnniversary(returnedDeathAnniversary));

        insertedDeathAnniversary = returnedDeathAnniversary;
    }

    @Test
    @Transactional
    void createDeathAnniversaryWithExistingId() throws Exception {
        // Create the DeathAnniversary with an existing ID
        deathAnniversary.setId(1L);
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restDeathAnniversaryMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeathAnniversary in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkLunarDayIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        deathAnniversary.setLunarDay(null);

        // Create the DeathAnniversary, which fails.
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);

        restDeathAnniversaryMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void checkLunarMonthIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        deathAnniversary.setLunarMonth(null);

        // Create the DeathAnniversary, which fails.
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);

        restDeathAnniversaryMockMvc
            .perform(
                post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllDeathAnniversaries() throws Exception {
        // Initialize the database
        insertedDeathAnniversary = deathAnniversaryRepository.saveAndFlush(deathAnniversary);

        // Get all the deathAnniversaryList
        restDeathAnniversaryMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(deathAnniversary.getId().intValue())))
            .andExpect(jsonPath("$.[*].lunarDay").value(hasItem(DEFAULT_LUNAR_DAY)))
            .andExpect(jsonPath("$.[*].lunarMonth").value(hasItem(DEFAULT_LUNAR_MONTH)))
            .andExpect(jsonPath("$.[*].leapMonth").value(hasItem(DEFAULT_LEAP_MONTH)))
            .andExpect(jsonPath("$.[*].canChi").value(hasItem(DEFAULT_CAN_CHI)))
            .andExpect(jsonPath("$.[*].note").value(hasItem(DEFAULT_NOTE)));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDeathAnniversariesWithEagerRelationshipsIsEnabled() throws Exception {
        when(deathAnniversaryServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDeathAnniversaryMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(deathAnniversaryServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllDeathAnniversariesWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(deathAnniversaryServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restDeathAnniversaryMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(deathAnniversaryRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getDeathAnniversary() throws Exception {
        // Initialize the database
        insertedDeathAnniversary = deathAnniversaryRepository.saveAndFlush(deathAnniversary);

        // Get the deathAnniversary
        restDeathAnniversaryMockMvc
            .perform(get(ENTITY_API_URL_ID, deathAnniversary.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(deathAnniversary.getId().intValue()))
            .andExpect(jsonPath("$.lunarDay").value(DEFAULT_LUNAR_DAY))
            .andExpect(jsonPath("$.lunarMonth").value(DEFAULT_LUNAR_MONTH))
            .andExpect(jsonPath("$.leapMonth").value(DEFAULT_LEAP_MONTH))
            .andExpect(jsonPath("$.canChi").value(DEFAULT_CAN_CHI))
            .andExpect(jsonPath("$.note").value(DEFAULT_NOTE));
    }

    @Test
    @Transactional
    void getNonExistingDeathAnniversary() throws Exception {
        // Get the deathAnniversary
        restDeathAnniversaryMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingDeathAnniversary() throws Exception {
        // Initialize the database
        insertedDeathAnniversary = deathAnniversaryRepository.saveAndFlush(deathAnniversary);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the deathAnniversary
        DeathAnniversary updatedDeathAnniversary = deathAnniversaryRepository.findById(deathAnniversary.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedDeathAnniversary are not directly saved in db
        em.detach(updatedDeathAnniversary);
        updatedDeathAnniversary
            .lunarDay(UPDATED_LUNAR_DAY)
            .lunarMonth(UPDATED_LUNAR_MONTH)
            .leapMonth(UPDATED_LEAP_MONTH)
            .canChi(UPDATED_CAN_CHI)
            .note(UPDATED_NOTE);
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(updatedDeathAnniversary);

        restDeathAnniversaryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, deathAnniversaryDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isOk());

        // Validate the DeathAnniversary in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedDeathAnniversaryToMatchAllProperties(updatedDeathAnniversary);
    }

    @Test
    @Transactional
    void putNonExistingDeathAnniversary() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deathAnniversary.setId(longCount.incrementAndGet());

        // Create the DeathAnniversary
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDeathAnniversaryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, deathAnniversaryDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeathAnniversary in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchDeathAnniversary() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deathAnniversary.setId(longCount.incrementAndGet());

        // Create the DeathAnniversary
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeathAnniversaryMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeathAnniversary in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamDeathAnniversary() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deathAnniversary.setId(longCount.incrementAndGet());

        // Create the DeathAnniversary
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeathAnniversaryMockMvc
            .perform(
                put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DeathAnniversary in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateDeathAnniversaryWithPatch() throws Exception {
        // Initialize the database
        insertedDeathAnniversary = deathAnniversaryRepository.saveAndFlush(deathAnniversary);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the deathAnniversary using partial update
        DeathAnniversary partialUpdatedDeathAnniversary = new DeathAnniversary();
        partialUpdatedDeathAnniversary.setId(deathAnniversary.getId());

        partialUpdatedDeathAnniversary.lunarDay(UPDATED_LUNAR_DAY).note(UPDATED_NOTE);

        restDeathAnniversaryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDeathAnniversary.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDeathAnniversary))
            )
            .andExpect(status().isOk());

        // Validate the DeathAnniversary in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDeathAnniversaryUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedDeathAnniversary, deathAnniversary),
            getPersistedDeathAnniversary(deathAnniversary)
        );
    }

    @Test
    @Transactional
    void fullUpdateDeathAnniversaryWithPatch() throws Exception {
        // Initialize the database
        insertedDeathAnniversary = deathAnniversaryRepository.saveAndFlush(deathAnniversary);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the deathAnniversary using partial update
        DeathAnniversary partialUpdatedDeathAnniversary = new DeathAnniversary();
        partialUpdatedDeathAnniversary.setId(deathAnniversary.getId());

        partialUpdatedDeathAnniversary
            .lunarDay(UPDATED_LUNAR_DAY)
            .lunarMonth(UPDATED_LUNAR_MONTH)
            .leapMonth(UPDATED_LEAP_MONTH)
            .canChi(UPDATED_CAN_CHI)
            .note(UPDATED_NOTE);

        restDeathAnniversaryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedDeathAnniversary.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedDeathAnniversary))
            )
            .andExpect(status().isOk());

        // Validate the DeathAnniversary in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertDeathAnniversaryUpdatableFieldsEquals(
            partialUpdatedDeathAnniversary,
            getPersistedDeathAnniversary(partialUpdatedDeathAnniversary)
        );
    }

    @Test
    @Transactional
    void patchNonExistingDeathAnniversary() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deathAnniversary.setId(longCount.incrementAndGet());

        // Create the DeathAnniversary
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restDeathAnniversaryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, deathAnniversaryDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeathAnniversary in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchDeathAnniversary() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deathAnniversary.setId(longCount.incrementAndGet());

        // Create the DeathAnniversary
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeathAnniversaryMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the DeathAnniversary in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamDeathAnniversary() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        deathAnniversary.setId(longCount.incrementAndGet());

        // Create the DeathAnniversary
        DeathAnniversaryDTO deathAnniversaryDTO = deathAnniversaryMapper.toDto(deathAnniversary);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restDeathAnniversaryMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(deathAnniversaryDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the DeathAnniversary in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteDeathAnniversary() throws Exception {
        // Initialize the database
        insertedDeathAnniversary = deathAnniversaryRepository.saveAndFlush(deathAnniversary);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the deathAnniversary
        restDeathAnniversaryMockMvc
            .perform(delete(ENTITY_API_URL_ID, deathAnniversary.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return deathAnniversaryRepository.count();
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

    protected DeathAnniversary getPersistedDeathAnniversary(DeathAnniversary deathAnniversary) {
        return deathAnniversaryRepository.findById(deathAnniversary.getId()).orElseThrow();
    }

    protected void assertPersistedDeathAnniversaryToMatchAllProperties(DeathAnniversary expectedDeathAnniversary) {
        assertDeathAnniversaryAllPropertiesEquals(expectedDeathAnniversary, getPersistedDeathAnniversary(expectedDeathAnniversary));
    }

    protected void assertPersistedDeathAnniversaryToMatchUpdatableProperties(DeathAnniversary expectedDeathAnniversary) {
        assertDeathAnniversaryAllUpdatablePropertiesEquals(
            expectedDeathAnniversary,
            getPersistedDeathAnniversary(expectedDeathAnniversary)
        );
    }
}
