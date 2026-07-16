package vn.giapha.web.rest;

import static org.assertj.core.api.Assertions.assertThat;
import static org.hamcrest.Matchers.hasItem;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static vn.giapha.domain.NotificationOutboxAsserts.*;
import static vn.giapha.web.rest.TestUtil.createUpdateProxyForBean;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import java.time.Instant;
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
import vn.giapha.domain.NotificationOutbox;
import vn.giapha.repository.NotificationOutboxRepository;
import vn.giapha.service.dto.NotificationOutboxDTO;
import vn.giapha.service.mapper.NotificationOutboxMapper;

/**
 * Integration tests for the {@link NotificationOutboxResource} REST controller.
 */
@IntegrationTest
@AutoConfigureMockMvc
@WithMockUser
class NotificationOutboxResourceIT {

    private static final String DEFAULT_CHANNEL = "AAAAAAAAAA";
    private static final String UPDATED_CHANNEL = "BBBBBBBBBB";

    private static final String DEFAULT_PAYLOAD_JSON = "AAAAAAAAAA";
    private static final String UPDATED_PAYLOAD_JSON = "BBBBBBBBBB";

    private static final String DEFAULT_STATUS = "AAAAAAAAAA";
    private static final String UPDATED_STATUS = "BBBBBBBBBB";

    private static final Instant DEFAULT_CREATED_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_CREATED_AT = Instant.ofEpochMilli(1703756156789L);

    private static final Instant DEFAULT_SENT_AT = Instant.ofEpochMilli(0L);
    private static final Instant UPDATED_SENT_AT = Instant.ofEpochMilli(1703756156789L);

    private static final String ENTITY_API_URL = "/api/notification-outboxes";
    private static final String ENTITY_API_URL_ID = ENTITY_API_URL + "/{id}";

    private static final Random random = new Random();
    private static final AtomicLong longCount = new AtomicLong(random.nextInt() + 2L * Integer.MAX_VALUE);

    @Autowired
    private ObjectMapper om;

    @Autowired
    private NotificationOutboxRepository notificationOutboxRepository;

    @Autowired
    private NotificationOutboxMapper notificationOutboxMapper;

    @Autowired
    private EntityManager em;

    @Autowired
    private MockMvc restNotificationOutboxMockMvc;

    private NotificationOutbox notificationOutbox;

    private NotificationOutbox insertedNotificationOutbox;

    /**
     * Create an entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static NotificationOutbox createEntity() {
        return new NotificationOutbox()
            .channel(DEFAULT_CHANNEL)
            .payloadJson(DEFAULT_PAYLOAD_JSON)
            .status(DEFAULT_STATUS)
            .createdAt(DEFAULT_CREATED_AT)
            .sentAt(DEFAULT_SENT_AT);
    }

    /**
     * Create an updated entity for this test.
     *
     * This is a static method, as tests for other entities might also need it,
     * if they test an entity which requires the current entity.
     */
    public static NotificationOutbox createUpdatedEntity() {
        return new NotificationOutbox()
            .channel(UPDATED_CHANNEL)
            .payloadJson(UPDATED_PAYLOAD_JSON)
            .status(UPDATED_STATUS)
            .createdAt(UPDATED_CREATED_AT)
            .sentAt(UPDATED_SENT_AT);
    }

    @BeforeEach
    void initTest() {
        notificationOutbox = createEntity();
    }

    @AfterEach
    void cleanup() {
        if (insertedNotificationOutbox != null) {
            notificationOutboxRepository.delete(insertedNotificationOutbox);
            insertedNotificationOutbox = null;
        }
    }

