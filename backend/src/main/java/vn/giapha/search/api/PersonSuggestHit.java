package vn.giapha.search.api;

/** Gợi ý người — trả về public (không PII nhạy cảm). */
public record PersonSuggestHit(
    Long id,
    String code,
    String fullName,
    String treeSlug,
    Integer generation,
    String lifeStatus
) {}
