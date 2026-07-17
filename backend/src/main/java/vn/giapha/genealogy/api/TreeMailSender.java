package vn.giapha.genealogy.api;

/**
 * Gửi thư theo cấu hình SMTP của một dòng họ (trusted callers: notification, genealogy).
 */
public interface TreeMailSender {
    /**
     * Gửi thư thử.
     * @throws IllegalStateException nếu thiếu cấu hình / địa chỉ / lỗi SMTP
     */
    void sendTest(String treeSlug, String to);

    /**
     * Gửi thư nghiệp vụ.
     * @return {@code true} nếu đã gửi; {@code false} nếu dry-run (chưa cấu hình SMTP hoặc thiếu người nhận)
     */
    boolean send(String treeSlug, String to, String subject, String body);
}
