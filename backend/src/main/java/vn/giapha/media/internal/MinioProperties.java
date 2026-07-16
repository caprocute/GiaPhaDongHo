package vn.giapha.media.internal;

import org.springframework.boot.context.properties.ConfigurationProperties;

/** Cấu hình kết nối MinIO — secrets phải qua Jasypt ENC(...) trên prod. */
@ConfigurationProperties(prefix = "giapha.minio")
public class MinioProperties {

    private String endpoint;
    private String accessKey;
    private String secretKey;
    private String bucket = "giapha-media";
    /** Thời hạn presigned GET URL, tính bằng giây. Mặc định 7 ngày. */
    private long presignExpireSeconds = 604_800L;

    public String getEndpoint() { return endpoint; }
    public void setEndpoint(String endpoint) { this.endpoint = endpoint; }

    public String getAccessKey() { return accessKey; }
    public void setAccessKey(String accessKey) { this.accessKey = accessKey; }

    public String getSecretKey() { return secretKey; }
    public void setSecretKey(String secretKey) { this.secretKey = secretKey; }

    public String getBucket() { return bucket; }
    public void setBucket(String bucket) { this.bucket = bucket; }

    public long getPresignExpireSeconds() { return presignExpireSeconds; }
    public void setPresignExpireSeconds(long presignExpireSeconds) { this.presignExpireSeconds = presignExpireSeconds; }
}
