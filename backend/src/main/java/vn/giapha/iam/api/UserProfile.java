package vn.giapha.iam.api;

import java.util.List;
import java.util.Set;

/** Hồ sơ người dùng từ JWT Keycloak + permission đã expand. */
public record UserProfile(
    String keycloakId,
    String username,
    String email,
    String displayName,
    List<String> roles,
    Set<String> permissions
) {}
