package vn.giapha.notification.api;

/** Kênh nhắc giỗ (F1). */
public final class NotifyChannels {

    public static final String EMAIL = "email";
    public static final String ZALO = "zalo";
    public static final String WEB_PUSH = "web_push";

    public static final String STATUS_PENDING = "pending";
    public static final String STATUS_SENT = "sent";
    public static final String STATUS_FAILED = "failed";
    public static final String STATUS_DRY_RUN = "dry_run";

    private NotifyChannels() {}
}
