package vn.giapha.search.internal;

import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.search.api.PersonSuggestHit;

@Service
@Transactional(readOnly = true)
public class PersonSearchService {

    private final SearchProperties properties;
    private final ElasticsearchPersonIndex elasticsearchPersonIndex;
    private final PostgresFtsPersonSearch postgresFtsPersonSearch;

    public PersonSearchService(
        SearchProperties properties,
        ElasticsearchPersonIndex elasticsearchPersonIndex,
        PostgresFtsPersonSearch postgresFtsPersonSearch
    ) {
        this.properties = properties;
        this.elasticsearchPersonIndex = elasticsearchPersonIndex;
        this.postgresFtsPersonSearch = postgresFtsPersonSearch;
    }

    public List<PersonSuggestHit> suggest(String treeSlug, String query, Integer limitParam) {
        if (treeSlug == null || treeSlug.isBlank() || query == null) {
            return List.of();
        }
        String folded = VietnameseTextNormalizer.fold(query);
        if (folded.length() < 1) {
            return List.of();
        }
        int limit = limitParam == null ? properties.getSuggestDefaultLimit() : limitParam;
        limit = Math.min(Math.max(limit, 1), properties.getSuggestMaxLimit());

        if (elasticsearchPersonIndex.isAvailable()) {
            List<PersonSuggestHit> hits = elasticsearchPersonIndex.suggest(treeSlug.trim(), folded, limit);
            if (!hits.isEmpty() || folded.length() < 2) {
                return hits;
            }
            // ES trống — thử FTS (chưa reindex đủ)
        }
        return postgresFtsPersonSearch.suggest(treeSlug.trim(), query, folded, limit);
    }

    public String backend() {
        return elasticsearchPersonIndex.isAvailable() ? "elasticsearch" : "postgres-fts";
    }
}
