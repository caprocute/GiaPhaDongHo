package vn.giapha.iam.internal;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import vn.giapha.iam.api.PermissionService;
import vn.giapha.iam.api.UserProfile;
import vn.giapha.security.SecurityUtils;

@Service
public class CurrentUserService {

    private final PermissionService permissionService;

    public CurrentUserService(PermissionService permissionService) {
        this.permissionService = permissionService;
    }

    public Optional<UserProfile> currentProfile() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !SecurityUtils.isAuthenticated()) {
            return Optional.empty();
        }
        List<String> roles = auth
            .getAuthorities()
            .stream()
            .map(GrantedAuthority::getAuthority)
            .filter(a -> a != null && a.startsWith("ROLE_"))
            .distinct()
            .sorted()
            .collect(Collectors.toList());

        // JWT resource-server: authority extract qua SecurityUtils; bổ sung roles từ claim nếu rỗng
        if (roles.isEmpty() && auth instanceof JwtAuthenticationToken jwtAuth) {
            roles = SecurityUtils.extractAuthorityFromClaims(jwtAuth.getToken().getClaims())
                .stream()
                .map(GrantedAuthority::getAuthority)
                .sorted()
                .collect(Collectors.toList());
        }

        Set<String> permissions = permissionService.resolvePermissions(roles);
        String username = SecurityUtils.getCurrentUserLogin().orElse("unknown");
        String keycloakId = null;
        String email = null;
        String displayName = username;

        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            Jwt jwt = jwtAuth.getToken();
            keycloakId = jwt.getSubject();
            email = jwt.getClaimAsString("email");
            String name = jwt.getClaimAsString("name");
            if (name != null && !name.isBlank()) {
                displayName = name;
            } else {
                String given = jwt.getClaimAsString("given_name");
                String family = jwt.getClaimAsString("family_name");
                if (given != null || family != null) {
                    displayName = ((given == null ? "" : given) + " " + (family == null ? "" : family)).trim();
                }
            }
            if (username.equals("unknown")) {
                String preferred = jwt.getClaimAsString("preferred_username");
                if (preferred != null) {
                    username = preferred;
                }
            }
        }

        return Optional.of(new UserProfile(keycloakId, username, email, displayName, roles, permissions));
    }

    public boolean currentUserHasPermission(String permission) {
        return currentProfile().map(p -> permissionService.hasPermission(p.roles(), permission)).orElse(false);
    }
}
