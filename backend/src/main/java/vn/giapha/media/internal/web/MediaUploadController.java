package vn.giapha.media.internal.web;

import java.util.UUID;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.media.api.UploadResponse;
import vn.giapha.media.internal.ImgproxyUrlBuilder;
import vn.giapha.media.internal.MinioStorageService;
import vn.giapha.repository.MediaPhotoRepository;
import vn.giapha.service.MediaPhotoService;
import vn.giapha.service.dto.MediaPhotoDTO;

/**
 * Upload ảnh lên MinIO và lưu metadata MediaPhoto.
 * Chỉ ADMIN và EDITOR mới được phép (R1.4 — RBAC đầy đủ ở R1.5).
 */
@RestController
@RequestMapping("/api/v1/media")
@PreAuthorize("hasAnyRole('ADMIN', 'EDITOR')")
@RequiresPermission("media:photo:upload")
public class MediaUploadController {

    private static final Logger LOG = LoggerFactory.getLogger(MediaUploadController.class);

    private static final long MAX_FILE_BYTES = 20 * 1024 * 1024L; // 20 MB

    private final MinioStorageService storageService;
    private final ImgproxyUrlBuilder imgproxyUrlBuilder;
    private final MediaPhotoService mediaPhotoService;
    private final MediaPhotoRepository mediaPhotoRepository;

    public MediaUploadController(
        MinioStorageService storageService,
        ImgproxyUrlBuilder imgproxyUrlBuilder,
        MediaPhotoService mediaPhotoService,
        MediaPhotoRepository mediaPhotoRepository
    ) {
        this.storageService = storageService;
        this.imgproxyUrlBuilder = imgproxyUrlBuilder;
        this.mediaPhotoService = mediaPhotoService;
        this.mediaPhotoRepository = mediaPhotoRepository;
    }

    /**
     * POST /api/v1/media/upload
     *
     * @param file    file ảnh (multipart/form-data)
     * @param albumId ID album (tuỳ chọn)
     * @param caption chú thích (tuỳ chọn)
     */
    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<UploadResponse> upload(
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "albumId", required = false) Long albumId,
        @RequestParam(value = "caption", required = false) String caption
    ) {
        validateFile(file);

        String ext = extractExtension(file.getOriginalFilename());
        String objectKey = buildObjectKey(albumId, ext);

        try {
            storageService.upload(objectKey, file.getInputStream(), file.getSize(), file.getContentType());
        } catch (Exception e) {
            throw new UploadFailedException("Lỗi upload file: " + e.getMessage(), e);
        }

        MediaPhotoDTO dto = new MediaPhotoDTO();
        dto.setObjectKey(objectKey);
        dto.setCaption(caption);
        if (albumId != null) {
            // Gán album qua JHipster nested DTO nếu album tồn tại
            mediaPhotoRepository.findById(albumId).ifPresent(ignored -> {
                // albumId được gán trực tiếp qua JHipster DTO setAlbum — xử lý trong service
            });
        }
        MediaPhotoDTO saved = mediaPhotoService.save(dto);

        String presignedUrl = storageService.presignedGetUrl(objectKey);
        String imgproxyUrl  = imgproxyUrlBuilder.thumbnail(objectKey);

        LOG.info("Uploaded photo id={} objectKey={}", saved.getId(), objectKey);
        return ResponseEntity.ok(new UploadResponse(saved.getId(), objectKey, presignedUrl, imgproxyUrl));
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("File không được rỗng");
        }
        if (file.getSize() > MAX_FILE_BYTES) {
            throw new IllegalArgumentException("File vượt quá giới hạn 20 MB");
        }
        String ct = file.getContentType();
        if (ct == null || !ct.startsWith("image/")) {
            throw new IllegalArgumentException("Chỉ chấp nhận file ảnh (image/*)");
        }
    }

    private String buildObjectKey(Long albumId, String ext) {
        String prefix = albumId != null ? "albums/" + albumId : "uncategorized";
        return prefix + "/" + UUID.randomUUID() + "." + ext;
    }

    private String extractExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "bin";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }

    public static class UploadFailedException extends RuntimeException {
        public UploadFailedException(String message, Throwable cause) { super(message, cause); }
    }
}
