package vn.giapha.notification.internal.adapter;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;
import vn.giapha.domain.NotificationOutbox;
import vn.giapha.notification.api.NotifyChannels;
import vn.giapha.notification.internal.NotificationProperties;

/**
 * Gửi payload JSON tới webhook Zalo OA (proxy). Chưa cấu hình URL → dry-run.
 */
@Component
public class ZaloOaChannelSender implements ChannelSender {

    private static final Logger LOG = LoggerFactory.getLogger(ZaloOaChannelSender.class);

    private final NotificationProperties props;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(8)).build();

    public ZaloOaChannelSender(NotificationProperties props) {
        this.props = props;
    }

    @Override
    public String channel() {
        return NotifyChannels.ZALO;
    }

    @Override
    public String send(NotificationOutbox message) {
        String url = props.getZaloWebhookUrl();
        if (url == null || url.isBlank()) {
            LOG.info("[notify:zalo:dry-run] payload={}", truncate(message.getPayloadJson()));
            return NotifyChannels.STATUS_DRY_RUN;
        }
        try {
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(15))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(message.getPayloadJson(), StandardCharsets.UTF_8))
                .build();
            HttpResponse<String> res = http.send(req, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (res.statusCode() >= 200 && res.statusCode() < 300) {
                LOG.info("[notify:zalo:sent] http={}", res.statusCode());
                return NotifyChannels.STATUS_SENT;
            }
            LOG.warn("[notify:zalo:failed] http={} body={}", res.statusCode(), truncate(res.body()));
            return NotifyChannels.STATUS_FAILED;
        } catch (Exception e) {
            LOG.warn("[notify:zalo:failed] {}", e.getMessage());
            return NotifyChannels.STATUS_FAILED;
        }
    }

    private static String truncate(String s) {
        if (s == null) {
            return "";
        }
        return s.length() > 200 ? s.substring(0, 200) + "…" : s;
    }
}
