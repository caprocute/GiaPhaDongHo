package vn.giapha.media.api;

/**
 * Kết quả upload ảnh — trả về cho client sau khi lưu MinIO thành công.
 * presignedGetUrl: URL tạm thời để client tải ảnh trực tiếp từ MinIO.
 * imgproxyUrl:     URL qua imgproxy (resize/compress) để hiển thị trên web.
 */
public record UploadResponse(
    Long photoId,
    String objectKey,
    String presignedGetUrl,
    String imgproxyUrl
) {}
