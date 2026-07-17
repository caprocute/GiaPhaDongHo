package vn.giapha.genealogy.api;

import java.util.Optional;

/**
 * Đọc cấu hình site/cây từ metaJson — dùng bởi moderation, notification, privacy.
 */
public interface TreeSettingsQuery {
    Optional<TreeSettingsDTO> findBySlug(String slug);
}
