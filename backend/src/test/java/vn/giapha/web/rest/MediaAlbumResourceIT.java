package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.MediaAlbumAsserts.*;
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
import vn.giapha.domain.MediaAlbum;
import vn.giapha.repository.MediaAlbumRepository;
import vn.giapha.service.dto.MediaAlbumDTO;
import vn.giapha.service.mapper.MediaAlbumMapper;

/**
 * Integration tests for the {@link MediaAlbumResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class MediaAlbumResourceIT {

    private static final String DEFAULT_TITLE = "AAAAAAAAAA";
    private static final String UPDATED_TITLE = "BBBBBBBBBB";

    private static final String DEFAULT_DESCRIPTION = "AAAAAAAAAA";
    private static final String UPDATED_DESCRIPTION = "BBBBBBBBBB";

    private static final String DEFAULT_COVER_OBJECT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_COVER_OBJECT_KEY = "BBBBBBBBBB";

    private static final String ENTITY_API_URL = "/api/media-albums";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private MediaAlbumRepository mediaAlbumRepository;

    @Autowired
    private MediaAlbumMapper mediaAlbumMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restMediaAlbumMockMvc;

    private MediaAlbum mediaAlbum;

    private MediaAlbum insertedMediaAlbum;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MediaAlbum createEntity() {
        return new MediaAlbum().title(DEFAULT_TITLE).description(DEFAULT_DESCRIPTION).coverObjectKey(DEFAULT_COVER_OBJECT_KEY);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MediaAlbum createUpdatedEntity() {
        return new MediaAlbum().title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).coverObjectKey(UPDATED_COVER_OBJECT_KEY);
    }

    @BeforeEach
    void initTest() {
        mediaAlbum = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedMediaAlbum != null) {
            mediaAlbumRepository.delete(insertedMediaAlbum);
            insertedMediaAlbum = null;
        }
    }

    @Test
    @Transactional
    void createMediaAlbum() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the MediaAlbum
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(mediaAlbum);
        var returnedMediaAlbumDTO = om.readValue(
            restMediaAlbumMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mediaAlbumDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            MediaAlbumDTO.class
        );

        // Validate the MediaAlbum in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedMediaAlbum = mediaAlbumMapper.toEntity(returnedMediaAlbumDTO);
        assertMediaAlbumUpdatableFieldsEquals(returnedMediaAlbum, getPersistedMediaAlbum(returnedMediaAlbum));

        insertedMediaAlbum = returnedMediaAlbum;
    }

    @Test
    @Transactional
    void createMediaAlbumWithExistingId() throws Exception {
        // Create the MediaAlbum with an existing ID
        mediaAlbum.setId(1L);
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(mediaAlbum);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restMediaAlbumMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mediaAlbumDTO)))
            .andExpect(status().isBadRequest());

        // Validate the MediaAlbum in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkTitleIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        mediaAlbum.setTitle(null);

        // Create the MediaAlbum, which fails.
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(mediaAlbum);

        restMediaAlbumMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mediaAlbumDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllMediaAlbums() throws Exception {
        // Initialize the database
        insertedMediaAlbum = mediaAlbumRepository.saveAndFlush(mediaAlbum);

        // Get all the mediaAlbumList
        restMediaAlbumMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(mediaAlbum.getId().intValue())))
            .andExpect(jsonPath("$.[*].title").value(hasItem(DEFAULT_TITLE)))
            .andExpect(jsonPath("$.[*].description").value(hasItem(DEFAULT_DESCRIPTION)))
            .andExpect(jsonPath("$.[*].coverObjectKey").value(hasItem(DEFAULT_COVER_OBJECT_KEY)));
    }

    @Test
    @Transactional
    void getMediaAlbum() throws Exception {
        // Initialize the database
        insertedMediaAlbum = mediaAlbumRepository.saveAndFlush(mediaAlbum);

        // Get the mediaAlbum
        restMediaAlbumMockMvc
            .perform(get(ENTITY_API_URL_ID, mediaAlbum.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(mediaAlbum.getId().intValue()))
            .andExpect(jsonPath("$.title").value(DEFAULT_TITLE))
            .andExpect(jsonPath("$.description").value(DEFAULT_DESCRIPTION))
            .andExpect(jsonPath("$.coverObjectKey").value(DEFAULT_COVER_OBJECT_KEY));
    }

    @Test
    @Transactional
    void getNonExistingMediaAlbum() throws Exception {
        // Get the mediaAlbum
        restMediaAlbumMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingMediaAlbum() throws Exception {
        // Initialize the database
        insertedMediaAlbum = mediaAlbumRepository.saveAndFlush(mediaAlbum);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mediaAlbum
        MediaAlbum updatedMediaAlbum = mediaAlbumRepository.findById(mediaAlbum.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedMediaAlbum are not directly saved in db
        em.detach(updatedMediaAlbum);
        updatedMediaAlbum.title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).coverObjectKey(UPDATED_COVER_OBJECT_KEY);
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(updatedMediaAlbum);

        restMediaAlbumMockMvc
            .perform(
                put(ENTITY_API_URL_ID, mediaAlbumDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mediaAlbumDTO))
            )
            .andExpect(status().isOk());

        // Validate the MediaAlbum in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedMediaAlbumToMatchAllProperties(updatedMediaAlbum);
    }

    @Test
    @Transactional
    void putNonExistingMediaAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaAlbum.setId(longCount.incrementAndGet());

        // Create the MediaAlbum
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(mediaAlbum);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMediaAlbumMockMvc
            .perform(
                put(ENTITY_API_URL_ID, mediaAlbumDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mediaAlbumDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MediaAlbum in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchMediaAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaAlbum.setId(longCount.incrementAndGet());

        // Create the MediaAlbum
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(mediaAlbum);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMediaAlbumMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mediaAlbumDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MediaAlbum in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamMediaAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaAlbum.setId(longCount.incrementAndGet());

        // Create the MediaAlbum
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(mediaAlbum);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMediaAlbumMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mediaAlbumDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the MediaAlbum in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateMediaAlbumWithPatch() throws Exception {
        // Initialize the database
        insertedMediaAlbum = mediaAlbumRepository.saveAndFlush(mediaAlbum);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mediaAlbum using partial update
        MediaAlbum partialUpdatedMediaAlbum = new MediaAlbum();
        partialUpdatedMediaAlbum.setId(mediaAlbum.getId());

        partialUpdatedMediaAlbum.description(UPDATED_DESCRIPTION).coverObjectKey(UPDATED_COVER_OBJECT_KEY);

        restMediaAlbumMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMediaAlbum.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMediaAlbum))
            )
            .andExpect(status().isOk());

        // Validate the MediaAlbum in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMediaAlbumUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedMediaAlbum, mediaAlbum),
            getPersistedMediaAlbum(mediaAlbum)
        );
    }

    @Test
    @Transactional
    void fullUpdateMediaAlbumWithPatch() throws Exception {
        // Initialize the database
        insertedMediaAlbum = mediaAlbumRepository.saveAndFlush(mediaAlbum);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mediaAlbum using partial update
        MediaAlbum partialUpdatedMediaAlbum = new MediaAlbum();
        partialUpdatedMediaAlbum.setId(mediaAlbum.getId());

        partialUpdatedMediaAlbum.title(UPDATED_TITLE).description(UPDATED_DESCRIPTION).coverObjectKey(UPDATED_COVER_OBJECT_KEY);

        restMediaAlbumMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMediaAlbum.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMediaAlbum))
            )
            .andExpect(status().isOk());

        // Validate the MediaAlbum in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMediaAlbumUpdatableFieldsEquals(partialUpdatedMediaAlbum, getPersistedMediaAlbum(partialUpdatedMediaAlbum));
    }

    @Test
    @Transactional
    void patchNonExistingMediaAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaAlbum.setId(longCount.incrementAndGet());

        // Create the MediaAlbum
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(mediaAlbum);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMediaAlbumMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, mediaAlbumDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mediaAlbumDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MediaAlbum in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchMediaAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaAlbum.setId(longCount.incrementAndGet());

        // Create the MediaAlbum
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(mediaAlbum);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMediaAlbumMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mediaAlbumDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MediaAlbum in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamMediaAlbum() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaAlbum.setId(longCount.incrementAndGet());

        // Create the MediaAlbum
        MediaAlbumDTO mediaAlbumDTO = mediaAlbumMapper.toDto(mediaAlbum);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMediaAlbumMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(mediaAlbumDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the MediaAlbum in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteMediaAlbum() throws Exception {
        // Initialize the database
        insertedMediaAlbum = mediaAlbumRepository.saveAndFlush(mediaAlbum);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the mediaAlbum
        restMediaAlbumMockMvc
            .perform(delete(ENTITY_API_URL_ID, mediaAlbum.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return mediaAlbumRepository.count();
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

    protected MediaAlbum getPersistedMediaAlbum(MediaAlbum mediaAlbum) {
        return mediaAlbumRepository.findById(mediaAlbum.getId()).orElseThrow();
    }

    protected void assertPersistedMediaAlbumToMatchAllProperties(MediaAlbum expectedMediaAlbum) {
        assertMediaAlbumAllPropertiesEquals(expectedMediaAlbum, getPersistedMediaAlbum(expectedMediaAlbum));
    }

    protected void assertPersistedMediaAlbumToMatchUpdatableProperties(MediaAlbum expectedMediaAlbum) {
        assertMediaAlbumAllUpdatablePropertiesEquals(expectedMediaAlbum, getPersistedMediaAlbum(expectedMediaAlbum));
    }
}
