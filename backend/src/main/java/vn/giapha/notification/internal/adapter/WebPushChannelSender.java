package vn.giapha.notification.internal.adapter;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import vn.giapha.domain.NotificationOutbox;
import vn.giapha.notification.api.NotifyChannels;

/**
 * Stub Web Push (VAPID) — ghi log / dry-run đến khi có subscription endpoint FE.
 */
@Component
public class WebPushChannelSender implements ChannelSender {

    private static final Logger LOG = LoggerFactory.getLogger(WebPushChannelSender.class);

    @Override
    public String channel() {
        return NotifyChannels.WEB_PUSH;
    }

    @Override
    public String send(NotificationOutbox message) {
        LOG.info("[notify:web_push:dry-run] id={} payload={}", message.getId(), truncate(message.getPayloadJson()));
        return NotifyChannels.STATUS_DRY_RUN;
    }

    private static String truncate(String s) {
        if (s == null) {
            return "";
        }
        return s.length() > 200 ? s.substring(0, 200) + "…" : s;
    }
}
