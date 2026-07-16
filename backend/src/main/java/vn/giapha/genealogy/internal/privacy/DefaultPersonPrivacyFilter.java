package vn.giapha.genealogy.internal.privacy;

import org.springframework.stereotype.Service;
import vn.giapha.genealogy.api.PersonPrivacyFilter;
import vn.giapha.genealogy.api.PersonPrivacyModel;
import vn.giapha.genealogy.api.ViewerContext;
import vn.giapha.genealogy.api.ViewerRole;

/**
 * Người đã khuất: mặc định public. Người còn sống: khách chỉ tên/đời (ẩn ngày sinh, ghi chú, tọa độ mộ…).
 * Cờ {@code privacy}: {@code public} | {@code members} | {@code private}.
 */
@Service
public class DefaultPersonPrivacyFilter implements PersonPrivacyFilter {

    @Override
    public PersonPrivacyModel apply(PersonPrivacyModel source, ViewerContext viewer) {
        if (source == null) {
            return null;
        }
        ViewerRole role = viewer == null ? ViewerRole.GUEST : viewer.role();
        if (role == ViewerRole.EDITOR) {
            return source;
        }

        String privacy = normalize(source.privacy());
        if ("private".equals(privacy) && role != ViewerRole.EDITOR) {
            return source.withRedactedPii();
        }

        if (isDeceased(source.lifeStatus())) {
            return source;
        }

        // Người còn sống
        if ("public".equals(privacy)) {
            return source;
        }
        if (role == ViewerRole.MEMBER) {
            return source;
        }
        // GUEST + (members|null): ẩn PII
        return source.withRedactedPii();
    }

    private static boolean isDeceased(String lifeStatus) {
        if (lifeStatus == null) {
            return false;
        }
        String s = lifeStatus.trim().toLowerCase();
        return "deceased".equals(s) || "dead".equals(s) || "mat".equals(s) || "đã mất".equals(s);
    }

    private static String normalize(String privacy) {
        return privacy == null ? "members" : privacy.trim().toLowerCase();
    }
}
