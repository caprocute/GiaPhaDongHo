package vn.giapha.moderation.internal.web;

import jakarta.validation.Valid;
import java.net.URI;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.moderation.internal.ModerationService;
import vn.giapha.security.SecurityUtils;
import vn.giapha.service.dto.ChangeRequestDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * Tự khai theo cây — TK-08 {@code /api/v1/trees/{slug}/change-requests}.
 */
@RestController
@RequestMapping("/api/v1/trees/{slug}/change-requests")
public class TreeChangeRequestResource {

    private static final Logger LOG = LoggerFactory.getLogger(TreeChangeRequestResource.class);

    private final ModerationService moderationService;

    public TreeChangeRequestResource(ModerationService moderationService) {
        this.moderationService = moderationService;
    }

    @PostMapping("")
    @RequiresPermission("moderation:request:write")
    public ResponseEntity<ChangeRequestDTO> submit(
        @PathVariable String slug,
        @Valid @RequestBody ChangeRequestDTO body
    ) {
        LOG.debug("POST change-request tree={}", slug);
        String userId = SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Cần đăng nhập", "changeRequest", "unauthorized"));
        try {
            ChangeRequestDTO created = moderationService.submit(slug, userId, body);
            return ResponseEntity.created(new URI("/api/v1/trees/" + slug + "/change-requests/" + created.getId())).body(
                created
            );
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "changeRequest", "invalid");
        } catch (java.net.URISyntaxException e) {
            throw new BadRequestAlertException(e.getMessage(), "changeRequest", "uri");
        }
    }

    @GetMapping("")
    @RequiresPermission("moderation:request:read")
    public List<ChangeRequestDTO> list(
        @PathVariable String slug,
        @RequestParam(name = "status", required = false) String status
    ) {
        LOG.debug("GET change-requests tree={} status={}", slug, status);
        return moderationService.list(slug, status);
    }

    @PostMapping("/{id}/approve")
    @RequiresPermission("moderation:request:review")
    public ChangeRequestDTO approve(@PathVariable String slug, @PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        LOG.debug("POST approve change-request tree={} id={}", slug, id);
        try {
            String note = body != null ? body.get("reviewerNote") : null;
            return moderationService.approve(id, note);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new BadRequestAlertException(e.getMessage(), "changeRequest", "review");
        }
    }

    @PostMapping("/{id}/reject")
    @RequiresPermission("moderation:request:review")
    public ChangeRequestDTO reject(@PathVariable String slug, @PathVariable Long id, @RequestBody(required = false) Map<String, String> body) {
        LOG.debug("POST reject change-request tree={} id={}", slug, id);
        try {
            String note = body != null ? body.get("reviewerNote") : null;
            return moderationService.reject(id, note);
        } catch (IllegalArgumentException | IllegalStateException e) {
            throw new BadRequestAlertException(e.getMessage(), "changeRequest", "review");
        }
    }
}
