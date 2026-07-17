package vn.giapha.media.internal.web;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import vn.giapha.domain.MediaAlbum;
import vn.giapha.domain.MediaPhoto;
import vn.giapha.media.internal.ImgproxyUrlBuilder;
import vn.giapha.media.internal.MinioStorageService;
import vn.giapha.repository.MediaAlbumRepository;
import vn.giapha.repository.MediaPhotoRepository;
import vn.giapha.web.util.PagedResponses;

/**
 * Album/ảnh công khai cho portal — GET không cần đăng nhập.
 */
@RestController
@RequestMapping("/api/v1/media/gallery")
public class PublicMediaResource {

    private final MediaAlbumRepository albumRepository;
    private final MediaPhotoRepository photoRepository;
    private final MinioStorageService storageService;
    private final ImgproxyUrlBuilder imgproxyUrlBuilder;

    public PublicMediaResource(
        MediaAlbumRepository albumRepository,
        MediaPhotoRepository photoRepository,
        MinioStorageService storageService,
        ImgproxyUrlBuilder imgproxyUrlBuilder
    ) {
        this.albumRepository = albumRepository;
        this.photoRepository = photoRepository;
        this.storageService = storageService;
        this.imgproxyUrlBuilder = imgproxyUrlBuilder;
    }

    @GetMapping("/albums")
    public ResponseEntity<List<Map<String, Object>>> albums(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        List<Map<String, Object>> rows = albumRepository
            .findAll()
            .stream()
            .map(this::toAlbum)
            .toList();
        return PagedResponses.ok(rows, pageable);
    }

    @GetMapping("/albums/{id}/photos")
    public ResponseEntity<List<Map<String, Object>>> photos(
        @PathVariable Long id,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        List<Map<String, Object>> rows = photoRepository
            .findAll()
            .stream()
            .filter(p -> p.getAlbum() != null && id.equals(p.getAlbum().getId()))
            .map(this::toPhoto)
            .toList();
        return PagedResponses.ok(rows, pageable);
    }

    @GetMapping("/photos")
    public ResponseEntity<List<Map<String, Object>>> allPhotos(
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        List<Map<String, Object>> rows = photoRepository.findAll().stream().map(this::toPhoto).toList();
        return PagedResponses.ok(rows, pageable);
    }

    private Map<String, Object> toAlbum(MediaAlbum a) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", a.getId());
        m.put("title", a.getTitle());
        m.put("description", a.getDescription());
        return m;
    }

    private Map<String, Object> toPhoto(MediaPhoto p) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", p.getId());
        m.put("caption", p.getCaption());
        m.put("objectKey", p.getObjectKey());
        m.put("albumId", p.getAlbum() != null ? p.getAlbum().getId() : null);
        String key = p.getObjectKey();
        if (key != null && !key.isBlank()) {
            try {
                m.put("url", storageService.presignedGetUrl(key));
            } catch (Exception e) {
                m.put("url", null);
            }
            try {
                m.put("thumbUrl", imgproxyUrlBuilder.thumbnail(key));
            } catch (Exception e) {
                m.put("thumbUrl", m.get("url"));
            }
        }
        return m;
    }
}
