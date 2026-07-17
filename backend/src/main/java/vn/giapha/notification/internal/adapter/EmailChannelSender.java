package vn.giapha.notification.internal.adapter;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Component;
import vn.giapha.domain.NotificationOutbox;
import vn.giapha.genealogy.api.TreeMailSender;
import vn.giapha.notification.api.NotifyChannels;
import vn.giapha.notification.internal.NotificationProperties;

@Component
public class EmailChannelSender implements ChannelSender {

    private static final Logger LOG = LoggerFactory.getLogger(EmailChannelSender.class);

    private final ObjectProvider<JavaMailSender> mailSender;
    private final NotificationProperties props;
    private final ObjectMapper objectMapper;
    private final TreeMailSender treeMailSender;

    public EmailChannelSender(
        ObjectProvider<JavaMailSender> mailSender,
        NotificationProperties props,
        ObjectMapper objectMapper,
        TreeMailSender treeMailSender
    ) {
        this.mailSender = mailSender;
        this.props = props;
        this.objectMapper = objectMapper;
        this.treeMailSender = treeMailSender;
    }

    @Override
    public String channel() {
        return NotifyChannels.EMAIL;
    }

    @Override
    public String send(NotificationOutbox message) {
        try {
            JsonNode n = objectMapper.readTree(message.getPayloadJson());
            String to = text(n, "to");
            if (to == null || to.isBlank()) {
                to = props.getDefaultEmailTo();
            }
            String subject = text(n, "subject");
            if (subject == null) {
                subject = "Nhắc ngày giỗ — GiaPhaHub";
            }
            String body = text(n, "body");
            if (body == null) {
                body = message.getPayloadJson();
            }
            String treeSlug = text(n, "treeSlug");

            if (treeSlug != null && !treeSlug.isBlank()) {
                boolean sent = treeMailSender.send(treeSlug, to, subject, body);
                if (sent) {
                    LOG.info("[notify:email:sent] tree={} to={}", treeSlug, to);
                    return NotifyChannels.STATUS_SENT;
                }
                LOG.info("[notify:email:dry-run] tree={} to={} subject={}", treeSlug, to, subject);
                return NotifyChannels.STATUS_DRY_RUN;
            }

            JavaMailSender sender = mailSender.getIfAvailable();
            if (sender == null || to == null || to.isBlank()) {
                LOG.info("[notify:email:dry-run] to={} subject={} body={}", to, subject, body);
                return NotifyChannels.STATUS_DRY_RUN;
            }
            SimpleMailMessage mail = new SimpleMailMessage();
            mail.setTo(to);
            mail.setSubject(subject);
            mail.setText(body);
            sender.send(mail);
            LOG.info("[notify:email:sent] to={}", to);
            return NotifyChannels.STATUS_SENT;
        } catch (IllegalStateException e) {
            LOG.warn("[notify:email:failed] {}", e.getMessage());
            return NotifyChannels.STATUS_FAILED;
        } catch (Exception e) {
            LOG.warn("[notify:email:failed] {}", e.getMessage());
            return NotifyChannels.STATUS_FAILED;
        }
    }

    private static String text(JsonNode n, String key) {
        JsonNode v = n.get(key);
        return v == null || v.isNull() ? null : v.asText();
    }
}
