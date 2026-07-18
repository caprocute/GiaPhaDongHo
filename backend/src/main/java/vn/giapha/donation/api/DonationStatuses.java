package vn.giapha.donation.api;

/** Trạng thái chiến dịch / đóng góp (R2.2). */
public final class DonationStatuses {

    public static final String CAMPAIGN_OPEN = "open";
    public static final String CAMPAIGN_CLOSED = "closed";
    public static final String CAMPAIGN_DRAFT = "draft";

    /** Quỹ công đức / công trình chung. */
    public static final String PURPOSE_GENERAL = "general";
    /** Quỹ khuyến học — nguồn tiền trao học bổng (F8). */
    public static final String PURPOSE_SCHOLARSHIP = "scholarship";

    public static final String KIND_MONEY = "money";
    public static final String KIND_GOODS = "goods";
    public static final String KIND_LABOR = "labor";
    /** Chờ đối soát — chưa cộng raised_amount. */
    public static final String KIND_PENDING = "pending";

    private DonationStatuses() {}
}
