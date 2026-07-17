package vn.giapha.notification.events;

/** Đã xếp hàng nhắc giỗ vào outbox. */
public record ReminderQueued(Long outboxId, String channel, Long subscriptionId, String personCode) {}
