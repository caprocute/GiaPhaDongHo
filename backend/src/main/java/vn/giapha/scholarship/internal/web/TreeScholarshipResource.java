package vn.giapha.scholarship.internal.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.scholarship.api.ScholarshipAwardRoundRequest;
import vn.giapha.scholarship.api.ScholarshipReviewRequest;
import vn.giapha.scholarship.internal.ScholarshipService;
import vn.giapha.service.dto.ScholarshipEntryDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;
import vn.giapha.web.util.PagedResponses;

@RestController
@RequestMapping("/api/v1/trees/{slug}")
public class TreeScholarshipResource {

    private final ScholarshipService scholarshipService;

    public TreeScholarshipResource(ScholarshipService scholarshipService) {
        this.scholarshipService = scholarshipService;
    }

    @GetMapping("/scholarship-board")
    public ResponseEntity<List<ScholarshipEntryDTO>> board(
        @PathVariable String slug,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        return PagedResponses.ok(scholarshipService.honorBoard(slug), pageable);
    }

    @GetMapping("/scholarship-entries/admin")
    @RequiresPermission("scholarship:entry:read")
    public ResponseEntity<List<ScholarshipEntryDTO>> admin(
        @PathVariable String slug,
        @RequestParam(required = false) String status,
        @RequestParam(required = false) String level,
        @RequestParam(required = false) Integer year,
        @RequestParam(required = false) String q,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        return PagedResponses.ok(scholarshipService.listAdmin(slug, status, level, year, q), pageable);
    }

    @GetMapping("/scholarship-entries/stats")
    @RequiresPermission("scholarship:entry:read")
    public Map<String, Object> stats(@PathVariable String slug) {
        return scholarshipService.stats(slug);
    }

    /** Thành viên cổng thông tin đề cử. */
    @PostMapping("/scholarship-entries")
    @RequiresPermission("scholarship:entry:nominate")
    public ScholarshipEntryDTO nominate(@PathVariable String slug, @Valid @RequestBody ScholarshipEntryDTO body) {
        try {
            return scholarshipService.nominate(slug, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }

    /** Quản trị tạo hồ sơ (có thể công bố bảng vàng ngay). */
    @PostMapping("/scholarship-entries/admin")
    @RequiresPermission("scholarship:entry:review")
    public ScholarshipEntryDTO createAdmin(
        @PathVariable String slug,
        @Valid @RequestBody ScholarshipEntryDTO body,
        @RequestParam(defaultValue = "false") boolean publishNow
    ) {
        try {
            body.setId(null);
            return scholarshipService.upsertAdmin(slug, body, publishNow);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }

    /** Quản trị sửa hồ sơ. */
    @PutMapping("/scholarship-entries/admin/{id}")
    @RequiresPermission("scholarship:entry:review")
    public ScholarshipEntryDTO updateAdmin(
        @PathVariable String slug,
        @PathVariable Long id,
        @Valid @RequestBody ScholarshipEntryDTO body,
        @RequestParam(defaultValue = "false") boolean publishNow
    ) {
        try {
            body.setId(id);
            return scholarshipService.upsertAdmin(slug, body, publishNow);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }

    @DeleteMapping("/scholarship-entries/admin/{id}")
    @RequiresPermission("scholarship:entry:review")
    public ResponseEntity<Void> deleteAdmin(@PathVariable String slug, @PathVariable Long id) {
        try {
            scholarshipService.deleteAdmin(slug, id);
            return ResponseEntity.noContent().build();
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }

    @PostMapping("/scholarship-entries/{id}/approve")
    @RequiresPermission("scholarship:entry:review")
    public ScholarshipEntryDTO approve(
        @PathVariable String slug,
        @PathVariable Long id,
        @RequestBody(required = false) ScholarshipReviewRequest body
    ) {
        try {
            return scholarshipService.review(slug, id, true, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }

    @PostMapping("/scholarship-entries/{id}/reject")
    @RequiresPermission("scholarship:entry:review")
    public ScholarshipEntryDTO reject(
        @PathVariable String slug,
        @PathVariable Long id,
        @RequestBody(required = false) ScholarshipReviewRequest body
    ) {
        try {
            return scholarshipService.review(slug, id, false, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }

    /**
     * Trao học bổng đợt: chỉ hồ sơ đã vào bảng vàng, ghi số tiền từ quỹ khuyến học.
     */
    @PostMapping("/scholarship-entries/award-round")
    @RequiresPermission("scholarship:entry:review")
    public Map<String, Object> awardRound(@PathVariable String slug, @RequestBody ScholarshipAwardRoundRequest body) {
        try {
            return scholarshipService.awardRound(slug, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }
}
