package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.MediaPhotoAsserts.*;
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
import vn.giapha.domain.MediaPhoto;
import vn.giapha.repository.MediaPhotoRepository;
import vn.giapha.service.MediaPhotoService;
import vn.giapha.service.dto.MediaPhotoDTO;
import vn.giapha.service.mapper.MediaPhotoMapper;

/**
 * Integration tests for the {@link MediaPhotoResource} REST controller.
 */
@IntegrationTest
@ExtendWith(MockitoExtension.class)
@AutoConfigureMockMvc
@WithMockUser
class MediaPhotoResourceIT {

    private static final String DEFAULT_OBJECT_KEY = "AAAAAAAAAA";
    private static final String UPDATED_OBJECT_KEY = "BBBBBBBBBB";

    private static final String DEFAULT_CAPTION = "AAAAAAAAAA";
    private static final String UPDATED_CAPTION = "BBBBBBBBBB";

    private static final String DEFAULT_BLURHASH = "AAAAAAAAAA";
    private static final String UPDATED_BLURHASH = "BBBBBBBBBB";

    private static final Long DEFAULT_VIEW_COUNT = 1L;
    private static final Long UPDATED_VIEW_COUNT = 2L;

    private static final String ENTITY_API_URL = "/api/media-photos";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private MediaPhotoRepository mediaPhotoRepository;

    @Mock
    private MediaPhotoRepository mediaPhotoRepositoryMock;

    @Autowired
    private MediaPhotoMapper mediaPhotoMapper;

    @Mock
    private MediaPhotoService mediaPhotoServiceMock;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restMediaPhotoMockMvc;

    private MediaPhoto mediaPhoto;

