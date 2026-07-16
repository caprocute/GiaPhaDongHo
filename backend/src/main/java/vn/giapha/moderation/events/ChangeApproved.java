package vn.giapha.moderation.events;

/**
 * Tự khai đã duyệt — GEN áp diff / NOTI thông báo (TK-08).
 */
public record ChangeApproved(
    Long changeRequestId,
    String treeSlug,
    Long personId,
    String entityType,
    String diffJson
) {}
