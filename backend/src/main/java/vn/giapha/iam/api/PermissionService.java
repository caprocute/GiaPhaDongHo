package vn.giapha.iam.api;

import java.util.Collection;
import java.util.Set;

/**
 * Resolve quyền từ realm role Keycloak (TK-10 AuthZ).
 */
public interface PermissionService {
    /** Tập permission {@code module:entity:action} từ các role hiện tại. */
    Set<String> resolvePermissions(Collection<String> roles);

    /** {@code true} nếu role/permission đủ cho yêu cầu. */
    boolean hasPermission(Collection<String> roles, String requiredPermission);
}
