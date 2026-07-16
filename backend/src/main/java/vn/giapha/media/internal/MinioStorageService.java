package vn.giapha.media.internal;

import io.minio.GetPresignedObjectUrlArgs;
import io.minio.MinioClient;
import io.minio.PutObjectArgs;
import io.minio.RemoveObjectArgs;
import io.minio.http.Method;
import java.io.InputStream;
import java.util.concurrent.TimeUnit;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

/** Adapter MinIO: upload, delete, presigned GET URL. */
@Service
public class MinioStorageService {

    private static final Logger LOG = LoggerFactory.getLogger(MinioStorageService.class);

    private final MinioClient minioClient;
    private final MinioProperties props;

    public MinioStorageService(MinioClient minioClient, MinioProperties props) {
        this.minioClient = minioClient;
        this.props = props;
    }

    /**
     * Upload stream lên MinIO, trả về objectKey.
     *
     * @param objectKey   đường dẫn trong bucket, ví dụ "albums/1/uuid.jpg"
     * @param stream      dữ liệu file
     * @param size        kích thước bytes (-1 nếu không biết, MinIO sẽ multipart)
     * @param contentType MIME type
     */
    public void upload(String objectKey, InputStream stream, long size, String contentType) {
        try {
            minioClient.putObject(
                PutObjectArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .stream(stream, size, -1)
                    .contentType(contentType)
                    .build()
            );
            LOG.debug("Uploaded {} to bucket {}", objectKey, props.getBucket());
        } catch (Exception e) {
            throw new MinioException("Lỗi upload file lên MinIO: " + objectKey, e);
        }
    }

    /**
     * Tạo presigned URL cho GET object, hết hạn theo {@code giapha.minio.presign-expire-seconds}.
     */
    public String presignedGetUrl(String objectKey) {
        try {
            return minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                    .method(Method.GET)
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .expiry((int) props.getPresignExpireSeconds(), TimeUnit.SECONDS)
                    .build()
            );
        } catch (Exception e) {
            throw new MinioException("Lỗi tạo presigned URL cho: " + objectKey, e);
        }
    }

    /** Xoá object khỏi MinIO. */
    public void delete(String objectKey) {
        try {
            minioClient.removeObject(
                RemoveObjectArgs.builder()
                    .bucket(props.getBucket())
                    .object(objectKey)
                    .build()
            );
            LOG.debug("Deleted {} from bucket {}", objectKey, props.getBucket());
        } catch (Exception e) {
            throw new MinioException("Lỗi xoá file MinIO: " + objectKey, e);
        }
    }

    public static class MinioException extends RuntimeException {
        public MinioException(String message, Throwable cause) { super(message, cause); }
    }
}
