package vn.giapha.moderation.events;

/**
 * Tự khai bị từ chối.
 */
public record ChangeRejected(Long changeRequestId, String treeSlug, String reason) {}
