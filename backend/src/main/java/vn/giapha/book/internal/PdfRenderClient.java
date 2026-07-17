package vn.giapha.book.internal;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

@Component
public class PdfRenderClient {

    private static final Logger LOG = LoggerFactory.getLogger(PdfRenderClient.class);

    private final BookProperties props;
    private final ObjectMapper objectMapper;
    private final HttpClient http = HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(5)).build();

    public PdfRenderClient(BookProperties props, ObjectMapper objectMapper) {
        this.props = props;
        this.objectMapper = objectMapper;
    }

    public Optional<byte[]> renderHtml(String html) {
        String base = props.getPdfRenderUrl();
        if (base == null || base.isBlank()) {
            return Optional.empty();
        }
        try {
            String url = base.replaceAll("/$", "") + "/render";
            ObjectNode body = objectMapper.createObjectNode();
            body.put("html", html);
            HttpRequest req = HttpRequest.newBuilder(URI.create(url))
                .timeout(Duration.ofSeconds(60))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body), StandardCharsets.UTF_8))
                .build();
            HttpResponse<byte[]> res = http.send(req, HttpResponse.BodyHandlers.ofByteArray());
            if (res.statusCode() >= 200 && res.statusCode() < 300) {
                return Optional.of(res.body());
            }
            LOG.warn("pdf-render HTTP {}", res.statusCode());
        } catch (Exception e) {
            LOG.warn("pdf-render unavailable: {}", e.getMessage());
        }
        return Optional.empty();
    }
}
