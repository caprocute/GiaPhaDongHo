package vn.giapha.search.internal.web;

import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import vn.giapha.search.api.PersonSuggestHit;
import vn.giapha.search.internal.PersonSearchService;

/**
 * Suggest người theo tên/mã không dấu — TK-08 / FR-09.5.
 */
@RestController
@RequestMapping("/api/v1/search")
public class PersonSuggestResource {

    private static final Logger LOG = LoggerFactory.getLogger(PersonSuggestResource.class);

    private final PersonSearchService personSearchService;

    public PersonSuggestResource(PersonSearchService personSearchService) {
        this.personSearchService = personSearchService;
    }

    @GetMapping("/persons/suggest")
    public ResponseEntity<List<PersonSuggestHit>> suggest(
        @RequestParam("tree") String tree,
        @RequestParam("q") String q,
        @RequestParam(name = "limit", required = false) Integer limit
    ) {
        LOG.debug("suggest tree={} q={} backend={}", tree, q, personSearchService.backend());
        return ResponseEntity.ok(personSearchService.suggest(tree, q, limit));
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, String>> status() {
        return ResponseEntity.ok(Map.of("backend", personSearchService.backend()));
    }
}
