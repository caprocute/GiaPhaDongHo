package vn.giapha.media;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.io.InputStream;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import vn.giapha.IntegrationTest;
import vn.giapha.media.internal.ImgproxyUrlBuilder;
import vn.giapha.media.internal.MinioStorageService;
import vn.giapha.service.MediaPhotoService;
import vn.giapha.service.dto.MediaPhotoDTO;

/**
 * Kiểm tra authz của POST /api/v1/media/upload (R1.4).
 * Yêu cầu Docker để Testcontainers spin up PostgreSQL.
 * Chạy trên CI hoặc local khi Docker đang chạy:
 *   ./gradlew integrationTest --tests "vn.giapha.media.MediaUploadControllerIT"
 *
 * Ma trận:
 *  - Anonymous       → 401
 *  - ROLE_USER       → 403
 *  - ROLE_EDITOR     → 200
 *  - ROLE_ADMIN      → 200
 *  - ROLE_ADMIN + non-image → 400
 */
@IntegrationTest
@AutoConfigureMockMvc
class MediaUploadControllerIT {

    private static final String UPLOAD_URL = "/api/v1/media/upload";

    @Autowired
    MockMvc mockMvc;

    @MockitoBean
    MinioStorageService storageService;

    @MockitoBean
    ImgproxyUrlBuilder imgproxyUrlBuilder;

    @MockitoBean
    MediaPhotoService mediaPhotoService;

    private MockMultipartFile sampleImage() {
        return new MockMultipartFile("file", "photo.jpg", "image/jpeg", new byte[] { (byte) 0xFF, (byte) 0xD8, (byte) 0xFF });
    }

    private void stubServices() {
        doNothing().when(storageService).upload(anyString(), any(InputStream.class), anyLong(), anyString());
        when(storageService.presignedGetUrl(anyString())).thenReturn("http://minio/presigned");
        when(imgproxyUrlBuilder.thumbnail(anyString())).thenReturn("http://imgproxy/thumb");
        MediaPhotoDTO dto = new MediaPhotoDTO();
        dto.setId(1L);
        dto.setObjectKey("uncategorized/test.jpg");
        when(mediaPhotoService.save(any())).thenReturn(dto);
    }

    @Test
    void uploadAnonymous_returns401() throws Exception {
        mockMvc.perform(multipart(UPLOAD_URL).file(sampleImage()).with(csrf())).andExpect(status().isUnauthorized());
    }

    @Test
    @WithMockUser(roles = "USER")
    void uploadAsUser_returns403() throws Exception {
        mockMvc.perform(multipart(UPLOAD_URL).file(sampleImage()).with(csrf())).andExpect(status().isForbidden());
    }

    @Test
    @WithMockUser(roles = "EDITOR")
    void uploadAsEditor_returns200() throws Exception {
        stubServices();
        mockMvc
            .perform(multipart(UPLOAD_URL).file(sampleImage()).with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.objectKey").isNotEmpty())
            .andExpect(jsonPath("$.presignedGetUrl").value("http://minio/presigned"))
            .andExpect(jsonPath("$.imgproxyUrl").value("http://imgproxy/thumb"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void uploadAsAdmin_returns200() throws Exception {
        stubServices();
        mockMvc
            .perform(multipart(UPLOAD_URL).file(sampleImage()).with(csrf()))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.photoId").value(1));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void uploadNonImage_returns400() throws Exception {
        MockMultipartFile pdf = new MockMultipartFile("file", "doc.pdf", "application/pdf", new byte[] { 1, 2, 3 });
        mockMvc.perform(multipart(UPLOAD_URL).file(pdf).with(csrf())).andExpect(status().isBadRequest());
    }
}
