import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@giapha/auth";
import { Alert, Button, Dialog, EmptyState } from "@giapha/ui";
import {
  getPhotoUrl,
  listGalleryPhotos,
  uploadMediaPhoto,
  type GalleryPhotoDto,
} from "../../api/mediaApi";
import { ApiError } from "../../api/http";

type Props = {
  open: boolean;
  onClose: () => void;
  onPick: (url: string, alt?: string) => void;
};

export function MediaPickerDialog({ open, onClose, onPick }: Props) {
  const { getAccessToken } = useAuth();
  const [photos, setPhotos] = useState<GalleryPhotoDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const page = await listGalleryPhotos(token, { page: 0, size: 48 });
      setPhotos(page.content);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được thư viện ảnh.");
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [getAccessToken]);

  useEffect(() => {
    if (open) void reload();
  }, [open, reload]);

  async function onUpload(file: File | null) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const res = await uploadMediaPhoto(file, {}, token);
      const url = res.presignedGetUrl || res.imgproxyUrl || getPhotoUrl(res.objectKey);
      if (!url) {
        setError("Đã tải ảnh nhưng chưa có đường dẫn hiển thị — kiểm tra cấu hình thư viện.");
        return;
      }
      onPick(url, file.name);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải lên được ảnh.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <Dialog
      open={open}
      title="Chèn ảnh từ thư viện"
      description="Chọn ảnh đã có hoặc tải lên — ảnh lưu trong Thư viện để dùng lại."
      onClose={() => !uploading && onClose()}
      size="lg"
      footer={
        <div style={{ display: "flex", gap: "var(--spacing-sm)", flexWrap: "wrap" }}>
          <label className="admin-link-btn" style={{ cursor: uploading ? "wait" : "pointer" }}>
            <input
              type="file"
              accept="image/*"
              hidden
              disabled={uploading}
              onChange={(e) => void onUpload(e.target.files?.[0] ?? null)}
            />
            {uploading ? "Đang tải…" : "Tải ảnh mới"}
          </label>
          <Button type="button" variant="secondary" onClick={onClose} disabled={uploading}>
            Đóng
          </Button>
        </div>
      }
    >
      {error ? (
        <Alert title="Cần xử lý" variant="error">
          {error}
        </Alert>
      ) : null}
      {loading ? (
        <p style={{ color: "var(--color-text-muted)" }}>Đang tải thư viện…</p>
      ) : photos.length === 0 ? (
        <EmptyState
          title="Thư viện chưa có ảnh"
          description="Tải ảnh mới ở nút bên dưới, hoặc vào mục Thư viện để quản lý album."
        />
      ) : (
        <div className="media-picker-grid">
          {photos.map((p) => {
            const url = p.thumbUrl || p.url || (p.objectKey ? getPhotoUrl(p.objectKey) : "");
            if (!url) return null;
            return (
              <button
                key={p.id}
                type="button"
                className="media-picker-item"
                onClick={() => {
                  onPick(p.url || url, p.caption ?? undefined);
                  onClose();
                }}
              >
                <img src={url} alt={p.caption ?? "Ảnh thư viện"} />
                {p.caption ? <span>{p.caption}</span> : null}
              </button>
            );
          })}
        </div>
      )}
    </Dialog>
  );
}
