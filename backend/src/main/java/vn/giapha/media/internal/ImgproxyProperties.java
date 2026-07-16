package vn.giapha.media.internal;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Cấu hình imgproxy — key/salt là hex string, phải qua Jasypt ENC(...) trên prod. */
@ConfigurationProperties(prefix = "giapha.imgproxy")
public class ImgproxyProperties {

    /** Base URL của imgproxy, ví dụ https://img.example.com */
    private String baseUrl;
    /** Hex-encoded signing key (64 ký tự hex = 32 bytes). */
    private String key;
    /** Hex-encoded signing salt (64 ký tự hex = 32 bytes). */
    private String salt;
    /** Bật/tắt URL signing. Dev có thể dùng false khi chưa có imgproxy thật. */
    private boolean signingEnabled = true;

    public String getBaseUrl() { return baseUrl; }
    public void setBaseUrl(String baseUrl) { this.baseUrl = baseUrl; }

    public String getKey() { return key; }
    public void setKey(String key) { this.key = key; }

    public String getSalt() { return salt; }
    public void setSalt(String salt) { this.salt = salt; }

    public boolean isSigningEnabled() { return signingEnabled; }
    public void setSigningEnabled(boolean signingEnabled) { this.signingEnabled = signingEnabled; }
}
