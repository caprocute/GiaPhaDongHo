package vn.giapha.scholarship.internal.web;

import jakarta.validation.Valid;
import java.util.List;
import java.util.Map;
import org.springframework.web.bind.annotation.*;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.scholarship.internal.ScholarshipService;
import vn.giapha.service.dto.ScholarshipEntryDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/v1/trees/{slug}")
public class TreeScholarshipResource {

    private final ScholarshipService scholarshipService;

    public TreeScholarshipResource(ScholarshipService scholarshipService) {
        this.scholarshipService = scholarshipService;
    }

    @GetMapping("/scholarship-board")
    public List<ScholarshipEntryDTO> board(@PathVariable String slug) {
        return scholarshipService.honorBoard(slug);
    }

    @GetMapping("/scholarship-entries/admin")
    @RequiresPermission("scholarship:entry:read")
    public List<ScholarshipEntryDTO> admin(@PathVariable String slug, @RequestParam(required = false) String status) {
        return scholarshipService.listAdmin(slug, status);
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
