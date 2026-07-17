package vn.giapha.notification.internal.web;

import jakarta.validation.Valid;
import java.time.Year;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.notification.internal.NotificationService;
import vn.giapha.security.SecurityUtils;
import vn.giapha.service.dto.AnniversarySubscriptionDTO;
import vn.giapha.service.dto.NotificationOutboxDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;
import vn.giapha.web.util.PagedResponses;

/**
 * Đăng ký nhắc giỗ + iCal + outbox admin — F1 / R2.4.
 */
@RestController
@RequestMapping("/api/v1/trees/{slug}")
public class TreeNotificationResource {

    private static final Logger LOG = LoggerFactory.getLogger(TreeNotificationResource.class);
    private static final MediaType TEXT_CALENDAR = MediaType.parseMediaType("text/calendar");

    private final NotificationService notificationService;

    public TreeNotificationResource(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    @GetMapping(value = "/anniversaries.ics", produces = "text/calendar")
    public ResponseEntity<String> treeIcal(
        @PathVariable String slug,
        @RequestParam(name = "year", required = false) Integer year
    ) {
        int y = year == null ? Year.now().getValue() : year;
        String ics = notificationService.treeIcal(slug, y);
        return ResponseEntity.ok()
            .contentType(TEXT_CALENDAR)
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"gio-" + slug + "-" + y + ".ics\"")
            .body(ics);
    }

    @GetMapping(value = "/my-reminders.ics", produces = "text/calendar")
    @RequiresPermission("notify:subscription:read")
    public ResponseEntity<String> myIcal(
        @PathVariable String slug,
        @RequestParam(name = "year", required = false) Integer year
    ) {
        String userId = currentUser();
        int y = year == null ? Year.now().getValue() : year;
        try {
            String ics = notificationService.myIcal(slug, userId, y);
            return ResponseEntity.ok()
                .contentType(TEXT_CALENDAR)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"nhac-gio-" + y + ".ics\"")
                .body(ics);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "anniversarySubscription", "invalid");
        }
    }

    @GetMapping("/anniversary-subscriptions")
    @RequiresPermission("notify:subscription:read")
    public List<AnniversarySubscriptionDTO> mySubs(@PathVariable String slug) {
        return notificationService.mySubscriptions(slug, currentUser());
    }

    @PostMapping("/anniversary-subscriptions")
    @RequiresPermission("notify:subscription:write")
    public AnniversarySubscriptionDTO subscribe(
        @PathVariable String slug,
        @Valid @RequestBody AnniversarySubscriptionDTO body
    ) {
        try {
            return notificationService.subscribe(slug, currentUser(), body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "anniversarySubscription", "invalid");
        }
    }

    @DeleteMapping("/anniversary-subscriptions/{id}")
    @RequiresPermission("notify:subscription:write")
    public ResponseEntity<Void> unsubscribe(@PathVariable String slug, @PathVariable Long id) {
        try {
            notificationService.unsubscribe(slug, currentUser(), id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "anniversarySubscription", "invalid");
        }
    }

    @GetMapping("/notification-outbox")
    @RequiresPermission("notify:outbox:read")
    public ResponseEntity<List<NotificationOutboxDTO>> outbox(
        @PathVariable String slug,
        @RequestParam(name = "status", required = false) String status,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("GET outbox tree={} status={}", slug, status);
        return PagedResponses.ok(notificationService.listOutbox(status), pageable);
    }

    @PostMapping("/notification-outbox/dispatch")
    @RequiresPermission("notify:outbox:write")
    public Map<String, Integer> dispatch(@PathVariable String slug) {
        int n = notificationService.runPlannerAndDispatch();
        return Map.of("processed", n);
    }

    private static String currentUser() {
        return SecurityUtils.getCurrentUserLogin()
            .orElseThrow(() -> new BadRequestAlertException("Cần đăng nhập", "anniversarySubscription", "unauthorized"));
    }
}
