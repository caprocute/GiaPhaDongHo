package vn.giapha.media.internal;

import java.nio.charset.StandardCharsets;
import java.util.Base64;
import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.stereotype.Component;

/**
 * Tạo URL imgproxy có chữ ký HMAC-SHA256.
 * Spec: https://docs.imgproxy.net/signing_the_url
 */
@Component
public class ImgproxyUrlBuilder {

    private static final String HMAC_SHA256 = "HmacSHA256";

    private final ImgproxyProperties props;

    public ImgproxyUrlBuilder(ImgproxyProperties props) {
        this.props = props;
    }

    /**
     * Tạo URL imgproxy cho ảnh lấy từ MinIO qua S3-protocol.
     *
     * @param objectKey objectKey trong MinIO, ví dụ "albums/1/photo.jpg"
     * @param processingPath chuỗi options imgproxy, ví dụ "rs:fit:800:600"
     * @return URL có chữ ký hoặc URL không ký nếu signingEnabled=false
     */
    public String build(String objectKey, String processingPath) {
        if (props.getBaseUrl() == null || props.getBaseUrl().isBlank()) {
            throw new IllegalStateException("giapha.imgproxy.base-url chưa cấu hình");
        }

        // Encode source URL (S3 path) dạng base64url không padding
        String sourceUrl = "s3://" + props.getBaseUrl() + "/" + objectKey;
        String encodedSource = base64url(sourceUrl.getBytes(StandardCharsets.UTF_8));

        String path = "/" + processingPath + "/" + encodedSource;

        if (!props.isSigningEnabled()) {
            return props.getBaseUrl() + "/insecure" + path;
        }

        byte[] key = hexToBytes(props.getKey());
        byte[] salt = hexToBytes(props.getSalt());
        String signature = sign(key, salt, path);
        return props.getBaseUrl() + "/" + signature + path;
    }

    /** URL imgproxy mặc định: resize 800×600 dạng fit. */
    public String thumbnail(String objectKey) {
        return build(objectKey, "rs:fit:800:600/q:85");
    }

    /** URL imgproxy kích thước gốc (chỉ nén quality). */
    public String original(String objectKey) {
        return build(objectKey, "q:90");
    }

    private String sign(byte[] key, byte[] salt, String path) {
        try {
            Mac mac = Mac.getInstance(HMAC_SHA256);
            mac.init(new SecretKeySpec(key, HMAC_SHA256));
            mac.update(salt);
            byte[] digest = mac.doFinal(path.getBytes(StandardCharsets.UTF_8));
            return base64url(digest);
        } catch (Exception e) {
            throw new IllegalStateException("Lỗi ký imgproxy URL", e);
        }
    }

    private static String base64url(byte[] data) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(data);
    }

    private static byte[] hexToBytes(String hex) {
        if (hex == null || hex.length() % 2 != 0) {
            throw new IllegalArgumentException("imgproxy key/salt phải là chuỗi hex hợp lệ");
        }
        byte[] result = new byte[hex.length() / 2];
        for (int i = 0; i < result.length; i++) {
            result[i] = (byte) Integer.parseInt(hex, i * 2, i * 2 + 2, 16);
        }
        return result;
    }
}
