package vn.giapha.search.internal;

/** Document ES {@code person_v1}. */
public record PersonIndexDocument(
    Long id,
    String code,
    String fullName,
    String tenHuy,
    String tenThuong,
    String fold,
    String treeSlug,
    Integer generation,
    String lifeStatus
) {}