    private MediaPhoto insertedMediaPhoto;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MediaPhoto createEntity() {
        return new MediaPhoto()
            .objectKey(DEFAULT_OBJECT_KEY)
            .caption(DEFAULT_CAPTION)
            .blurhash(DEFAULT_BLURHASH)
            .viewCount(DEFAULT_VIEW_COUNT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static MediaPhoto createUpdatedEntity() {
        return new MediaPhoto()
            .objectKey(UPDATED_OBJECT_KEY)
            .caption(UPDATED_CAPTION)
            .blurhash(UPDATED_BLURHASH)
            .viewCount(UPDATED_VIEW_COUNT);
    }

    @BeforeEach
    void initTest() {
        mediaPhoto = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedMediaPhoto != null) {
            mediaPhotoRepository.delete(insertedMediaPhoto);
            insertedMediaPhoto = null;
        }
    }

    @Test
    @Transactional
    void createMediaPhoto() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the MediaPhoto
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(mediaPhoto);
        var returnedMediaPhotoDTO = om.readValue(
            restMediaPhotoMockMvc
                .perform(
                    post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mediaPhotoDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            MediaPhotoDTO.class
        );

        // Validate the MediaPhoto in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedMediaPhoto = mediaPhotoMapper.toEntity(returnedMediaPhotoDTO);
        assertMediaPhotoUpdatableFieldsEquals(returnedMediaPhoto, getPersistedMediaPhoto(returnedMediaPhoto));

        insertedMediaPhoto = returnedMediaPhoto;
    }

    @Test
    @Transactional
    void createMediaPhotoWithExistingId() throws Exception {
        // Create the MediaPhoto with an existing ID
        mediaPhoto.setId(1L);
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(mediaPhoto);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restMediaPhotoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mediaPhotoDTO)))
            .andExpect(status().isBadRequest());

        // Validate the MediaPhoto in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkObjectKeyIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        mediaPhoto.setObjectKey(null);

        // Create the MediaPhoto, which fails.
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(mediaPhoto);

        restMediaPhotoMockMvc
            .perform(post(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mediaPhotoDTO)))
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllMediaPhotos() throws Exception {
        // Initialize the database
        insertedMediaPhoto = mediaPhotoRepository.saveAndFlush(mediaPhoto);

        // Get all the mediaPhotoList
        restMediaPhotoMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(mediaPhoto.getId().intValue())))
            .andExpect(jsonPath("$.[*].objectKey").value(hasItem(DEFAULT_OBJECT_KEY)))
            .andExpect(jsonPath("$.[*].caption").value(hasItem(DEFAULT_CAPTION)))
            .andExpect(jsonPath("$.[*].blurhash").value(hasItem(DEFAULT_BLURHASH)))
            .andExpect(jsonPath("$.[*].viewCount").value(hasItem(DEFAULT_VIEW_COUNT.intValue())));
    }

    @SuppressWarnings({ "unchecked" })
    void getAllMediaPhotosWithEagerRelationshipsIsEnabled() throws Exception {
        when(mediaPhotoServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restMediaPhotoMockMvc.perform(get(ENTITY_API_URL + "?eagerload=true")).andExpect(status().isOk());

        verify(mediaPhotoServiceMock, times(1)).findAllWithEagerRelationships(any());
    }

    @SuppressWarnings({ "unchecked" })
    void getAllMediaPhotosWithEagerRelationshipsIsNotEnabled() throws Exception {
        when(mediaPhotoServiceMock.findAllWithEagerRelationships(any())).thenReturn(new PageImpl(new ArrayList<>()));

        restMediaPhotoMockMvc.perform(get(ENTITY_API_URL + "?eagerload=false")).andExpect(status().isOk());
        verify(mediaPhotoRepositoryMock, times(1)).findAll(any(Pageable.class));
    }

    @Test
    @Transactional
    void getMediaPhoto() throws Exception {
        // Initialize the database
        insertedMediaPhoto = mediaPhotoRepository.saveAndFlush(mediaPhoto);

        // Get the mediaPhoto
        restMediaPhotoMockMvc
            .perform(get(ENTITY_API_URL_ID, mediaPhoto.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(mediaPhoto.getId().intValue()))
            .andExpect(jsonPath("$.objectKey").value(DEFAULT_OBJECT_KEY))
            .andExpect(jsonPath("$.caption").value(DEFAULT_CAPTION))
            .andExpect(jsonPath("$.blurhash").value(DEFAULT_BLURHASH))
            .andExpect(jsonPath("$.viewCount").value(DEFAULT_VIEW_COUNT.intValue()));
    }

    @Test
    @Transactional
    void getNonExistingMediaPhoto() throws Exception {
        // Get the mediaPhoto
        restMediaPhotoMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingMediaPhoto() throws Exception {
        // Initialize the database
        insertedMediaPhoto = mediaPhotoRepository.saveAndFlush(mediaPhoto);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mediaPhoto
        MediaPhoto updatedMediaPhoto = mediaPhotoRepository.findById(mediaPhoto.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedMediaPhoto are not directly saved in db
        em.detach(updatedMediaPhoto);
        updatedMediaPhoto.objectKey(UPDATED_OBJECT_KEY).caption(UPDATED_CAPTION).blurhash(UPDATED_BLURHASH).viewCount(UPDATED_VIEW_COUNT);
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(updatedMediaPhoto);

        restMediaPhotoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, mediaPhotoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mediaPhotoDTO))
            )
            .andExpect(status().isOk());

        // Validate the MediaPhoto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedMediaPhotoToMatchAllProperties(updatedMediaPhoto);
    }

    @Test
    @Transactional
    void putNonExistingMediaPhoto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaPhoto.setId(longCount.incrementAndGet());

        // Create the MediaPhoto
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(mediaPhoto);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMediaPhotoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, mediaPhotoDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mediaPhotoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MediaPhoto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchMediaPhoto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaPhoto.setId(longCount.incrementAndGet());

        // Create the MediaPhoto
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(mediaPhoto);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMediaPhotoMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(mediaPhotoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MediaPhoto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamMediaPhoto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaPhoto.setId(longCount.incrementAndGet());

        // Create the MediaPhoto
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(mediaPhoto);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMediaPhotoMockMvc
            .perform(put(ENTITY_API_URL).with(csrf()).contentType(MediaType.APPLICATION_JSON).content(om.writeValueAsBytes(mediaPhotoDTO)))
            .andExpect(status().isMethodNotAllowed());

        // Validate the MediaPhoto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateMediaPhotoWithPatch() throws Exception {
        // Initialize the database
        insertedMediaPhoto = mediaPhotoRepository.saveAndFlush(mediaPhoto);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mediaPhoto using partial update
        MediaPhoto partialUpdatedMediaPhoto = new MediaPhoto();
        partialUpdatedMediaPhoto.setId(mediaPhoto.getId());

        partialUpdatedMediaPhoto.objectKey(UPDATED_OBJECT_KEY);

        restMediaPhotoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMediaPhoto.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMediaPhoto))
            )
            .andExpect(status().isOk());

        // Validate the MediaPhoto in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMediaPhotoUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedMediaPhoto, mediaPhoto),
            getPersistedMediaPhoto(mediaPhoto)
        );
    }

    @Test
    @Transactional
    void fullUpdateMediaPhotoWithPatch() throws Exception {
        // Initialize the database
        insertedMediaPhoto = mediaPhotoRepository.saveAndFlush(mediaPhoto);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the mediaPhoto using partial update
        MediaPhoto partialUpdatedMediaPhoto = new MediaPhoto();
        partialUpdatedMediaPhoto.setId(mediaPhoto.getId());

        partialUpdatedMediaPhoto
            .objectKey(UPDATED_OBJECT_KEY)
            .caption(UPDATED_CAPTION)
            .blurhash(UPDATED_BLURHASH)
            .viewCount(UPDATED_VIEW_COUNT);

        restMediaPhotoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedMediaPhoto.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedMediaPhoto))
            )
            .andExpect(status().isOk());

        // Validate the MediaPhoto in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertMediaPhotoUpdatableFieldsEquals(partialUpdatedMediaPhoto, getPersistedMediaPhoto(partialUpdatedMediaPhoto));
    }

    @Test
    @Transactional
    void patchNonExistingMediaPhoto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaPhoto.setId(longCount.incrementAndGet());

        // Create the MediaPhoto
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(mediaPhoto);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restMediaPhotoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, mediaPhotoDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mediaPhotoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MediaPhoto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchMediaPhoto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaPhoto.setId(longCount.incrementAndGet());

        // Create the MediaPhoto
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(mediaPhoto);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMediaPhotoMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(mediaPhotoDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the MediaPhoto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamMediaPhoto() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        mediaPhoto.setId(longCount.incrementAndGet());

        // Create the MediaPhoto
        MediaPhotoDTO mediaPhotoDTO = mediaPhotoMapper.toDto(mediaPhoto);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restMediaPhotoMockMvc
            .perform(
                patch(ENTITY_API_URL).with(csrf()).contentType("application/merge-patch+json").content(om.writeValueAsBytes(mediaPhotoDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the MediaPhoto in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteMediaPhoto() throws Exception {
        // Initialize the database
        insertedMediaPhoto = mediaPhotoRepository.saveAndFlush(mediaPhoto);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the mediaPhoto
        restMediaPhotoMockMvc
            .perform(delete(ENTITY_API_URL_ID, mediaPhoto.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return mediaPhotoRepository.count();
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

    protected MediaPhoto getPersistedMediaPhoto(MediaPhoto mediaPhoto) {
        return mediaPhotoRepository.findById(mediaPhoto.getId()).orElseThrow();
    }

    protected void assertPersistedMediaPhotoToMatchAllProperties(MediaPhoto expectedMediaPhoto) {
        assertMediaPhotoAllPropertiesEquals(expectedMediaPhoto, getPersistedMediaPhoto(expectedMediaPhoto));
    }

    protected void assertPersistedMediaPhotoToMatchUpdatableProperties(MediaPhoto expectedMediaPhoto) {
        assertMediaPhotoAllUpdatablePropertiesEquals(expectedMediaPhoto, getPersistedMediaPhoto(expectedMediaPhoto));
    }
}
