package vn.giapha.iam.internal;

import java.util.Collection;
import java.util.Collections;
import java.util.HashSet;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Component;
import vn.giapha.iam.api.PermissionService;
import vn.giapha.iam.api.RealmRoles;

/**
 * Ma trận role → permission (R1.5). ROLE_ADMIN = toàn quyền.
 */
@Component
public class RolePermissionCatalog implements PermissionService {

    private static final String WILDCARD_ALL = "*";

    private static final Map<String, Set<String>> ROLE_PERMISSIONS = Map.of(
        RealmRoles.ADMIN,
        Set.of(WILDCARD_ALL),
        RealmRoles.GENEALOGY_ADMIN,
        Set.of(
            "genealogy:person:read",
            "genealogy:person:write",
            "genealogy:union:write",
            "cms:post:read",
            "moderation:request:read",
            "moderation:request:review",
            "moderation:request:write"
        ),
        RealmRoles.EDITOR,
        Set.of(
            "cms:post:read",
            "cms:post:write",
            "media:asset:read",
            "media:asset:write",
            "genealogy:person:read",
            "moderation:request:read",
            "moderation:request:review"
        ),
        RealmRoles.MEMBER,
        Set.of(
            "cms:post:read",
            "genealogy:person:read",
            "moderation:request:write",
            "moderation:request:read"
        ),
        RealmRoles.USER,
        Set.of("cms:post:read", "genealogy:person:read", "moderation:request:write")
    );

    @Override
    public Set<String> resolvePermissions(Collection<String> roles) {
        if (roles == null || roles.isEmpty()) {
            return Set.of();
        }
        Set<String> out = new HashSet<>();
        for (String role : roles) {
            Set<String> mapped = ROLE_PERMISSIONS.get(normalize(role));
            if (mapped != null) {
                out.addAll(mapped);
            }
        }
        return Collections.unmodifiableSet(out);
    }

    @Override
    public boolean hasPermission(Collection<String> roles, String requiredPermission) {
        if (requiredPermission == null || requiredPermission.isBlank()) {
            return false;
        }
        Set<String> granted = resolvePermissions(roles);
        if (granted.contains(WILDCARD_ALL)) {
            return true;
        }
        if (granted.contains(requiredPermission)) {
            return true;
        }
        // hỗ trợ wildcard dạng module:*
        String[] parts = requiredPermission.split(":");
        if (parts.length >= 1 && granted.contains(parts[0] + ":*")) {
            return true;
        }
        if (parts.length >= 2 && granted.contains(parts[0] + ":" + parts[1] + ":*")) {
            return true;
        }
        return false;
    }

    private static String normalize(String role) {
        if (role == null) {
            return "";
        }
        String r = role.trim();
        // chấp nhận claim không tiền tố ROLE_
        if (!r.startsWith("ROLE_") && !r.equals(WILDCARD_ALL)) {
            String upper = r.toUpperCase(Locale.ROOT);
            return switch (upper) {
                case "ADMIN" -> RealmRoles.ADMIN;
                case "USER" -> RealmRoles.USER;
                case "MEMBER" -> RealmRoles.MEMBER;
                case "EDITOR" -> RealmRoles.EDITOR;
                case "GENEALOGY_ADMIN" -> RealmRoles.GENEALOGY_ADMIN;
                default -> "ROLE_" + upper;
            };
        }
        return r;
    }
}
