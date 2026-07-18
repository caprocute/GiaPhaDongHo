package vn.giapha.scholarship.events;

/**
 * Phát khi đề cử khuyến học được duyệt vào bảng vàng (F8).
 */
public record ScholarshipApproved(Long entryId, String treeSlug, String personName, Integer year) {}
