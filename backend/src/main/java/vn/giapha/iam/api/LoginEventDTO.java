package vn.giapha.iam.api;

/** Sự kiện đăng nhập gần đây. */
public record LoginEventDTO(String type, Long time, String ipAddress, String error) {}
