package vn.giapha.cms.api;

/** Trạng thái bài — giá trị lưu trên {@code CmsPost.status}. */
public final class CmsPostStatus {

    public static final String DRAFT = "draft";
    public static final String PUBLISHED = "published";
    public static final String ARCHIVED = "archived";

    private CmsPostStatus() {}

    public static boolean isPublished(String status) {
        return PUBLISHED.equalsIgnoreCase(status);
    }
}
