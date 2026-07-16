package vn.giapha.cms.events;

/** Sự kiện bài viết đã publish (v1). */
public record PostPublished(Long postId, String slug, String title) {}
