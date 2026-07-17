import { useCallback, useEffect, useMemo, useState, type CSSProperties } from "react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Button,
  DataTable,
  EmptyState,
  FormField,
  Input,
  Pagination,
  Select,
  Textarea,
} from "@giapha/ui";
import { ApiError } from "../api/http";
import {
  createMediaAlbum,
  deleteMediaAlbum,
  deleteMediaPhoto,
  listMediaAlbums,
  listMediaPhotos,
  uploadMediaPhoto,
  type MediaAlbumDto,
  type MediaPhotoDto,
  type UploadResponse,
} from "../api/mediaApi";
import { AdminPageHeader } from "../components/AdminPageHeader";

type PhotoRow = MediaPhotoDto & Record<string, unknown>;
type AlbumRow = MediaAlbumDto & Record<string, unknown>;

const ALBUM_PAGE_SIZE = 20;
const PHOTO_PAGE_SIZE = 20;

const grid: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
  gap: "var(--spacing-md)",
};

export function MediaLibraryPage() {
  const { getAccessToken } = useAuth();
  const [albumPage, setAlbumPage] = useState(0);
  const [albums, setAlbums] = useState<MediaAlbumDto[]>([]);
  const [albumTotal, setAlbumTotal] = useState(0);
  const [albumTotalPages, setAlbumTotalPages] = useState(1);
  const [allAlbums, setAllAlbums] = useState<MediaAlbumDto[]>([]);
  const [photoPage, setPhotoPage] = useState(0);
  const [photos, setPhotos] = useState<MediaPhotoDto[]>([]);
  const [photoTotal, setPhotoTotal] = useState(0);
  const [photoTotalPages, setPhotoTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumDesc, setAlbumDesc] = useState("");
  const [uploadAlbumId, setUploadAlbumId] = useState("");
  const [caption, setCaption] = useState("");
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const reloadAlbumOptions = useCallback(async () => {
    try {
      const token = await getAccessToken();
      const result = await listMediaAlbums(token, 0, 200);
      setAllAlbums(result.content);
    } catch {
      setAllAlbums([]);
    }
  }, [getAccessToken]);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = await getAccessToken();
      const [albumResult, photoResult] = await Promise.all([
        listMediaAlbums(token, albumPage, ALBUM_PAGE_SIZE),
        listMediaPhotos(token, photoPage, PHOTO_PAGE_SIZE),
      ]);
      setAlbums(albumResult.content);
      setAlbumTotal(albumResult.totalElements);
      setAlbumTotalPages(albumResult.totalPages);
      setPhotos(photoResult.content);
      setPhotoTotal(photoResult.totalElements);
      setPhotoTotalPages(photoResult.totalPages);
      await reloadAlbumOptions();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Không tải được thư viện ảnh.");
      setAlbums([]);
      setPhotos([]);
    } finally {
      setLoading(false);
    }
  }, [albumPage, getAccessToken, photoPage, reloadAlbumOptions]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const albumOptions = useMemo(
    () => [
      { value: "", label: "— Không gắn album —" },
      ...allAlbums.map((a) => ({
        value: String(a.id),
        label: a.title,
      })),
    ],
    [allAlbums],
  );

  async function onCreateAlbum() {
    if (!albumTitle.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const token = await getAccessToken();
      await createMediaAlbum(
        { title: albumTitle.trim(), description: albumDesc.trim() || null },
        token,
      );
      setAlbumTitle("");
      setAlbumDesc("");
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tạo album thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function onUpload(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setBusy(true);
    setError(null);
    setLastUpload(null);
    try {
      const token = await getAccessToken();
      const albumId = uploadAlbumId ? Number(uploadAlbumId) : undefined;
      const res = await uploadMediaPhoto(file, { albumId, caption }, token);
      setLastUpload(res);
      setCaption("");
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tải ảnh lên thất bại.");
    } finally {
      setBusy(false);
    }
  }

  const photoColumns = [
    {
      key: "id",
      header: "ID",
      render: (row: PhotoRow) => row.id ?? "—",
    },
    {
      key: "objectKey",
      header: "Mã lưu trữ",
      render: (row: PhotoRow) => <code style={{ fontSize: "var(--font-size-sm)" }}>{row.objectKey}</code>,
    },
    {
      key: "caption",
      header: "Chú thích",
      render: (row: PhotoRow) => row.caption ?? "—",
    },
    {
      key: "album",
      header: "Album",
      render: (row: PhotoRow) => row.album?.title ?? "—",
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: PhotoRow) => (
        <button
          type="button"
          style={{
            border: "none",
            background: "transparent",
            color: "var(--color-status-error-fg)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
          onClick={() => {
            void (async () => {
              if (row.id == null || !confirm(`Xóa ảnh #${row.id}?`)) return;
              try {
                const token = await getAccessToken();
                await deleteMediaPhoto(row.id, token);
                await reload();
              } catch (e) {
                setError(e instanceof ApiError ? e.message : "Xóa ảnh thất bại.");
              }
            })();
          }}
        >
          Xóa
        </button>
      ),
    },
  ];

  const albumColumns = [
    {
      key: "title",
      header: "Tên album",
      render: (row: AlbumRow) => row.title,
    },
    {
      key: "description",
      header: "Mô tả",
      render: (row: AlbumRow) => row.description ?? "—",
    },
    {
      key: "actions",
      header: "Thao tác",
      render: (row: AlbumRow) => (
        <button
          type="button"
          style={{
            border: "none",
            background: "transparent",
            color: "var(--color-status-error-fg)",
            cursor: "pointer",
            fontFamily: "var(--font-body)",
          }}
          onClick={() => {
            void (async () => {
              if (row.id == null || !confirm(`Xóa album «${row.title}»?`)) return;
              try {
                const token = await getAccessToken();
                await deleteMediaAlbum(row.id, token);
                await reload();
              } catch (e) {
                setError(e instanceof ApiError ? e.message : "Xóa album thất bại.");
              }
            })();
          }}
        >
          Xóa
        </button>
      ),
    },
  ];

  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Thư viện ảnh"
        description="Quản lý album và ảnh tư liệu dòng họ trên cổng thông tin."
      />

      {error ? (
        <Alert title="Lỗi" variant="error">
          {error}
        </Alert>
      ) : null}

      <section style={grid}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
            padding: "var(--spacing-md)",
            background: "var(--color-surface-card)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "var(--font-size-lg)" }}>
            Album mới
          </h2>
          <FormField label="Tên album" required>
            <Input value={albumTitle} onChange={(e) => setAlbumTitle(e.target.value)} />
          </FormField>
          <FormField label="Mô tả">
            <Textarea rows={2} value={albumDesc} onChange={(e) => setAlbumDesc(e.target.value)} />
          </FormField>
          <Button type="button" disabled={busy || !albumTitle.trim()} onClick={() => void onCreateAlbum()}>
            Tạo album
          </Button>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-sm)",
            padding: "var(--spacing-md)",
            background: "var(--color-surface-card)",
            border: "1px solid var(--color-border-subtle)",
          }}
        >
          <h2 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "var(--font-size-lg)" }}>
            Tải ảnh lên
          </h2>
          <FormField label="Album (tuỳ chọn)">
            <Select
              options={albumOptions}
              value={uploadAlbumId}
              onChange={(e) => setUploadAlbumId(e.target.value)}
            />
          </FormField>
          <FormField label="Chú thích">
            <Input value={caption} onChange={(e) => setCaption(e.target.value)} />
          </FormField>
          <FormField label="File ảnh" required>
            <Input
              type="file"
              accept="image/*"
              disabled={busy}
              onChange={(e) => void onUpload(e.target.files)}
              aria-label="Chọn file ảnh"
            />
          </FormField>
          {lastUpload ? (
            <Alert title="Tải lên thành công" variant="success">
              ID {lastUpload.photoId} ·{" "}
              <a href={lastUpload.presignedGetUrl} target="_blank" rel="noreferrer">
                Xem ảnh
              </a>
            </Alert>
          ) : null}
        </div>
      </section>

      {loading ? (
        <p style={{ fontFamily: "var(--font-body)", color: "var(--color-text-muted)" }}>Đang tải…</p>
      ) : (
        <>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Album</h2>
            {albums.length === 0 ? (
              <EmptyState title="Chưa có album" description="Tạo album ở panel bên trái." />
            ) : (
              <>
                <div className="admin-table-wrap">
                  <DataTable columns={albumColumns} rows={albums as AlbumRow[]} />
                </div>
                <div className="admin-table-footer">
                  <Pagination
                    page={albumPage + 1}
                    totalPages={albumTotalPages}
                    totalItems={albumTotal}
                    onPageChange={(p) => setAlbumPage(p - 1)}
                  />
                </div>
              </>
            )}
          </section>
          <section style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-sm)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", margin: 0 }}>Ảnh</h2>
            {photos.length === 0 ? (
              <EmptyState title="Chưa có ảnh" description="Tải ảnh lên để bổ sung thư viện." />
            ) : (
              <>
                <div className="admin-table-wrap">
                  <DataTable columns={photoColumns} rows={photos as PhotoRow[]} />
                </div>
                <div className="admin-table-footer">
                  <Pagination
                    page={photoPage + 1}
                    totalPages={photoTotalPages}
                    totalItems={photoTotal}
                    onPageChange={(p) => setPhotoPage(p - 1)}
                  />
                </div>
              </>
            )}
          </section>
        </>
      )}
    </div>
  );
}
