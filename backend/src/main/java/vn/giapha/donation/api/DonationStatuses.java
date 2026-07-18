package vn.giapha.donation.api;

import java.util.Locale;
import java.util.Set;

/** Trạng thái chiến dịch / đóng góp / mục đích quỹ (R2.2 / F4). */
public final class DonationStatuses {

    public static final String CAMPAIGN_OPEN = "open";
    public static final String CAMPAIGN_CLOSED = "closed";
    public static final String CAMPAIGN_DRAFT = "draft";

    /** Công đức / công trình chung. */
    public static final String PURPOSE_GENERAL = "general";
    /** Quỹ khuyến học — nguồn tiền trao học bổng (F8). */
    public static final String PURPOSE_SCHOLARSHIP = "scholarship";
    /** Tôn tạo lăng mộ / mộ phần. */
    public static final String PURPOSE_TOMB = "tomb";
    /** Nhà thờ họ / từ đường. */
    public static final String PURPOSE_ANCESTRAL_HOUSE = "ancestral_house";
    /** Biên soạn / in ấn gia phả. */
    public static final String PURPOSE_GENEALOGY = "genealogy";
    /** Sự kiện dòng họ / giỗ tổ / lễ hội. */
    public static final String PURPOSE_EVENT = "event";
    /** Cứu trợ / hỗ trợ thành viên khó khăn. */
    public static final String PURPOSE_RELIEF = "relief";
    /** Mục đích khác (ghi rõ trong tiêu đề). */
    public static final String PURPOSE_OTHER = "other";

    public static final Set<String> PURPOSES = Set.of(
        PURPOSE_GENERAL,
        PURPOSE_SCHOLARSHIP,
        PURPOSE_TOMB,
        PURPOSE_ANCESTRAL_HOUSE,
        PURPOSE_GENEALOGY,
        PURPOSE_EVENT,
        PURPOSE_RELIEF,
        PURPOSE_OTHER
    );

    public static final String KIND_MONEY = "money";
    public static final String KIND_GOODS = "goods";
    public static final String KIND_LABOR = "labor";
    /** Chờ đối soát — chưa cộng raised_amount. */
    public static final String KIND_PENDING = "pending";

    private DonationStatuses() {}

    public static String normalizePurpose(String purpose) {
        if (purpose == null || purpose.isBlank()) {
            return PURPOSE_GENERAL;
        }
        String p = purpose.trim().toLowerCase(Locale.ROOT);
        return PURPOSES.contains(p) ? p : PURPOSE_GENERAL;
    }
}
