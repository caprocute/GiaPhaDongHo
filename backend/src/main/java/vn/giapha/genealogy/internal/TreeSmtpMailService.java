package vn.giapha.genealogy.internal;

import jakarta.mail.internet.MimeMessage;
import java.util.Properties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.mail.javamail.JavaMailSenderImpl;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import vn.giapha.domain.FamilyTree;
import vn.giapha.genealogy.api.TreeMailSender;
import vn.giapha.genealogy.api.TreeSettingsDTO;
import vn.giapha.repository.FamilyTreeRepository;

/**
 * Gửi thư qua SMTP động từ cấu hình dòng họ (metaJson).
 */
@Service
public class TreeSmtpMailService implements TreeMailSender {

    private static final Logger LOG = LoggerFactory.getLogger(TreeSmtpMailService.class);

    private final FamilyTreeRepository familyTreeRepository;
    private final TreeSettingsCodec treeSettingsCodec;

    public TreeSmtpMailService(FamilyTreeRepository familyTreeRepository, TreeSettingsCodec treeSettingsCodec) {
        this.familyTreeRepository = familyTreeRepository;
        this.treeSettingsCodec = treeSettingsCodec;
    }

    @Override
    public void sendTest(String treeSlug, String to) {
        TreeSettingsDTO.SmtpSettings smtp = requireSmtp(treeSlug);
        sendWithSmtp(
            smtp,
            to,
            "Thư thử — cấu hình dòng họ",
            "Đây là thư thử từ cấu hình gửi thư của dòng họ. Nếu bạn nhận được, máy chủ gửi thư đã kết nối thành công."
        );
    }

    @Override
    public boolean send(String treeSlug, String to, String subject, String body) {
        FamilyTree tree = familyTreeRepository.findBySlug(treeSlug).orElse(null);
        if (tree == null) {
            LOG.info("[tree-smtp:dry-run] missing tree slug={}", treeSlug);
            return false;
        }
        TreeSettingsDTO settings = treeSettingsCodec.readInternal(tree);
        TreeSettingsDTO.SmtpSettings smtp = settings.getSmtp();
        if (smtp == null || smtp.getHost() == null || smtp.getHost().isBlank()) {
            LOG.info("[tree-smtp:dry-run] no smtp host tree={}", treeSlug);
            return false;
        }
        if (to == null || to.isBlank()) {
            to = settings.getContactEmail();
        }
        if (to == null || to.isBlank()) {
            LOG.info("[tree-smtp:dry-run] no recipient tree={}", treeSlug);
            return false;
        }
        sendWithSmtp(smtp, to, subject, body);
        return true;
    }

    /** Gửi trực tiếp từ SmtpSettings đã giải mã (genealogy nội bộ). */
    public void sendTest(TreeSettingsDTO.SmtpSettings smtp, String to) {
        sendWithSmtp(
            smtp,
            to,
            "Thư thử — cấu hình dòng họ",
            "Đây là thư thử từ cấu hình gửi thư của dòng họ. Nếu bạn nhận được, máy chủ gửi thư đã kết nối thành công."
        );
    }

    private TreeSettingsDTO.SmtpSettings requireSmtp(String treeSlug) {
        FamilyTree tree = familyTreeRepository
            .findBySlug(treeSlug)
            .orElseThrow(() -> new IllegalStateException("Không tìm thấy dòng họ."));
        TreeSettingsDTO settings = treeSettingsCodec.readInternal(tree);
        if (settings.getSmtp() == null || settings.getSmtp().getHost() == null || settings.getSmtp().getHost().isBlank()) {
            throw new IllegalStateException("Chưa cấu hình máy chủ gửi thư.");
        }
        return settings.getSmtp();
    }

    private void sendWithSmtp(TreeSettingsDTO.SmtpSettings smtp, String to, String subject, String body) {
        if (smtp == null || smtp.getHost() == null || smtp.getHost().isBlank()) {
            throw new IllegalStateException("Chưa cấu hình máy chủ gửi thư.");
        }
        if (to == null || to.isBlank()) {
            throw new IllegalStateException("Thiếu địa chỉ nhận thư.");
        }
        JavaMailSenderImpl sender = buildSender(smtp);
        try {
            MimeMessage message = sender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, false, "UTF-8");
            helper.setTo(to.trim());
            helper.setSubject(subject != null ? subject : "Thông báo dòng họ");
            helper.setText(body != null ? body : "", false);
            String from = smtp.getFromEmail();
            if (from != null && !from.isBlank()) {
                if (smtp.getFromName() != null && !smtp.getFromName().isBlank()) {
                    helper.setFrom(from.trim(), smtp.getFromName().trim());
                } else {
                    helper.setFrom(from.trim());
                }
            } else if (smtp.getUsername() != null && !smtp.getUsername().isBlank()) {
                helper.setFrom(smtp.getUsername().trim());
            }
            sender.send(message);
            LOG.info("[tree-smtp:sent] host={} to={}", smtp.getHost(), to);
        } catch (IllegalStateException e) {
            throw e;
        } catch (Exception e) {
            LOG.warn("[tree-smtp:failed] host={} to={} err={}", smtp.getHost(), to, e.getMessage());
            throw new IllegalStateException("Không gửi được thư. Kiểm tra máy chủ, tài khoản và mật khẩu.");
        }
    }

    static JavaMailSenderImpl buildSender(TreeSettingsDTO.SmtpSettings smtp) {
        JavaMailSenderImpl sender = new JavaMailSenderImpl();
        sender.setHost(smtp.getHost().trim());
        int port = smtp.getPort() > 0 ? smtp.getPort() : 587;
        sender.setPort(port);
        if (smtp.getUsername() != null && !smtp.getUsername().isBlank()) {
            sender.setUsername(smtp.getUsername().trim());
        }
        if (smtp.getPassword() != null && !smtp.getPassword().isBlank()) {
            sender.setPassword(smtp.getPassword());
        }
        Properties props = sender.getJavaMailProperties();
        props.put("mail.transport.protocol", "smtp");
        props.put("mail.smtp.auth", smtp.getUsername() != null && !smtp.getUsername().isBlank() ? "true" : "false");
        boolean tls = smtp.isTls();
        props.put("mail.smtp.starttls.enable", Boolean.toString(tls));
        props.put("mail.smtp.starttls.required", Boolean.toString(tls && port == 587));
        if (!tls && port == 465) {
            props.put("mail.smtp.ssl.enable", "true");
        }
        props.put("mail.smtp.connectiontimeout", "10000");
        props.put("mail.smtp.timeout", "10000");
        props.put("mail.smtp.writetimeout", "10000");
        return sender;
    }
}
