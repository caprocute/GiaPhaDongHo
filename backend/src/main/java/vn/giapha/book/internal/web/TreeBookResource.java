package vn.giapha.book.internal.web;

import java.util.Map;
import org.springframework.web.bind.annotation.*;
import vn.giapha.book.internal.BookExportService;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.web.rest.errors.BadRequestAlertException;

@RestController
@RequestMapping("/api/v1/trees/{slug}/book")
public class TreeBookResource {

    private final BookExportService bookExportService;

    public TreeBookResource(BookExportService bookExportService) {
        this.bookExportService = bookExportService;
    }

    @PostMapping("/export")
    @RequiresPermission("book:export:write")
    public Map<String, Object> export(@PathVariable String slug) {
        try {
            return bookExportService.exportBook(slug);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "book", "invalid");
        }
    }
}
