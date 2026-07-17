package vn.giapha.web.util;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import tech.jhipster.web.util.PaginationUtil;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/** Bọc List → Page + header X-Total-Count (khi chưa có query Pageable ở repository). */
public final class PagedResponses {

    private PagedResponses() {}

    public static <T> Page<T> toPage(List<T> all, Pageable pageable) {
        if (pageable.isUnpaged()) {
            return new PageImpl<>(all);
        }
        int start = (int) pageable.getOffset();
        if (start >= all.size()) {
            return new PageImpl<>(List.of(), pageable, all.size());
        }
        int end = Math.min(start + pageable.getPageSize(), all.size());
        return new PageImpl<>(all.subList(start, end), pageable, all.size());
    }

    public static <T> ResponseEntity<List<T>> ok(List<T> all, Pageable pageable) {
        Page<T> page = toPage(all, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(
            ServletUriComponentsBuilder.fromCurrentRequest(),
            page
        );
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }
}
