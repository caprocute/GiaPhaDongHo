package vn.giapha.scholarship.internal.web;

import jakarta.validation.Valid;
import java.util.List;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import vn.giapha.core.security.RequiresPermission;
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
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        return PagedResponses.ok(scholarshipService.listAdmin(slug, status), pageable);
    }

    @PostMapping("/scholarship-entries")
    @RequiresPermission("scholarship:entry:write")
    public ScholarshipEntryDTO nominate(@PathVariable String slug, @Valid @RequestBody ScholarshipEntryDTO body) {
        try {
            return scholarshipService.nominate(slug, body);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }

    @PostMapping("/scholarship-entries/{id}/approve")
    @RequiresPermission("scholarship:entry:write")
    public ScholarshipEntryDTO approve(@PathVariable String slug, @PathVariable Long id) {
        try {
            return scholarshipService.review(slug, id, true);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }

    @PostMapping("/scholarship-entries/{id}/reject")
    @RequiresPermission("scholarship:entry:write")
    public ScholarshipEntryDTO reject(@PathVariable String slug, @PathVariable Long id) {
        try {
            return scholarshipService.review(slug, id, false);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "scholarshipEntry", "invalid");
        }
    }
}
