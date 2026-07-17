package vn.giapha.notification.internal.adapter;

import vn.giapha.domain.NotificationOutbox;

/** Adapter gửi một kênh outbox. */
public interface ChannelSender {
    String channel();

    /** @return status sau gửi: sent / dry_run / failed */
    String send(NotificationOutbox message);
}