    @Test
    @Transactional
    void createNotificationOutbox() throws Exception {
        long databaseSizeBeforeCreate = getRepositoryCount();
        // Create the NotificationOutbox
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(notificationOutbox);
        var returnedNotificationOutboxDTO = om.readValue(
            restNotificationOutboxMockMvc
                .perform(
                    post(ENTITY_API_URL)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(om.writeValueAsBytes(notificationOutboxDTO))
                )
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString(),
            NotificationOutboxDTO.class
        );

        // Validate the NotificationOutbox in the database
        assertIncrementedRepositoryCount(databaseSizeBeforeCreate);
        var returnedNotificationOutbox = notificationOutboxMapper.toEntity(returnedNotificationOutboxDTO);
        assertNotificationOutboxUpdatableFieldsEquals(
            returnedNotificationOutbox,
            getPersistedNotificationOutbox(returnedNotificationOutbox)
        );

        insertedNotificationOutbox = returnedNotificationOutbox;
    }

    @Test
    @Transactional
    void createNotificationOutboxWithExistingId() throws Exception {
        // Create the NotificationOutbox with an existing ID
        notificationOutbox.setId(1L);
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(notificationOutbox);

        long databaseSizeBeforeCreate = getRepositoryCount();

        // An entity with an existing ID cannot be created, so this API call must fail
        restNotificationOutboxMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(notificationOutboxDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NotificationOutbox in the database
        assertSameRepositoryCount(databaseSizeBeforeCreate);
    }

    @Test
    @Transactional
    void checkChannelIsRequired() throws Exception {
        long databaseSizeBeforeTest = getRepositoryCount();
        // set the field null
        notificationOutbox.setChannel(null);

        // Create the NotificationOutbox, which fails.
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(notificationOutbox);

        restNotificationOutboxMockMvc
            .perform(
                post(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(notificationOutboxDTO))
            )
            .andExpect(status().isBadRequest());

        assertSameRepositoryCount(databaseSizeBeforeTest);
    }

    @Test
    @Transactional
    void getAllNotificationOutboxes() throws Exception {
        // Initialize the database
        insertedNotificationOutbox = notificationOutboxRepository.saveAndFlush(notificationOutbox);

        // Get all the notificationOutboxList
        restNotificationOutboxMockMvc
            .perform(get(ENTITY_API_URL + "?sort=id,desc"))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.[*].id").value(hasItem(notificationOutbox.getId().intValue())))
            .andExpect(jsonPath("$.[*].channel").value(hasItem(DEFAULT_CHANNEL)))
            .andExpect(jsonPath("$.[*].payloadJson").value(hasItem(DEFAULT_PAYLOAD_JSON)))
            .andExpect(jsonPath("$.[*].status").value(hasItem(DEFAULT_STATUS)))
            .andExpect(jsonPath("$.[*].createdAt").value(hasItem(DEFAULT_CREATED_AT.toString())))
            .andExpect(jsonPath("$.[*].sentAt").value(hasItem(DEFAULT_SENT_AT.toString())));
    }

    @Test
    @Transactional
    void getNotificationOutbox() throws Exception {
        // Initialize the database
        insertedNotificationOutbox = notificationOutboxRepository.saveAndFlush(notificationOutbox);

        // Get the notificationOutbox
        restNotificationOutboxMockMvc
            .perform(get(ENTITY_API_URL_ID, notificationOutbox.getId()))
            .andExpect(status().isOk())
            .andExpect(content().contentType(MediaType.APPLICATION_JSON_VALUE))
            .andExpect(jsonPath("$.id").value(notificationOutbox.getId().intValue()))
            .andExpect(jsonPath("$.channel").value(DEFAULT_CHANNEL))
            .andExpect(jsonPath("$.payloadJson").value(DEFAULT_PAYLOAD_JSON))
            .andExpect(jsonPath("$.status").value(DEFAULT_STATUS))
            .andExpect(jsonPath("$.createdAt").value(DEFAULT_CREATED_AT.toString()))
            .andExpect(jsonPath("$.sentAt").value(DEFAULT_SENT_AT.toString()));
    }

    @Test
    @Transactional
    void getNonExistingNotificationOutbox() throws Exception {
        // Get the notificationOutbox
        restNotificationOutboxMockMvc.perform(get(ENTITY_API_URL_ID, Long.MAX_VALUE)).andExpect(status().isNotFound());
    }

    @Test
    @Transactional
    void putExistingNotificationOutbox() throws Exception {
        // Initialize the database
        insertedNotificationOutbox = notificationOutboxRepository.saveAndFlush(notificationOutbox);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the notificationOutbox
        NotificationOutbox updatedNotificationOutbox = notificationOutboxRepository.findById(notificationOutbox.getId()).orElseThrow();
        // Disconnect from session so that the updates on updatedNotificationOutbox are not directly saved in db
        em.detach(updatedNotificationOutbox);
        updatedNotificationOutbox
            .channel(UPDATED_CHANNEL)
            .payloadJson(UPDATED_PAYLOAD_JSON)
            .status(UPDATED_STATUS)
            .createdAt(UPDATED_CREATED_AT)
            .sentAt(UPDATED_SENT_AT);
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(updatedNotificationOutbox);

        restNotificationOutboxMockMvc
            .perform(
                put(ENTITY_API_URL_ID, notificationOutboxDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(notificationOutboxDTO))
            )
            .andExpect(status().isOk());

        // Validate the NotificationOutbox in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertPersistedNotificationOutboxToMatchAllProperties(updatedNotificationOutbox);
    }

    @Test
    @Transactional
    void putNonExistingNotificationOutbox() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notificationOutbox.setId(longCount.incrementAndGet());

        // Create the NotificationOutbox
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(notificationOutbox);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNotificationOutboxMockMvc
            .perform(
                put(ENTITY_API_URL_ID, notificationOutboxDTO.getId())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(notificationOutboxDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NotificationOutbox in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithIdMismatchNotificationOutbox() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notificationOutbox.setId(longCount.incrementAndGet());

        // Create the NotificationOutbox
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(notificationOutbox);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotificationOutboxMockMvc
            .perform(
                put(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(notificationOutboxDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NotificationOutbox in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void putWithMissingIdPathParamNotificationOutbox() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notificationOutbox.setId(longCount.incrementAndGet());

        // Create the NotificationOutbox
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(notificationOutbox);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotificationOutboxMockMvc
            .perform(
                put(ENTITY_API_URL)
                    .with(csrf())
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(om.writeValueAsBytes(notificationOutboxDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the NotificationOutbox in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void partialUpdateNotificationOutboxWithPatch() throws Exception {
        // Initialize the database
        insertedNotificationOutbox = notificationOutboxRepository.saveAndFlush(notificationOutbox);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the notificationOutbox using partial update
        NotificationOutbox partialUpdatedNotificationOutbox = new NotificationOutbox();
        partialUpdatedNotificationOutbox.setId(notificationOutbox.getId());

        partialUpdatedNotificationOutbox
            .channel(UPDATED_CHANNEL)
            .payloadJson(UPDATED_PAYLOAD_JSON)
            .status(UPDATED_STATUS)
            .createdAt(UPDATED_CREATED_AT)
            .sentAt(UPDATED_SENT_AT);

        restNotificationOutboxMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNotificationOutbox.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedNotificationOutbox))
            )
            .andExpect(status().isOk());

        // Validate the NotificationOutbox in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertNotificationOutboxUpdatableFieldsEquals(
            createUpdateProxyForBean(partialUpdatedNotificationOutbox, notificationOutbox),
            getPersistedNotificationOutbox(notificationOutbox)
        );
    }

    @Test
    @Transactional
    void fullUpdateNotificationOutboxWithPatch() throws Exception {
        // Initialize the database
        insertedNotificationOutbox = notificationOutboxRepository.saveAndFlush(notificationOutbox);

        long databaseSizeBeforeUpdate = getRepositoryCount();

        // Update the notificationOutbox using partial update
        NotificationOutbox partialUpdatedNotificationOutbox = new NotificationOutbox();
        partialUpdatedNotificationOutbox.setId(notificationOutbox.getId());

        partialUpdatedNotificationOutbox
            .channel(UPDATED_CHANNEL)
            .payloadJson(UPDATED_PAYLOAD_JSON)
            .status(UPDATED_STATUS)
            .createdAt(UPDATED_CREATED_AT)
            .sentAt(UPDATED_SENT_AT);

        restNotificationOutboxMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, partialUpdatedNotificationOutbox.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(partialUpdatedNotificationOutbox))
            )
            .andExpect(status().isOk());

        // Validate the NotificationOutbox in the database

        assertSameRepositoryCount(databaseSizeBeforeUpdate);
        assertNotificationOutboxUpdatableFieldsEquals(
            partialUpdatedNotificationOutbox,
            getPersistedNotificationOutbox(partialUpdatedNotificationOutbox)
        );
    }

    @Test
    @Transactional
    void patchNonExistingNotificationOutbox() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notificationOutbox.setId(longCount.incrementAndGet());

        // Create the NotificationOutbox
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(notificationOutbox);

        // If the entity doesn't have an ID, it will throw BadRequestAlertException
        restNotificationOutboxMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, notificationOutboxDTO.getId())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(notificationOutboxDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NotificationOutbox in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithIdMismatchNotificationOutbox() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notificationOutbox.setId(longCount.incrementAndGet());

        // Create the NotificationOutbox
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(notificationOutbox);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotificationOutboxMockMvc
            .perform(
                patch(ENTITY_API_URL_ID, longCount.incrementAndGet())
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(notificationOutboxDTO))
            )
            .andExpect(status().isBadRequest());

        // Validate the NotificationOutbox in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void patchWithMissingIdPathParamNotificationOutbox() throws Exception {
        long databaseSizeBeforeUpdate = getRepositoryCount();
        notificationOutbox.setId(longCount.incrementAndGet());

        // Create the NotificationOutbox
        NotificationOutboxDTO notificationOutboxDTO = notificationOutboxMapper.toDto(notificationOutbox);

        // If url ID doesn't match entity ID, it will throw BadRequestAlertException
        restNotificationOutboxMockMvc
            .perform(
                patch(ENTITY_API_URL)
                    .with(csrf())
                    .contentType("application/merge-patch+json")
                    .content(om.writeValueAsBytes(notificationOutboxDTO))
            )
            .andExpect(status().isMethodNotAllowed());

        // Validate the NotificationOutbox in the database
        assertSameRepositoryCount(databaseSizeBeforeUpdate);
    }

    @Test
    @Transactional
    void deleteNotificationOutbox() throws Exception {
        // Initialize the database
        insertedNotificationOutbox = notificationOutboxRepository.saveAndFlush(notificationOutbox);

        long databaseSizeBeforeDelete = getRepositoryCount();

        // Delete the notificationOutbox
        restNotificationOutboxMockMvc
            .perform(delete(ENTITY_API_URL_ID, notificationOutbox.getId()).with(csrf()).accept(MediaType.APPLICATION_JSON))
            .andExpect(status().isNoContent());

        // Validate the database contains one less item
        assertDecrementedRepositoryCount(databaseSizeBeforeDelete);
    }

    protected long getRepositoryCount() {
        return notificationOutboxRepository.count();
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

    protected NotificationOutbox getPersistedNotificationOutbox(NotificationOutbox notificationOutbox) {
        return notificationOutboxRepository.findById(notificationOutbox.getId()).orElseThrow();
    }

    protected void assertPersistedNotificationOutboxToMatchAllProperties(NotificationOutbox expectedNotificationOutbox) {
        assertNotificationOutboxAllPropertiesEquals(expectedNotificationOutbox, getPersistedNotificationOutbox(expectedNotificationOutbox));
    }

    protected void assertPersistedNotificationOutboxToMatchUpdatableProperties(NotificationOutbox expectedNotificationOutbox) {
        assertNotificationOutboxAllUpdatablePropertiesEquals(
            expectedNotificationOutbox,
            getPersistedNotificationOutbox(expectedNotificationOutbox)
        );
    }
}
