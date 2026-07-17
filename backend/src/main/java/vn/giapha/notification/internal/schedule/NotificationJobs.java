package vn.giapha.notification.internal.schedule;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import vn.giapha.notification.internal.NotificationService;

@Component
@ConditionalOnProperty(prefix = "giapha.notification", name = "scheduler-enabled", havingValue = "true", matchIfMissing = true)
public class NotificationJobs {

    private static final Logger LOG = LoggerFactory.getLogger(NotificationJobs.class);

    private final NotificationService notificationService;

    public NotificationJobs(NotificationService notificationService) {
        this.notificationService = notificationService;
    }

    /** 07:05 Asia/Ho_Chi_Minh — lập lịch nhắc + dispatch outbox. */
    @Scheduled(cron = "0 5 7 * * *", zone = "Asia/Ho_Chi_Minh")
    public void morningReminders() {
        int n = notificationService.runPlannerAndDispatch();
        LOG.info("NotificationJobs morning processed={}", n);
    }

    /** Mỗi 15 phút — chỉ dispatch pending còn lại. */
    @Scheduled(cron = "0 */15 * * * *", zone = "Asia/Ho_Chi_Minh")
    public void flushOutbox() {
        int n = notificationService.dispatchOnly();
        if (n > 0) {
            LOG.info("NotificationJobs flush dispatched={}", n);
        }
    }
}
