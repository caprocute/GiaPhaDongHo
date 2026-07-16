package vn.giapha.iam.internal.web;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import tech.jhipster.web.util.ResponseUtil;
import vn.giapha.iam.api.UserProfile;
import vn.giapha.iam.internal.CurrentUserService;

/**
 * Profile bridge Keycloak — {@code GET /api/v1/me}.
 */
@RestController
@RequestMapping("/api/v1")
public class ProfileResource {

    private final CurrentUserService currentUserService;

    public ProfileResource(CurrentUserService currentUserService) {
        this.currentUserService = currentUserService;
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfile> me() {
        return ResponseUtil.wrapOrNotFound(currentUserService.currentProfile());
    }
}
