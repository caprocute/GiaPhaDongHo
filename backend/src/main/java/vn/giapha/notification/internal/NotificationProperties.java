package vn.giapha.notification.internal;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "giapha.notification")
public class NotificationProperties {

    /** Bật job lập lịch / dispatch outbox. */
    private boolean schedulerEnabled = true;

    /** Địa chỉ email người nhận khi payload không có "to" (dev). */
    private String defaultEmailTo = "";

    /**
     * Webhook Zalo OA / proxy nội bộ. Rỗng = dry-run (ghi log, đánh dấu dry_run).
     * Prod: URL HTTPS + secret qua env, không commit plaintext.
     */
    private String zaloWebhookUrl = "";

    private String fromName = "GiaPhaHub";

    public boolean isSchedulerEnabled() {
        return schedulerEnabled;
    }

    public void setSchedulerEnabled(boolean schedulerEnabled) {
        this.schedulerEnabled = schedulerEnabled;
    }

    public String getDefaultEmailTo() {
        return defaultEmailTo;
    }

    public void setDefaultEmailTo(String defaultEmailTo) {
        this.defaultEmailTo = defaultEmailTo;
    }

    public String getZaloWebhookUrl() {
        return zaloWebhookUrl;
    }

    public void setZaloWebhookUrl(String zaloWebhookUrl) {
        this.zaloWebhookUrl = zaloWebhookUrl;
    }

    public String getFromName() {
        return fromName;
    }

    public void setFromName(String fromName) {
        this.fromName = fromName;
    }
}
