package vn.giapha.genealogy.events;

/**
 * Sự kiện Person đã cập nhật (v1) — consumer search/notify.
 */
public record PersonUpdated(Long personId, String code, String treeSlug, String lifeStatus) {}
