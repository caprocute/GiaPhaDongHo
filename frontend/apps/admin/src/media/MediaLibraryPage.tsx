import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Button,
  FormField,
  Input,
  ProTable,
  Select,
  Textarea,
} from "@giapha/ui";
import type { ProTableColumn } from "@giapha/ui";
import { ApiError } from "../api/http";
import {
  createMediaAlbum,
  deleteMediaAlbum,
  deleteMediaPhoto,
  getAlbumCoverUrl,
  listGalleryPhotos,
  listMediaAlbums,
  updateMediaAlbum,
  uploadMediaPhoto,
  type GalleryPhotoDto,
  type MediaAlbumDto,
  type UploadResponse,
} from "../api/mediaApi";
import { AdminPageHeader } from "../components/AdminPageHeader";

// ── CSS injection ──────────────────────────────────────────────────────────
let _mlCss = false;
function ensureMediaCss() {
  if (_mlCss || typeof document === "undefined") return;
  _mlCss = true;
  const s = document.createElement("style");
  s.dataset.ml = "1";
  s.textContent = `
    .ml-card:hover .ml-ov{opacity:1!important}
    .ml-album-card:hover{border-color:var(--color-primary)!important;box-shadow:var(--shadow-md)!important}
    .ml-drop:hover,.ml-drop.over{border-color:var(--color-primary)!important;background:color-mix(in srgb,var(--color-primary) 6%,transparent)!important}
    @keyframes ml-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
    .ml-skel{animation:ml-shimmer 1.5s ease infinite;background-size:200% 100%;background-image:linear-gradient(90deg,var(--color-surface-raised) 0%,var(--color-surface-card) 50%,var(--color-surface-raised) 100%)}
  `;
  document.head.appendChild(s);
}

// ── Types ─────────────────────────────────────────────────────────────────
type Tab = "photos" | "albums" | "upload";
type AlbumRow = MediaAlbumDto & Record<string, unknown>;
type UploadItem = { file: File; status: "pending" | "uploading" | "done" | "error"; result?: UploadResponse; error?: string };

const PHOTO_PAGE = 24;
const ALBUM_LIMIT = 200;

export function MediaLibraryPage() {
  ensureMediaCss();
  const { getAccessToken } = useAuth();

  // ── Tab ──
  const [tab, setTab] = useState<Tab>("photos");

  // ── Data ──
  const [albums, setAlbums] = useState<MediaAlbumDto[]>([]);
  const [photos, setPhotos] = useState<GalleryPhotoDto[]>([]);
  const [photoTotal, setPhotoTotal] = useState(0);
  const [photoTotalPages, setPhotoTotalPages] = useState(1);
  const [loadingPhotos, setLoadingPhotos] = useState(true);
  const [loadingAlbums, setLoadingAlbums] = useState(true);

  // ── Filters — album + page change atomically via handleAlbumSelect ──
  const [activeAlbumId, setActiveAlbumId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [photoPage, setPhotoPage] = useState(0);

  // ── Selection ──
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ── Lightbox ──
  const [lightboxPhoto, setLightboxPhoto] = useState<GalleryPhotoDto | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // ── Album modals ──
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editAlbum, setEditAlbum] = useState<MediaAlbumDto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // ── Upload queue ──
  const [uploadQueue, setUploadQueue] = useState<UploadItem[]>([]);
  const [uploadAlbumId, setUploadAlbumId] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploading, setUploading] = useState(false);

  // ── Status ──
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  // ── Data loading ────────────────────────────────────────────────────────
  const loadAlbums = useCallback(async () => {
    setLoadingAlbums(true);
    try {
      const token = await getAccessToken();
      const res = await listMediaAlbums(token, 0, ALBUM_LIMIT);
      setAlbums(res.content);
    } finally {
      setLoadingAlbums(false);
    }
  }, [getAccessToken]);

  const loadPhotos = useCallback(
    async (albumId: number | null, page: number) => {
      setLoadingPhotos(true);
      setError(null);
      setPhotos([]); // clear ngay để tránh hiển thị kết quả cũ
      try {
        const token = await getAccessToken();
        const res = await listGalleryPhotos(token, { albumId, page, size: PHOTO_PAGE });
        setPhotos(res.content);
        setPhotoTotal(res.totalElements);
        setPhotoTotalPages(Math.max(1, res.totalPages));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Không tải được ảnh.");
      } finally {
        setLoadingPhotos(false);
      }
    },
    [getAccessToken],
  );

  // Album selection — reset page + clear selection atomically
  function handleAlbumSelect(id: number | null) {
    setActiveAlbumId(id);
    setPhotoPage(0);
    setSelectedIds(new Set());
    setSearchQuery("");
  }

  // Page change — keep album, just change page
  function handlePageChange(newPage: number) {
    setPhotoPage(newPage);
    setSelectedIds(new Set());
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Trigger photo reload whenever albumId or page changes
  useEffect(() => {
    void loadPhotos(activeAlbumId, photoPage);
  }, [activeAlbumId, photoPage, loadPhotos]);

  // Load albums once on mount
  useEffect(() => {
    void loadAlbums();
  }, [loadAlbums]);

  // ── Lightbox keyboard ──────────────────────────────────────────────────
  const lightboxPrev = useCallback(() => {
    const idx = Math.max(0, lightboxIdx - 1);
    setLightboxPhoto(photos[idx] ?? null);
    setLightboxIdx(idx);
  }, [lightboxIdx, photos]);

  const lightboxNext = useCallback(() => {
    const idx = Math.min(photos.length - 1, lightboxIdx + 1);
    setLightboxPhoto(photos[idx] ?? null);
    setLightboxIdx(idx);
  }, [lightboxIdx, photos]);

  useEffect(() => {
    if (!lightboxPhoto) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setLightboxPhoto(null);
      if (e.key === "ArrowLeft") lightboxPrev();
      if (e.key === "ArrowRight") lightboxNext();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightboxPhoto, lightboxPrev, lightboxNext]);

  // ── Derived ─────────────────────────────────────────────────────────────
  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) return photos;
    const q = searchQuery.toLowerCase();
    return photos.filter((p) => {
      const album = albums.find((a) => a.id === p.albumId);
      return p.caption?.toLowerCase().includes(q) || album?.title?.toLowerCase().includes(q);
    });
  }, [photos, searchQuery, albums]);

  const albumOptions = useMemo(
    () => [
      { value: "", label: "— Không gắn album —" },
      ...albums.map((a) => ({ value: String(a.id), label: a.title })),
    ],
    [albums],
  );

  // ── Upload progress ─────────────────────────────────────────────────────
  const uploadDoneCount = uploadQueue.filter((u) => u.status === "done").length;
  const uploadErrorCount = uploadQueue.filter((u) => u.status === "error").length;
  const currentUploadingFile = uploadQueue.find((u) => u.status === "uploading");

  async function doUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    const items: UploadItem[] = Array.from(files).map((f) => ({ file: f, status: "pending" }));
    setUploadQueue(items);
    setUploading(true);
    setError(null);

    const token = await getAccessToken();
    const albumId = uploadAlbumId ? Number(uploadAlbumId) : undefined;

    for (let i = 0; i < items.length; i++) {
      setUploadQueue((prev) => prev.map((it, idx) => idx === i ? { ...it, status: "uploading" } : it));
      try {
        const result = await uploadMediaPhoto(items[i].file, { albumId, caption: uploadCaption }, token);
        setUploadQueue((prev) => prev.map((it, idx) => idx === i ? { ...it, status: "done", result } : it));
      } catch (e) {
        const msg = e instanceof ApiError ? e.message : "Lỗi tải lên";
        setUploadQueue((prev) => prev.map((it, idx) => idx === i ? { ...it, status: "error", error: msg } : it));
      }
    }

    setUploading(false);
    setUploadCaption("");
    const done = uploadQueue.filter((u) => u.status === "done").length;
    setToast(`Hoàn tất: ${done}/${items.length} ảnh.`);
    await loadPhotos(activeAlbumId, photoPage);
    await loadAlbums();
  }

  // ── Selection helpers ─────────────────────────────────────────────────
  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // ── Async actions ─────────────────────────────────────────────────────
  async function doDeletePhoto(id: number) {
    if (!confirm(`Xóa ảnh #${id}?`)) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      await deleteMediaPhoto(id, token);
      setLightboxPhoto(null);
      setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      setToast("Đã xóa ảnh.");
      await loadPhotos(activeAlbumId, photoPage);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa ảnh thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function doDeleteSelected() {
    if (selectedIds.size === 0) return;
    if (!confirm(`Xóa ${selectedIds.size} ảnh đã chọn?`)) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      await Promise.all([...selectedIds].map((id) => deleteMediaPhoto(id, token)));
      setSelectedIds(new Set());
      setToast(`Đã xóa ${selectedIds.size} ảnh.`);
      await loadPhotos(activeAlbumId, photoPage);
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function doCreateAlbum() {
    if (!newTitle.trim()) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      await createMediaAlbum({ title: newTitle.trim(), description: newDesc.trim() || null }, token);
      setNewTitle(""); setNewDesc(""); setShowCreateAlbum(false);
      setToast("Đã tạo album.");
      await loadAlbums();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tạo album thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function doUpdateAlbum() {
    if (!editAlbum?.id || !editTitle.trim()) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      await updateMediaAlbum(editAlbum.id, { ...editAlbum, title: editTitle, description: editDesc || null }, token);
      setEditAlbum(null);
      setToast("Đã cập nhật album.");
      await loadAlbums();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Cập nhật thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function doDeleteAlbum(id: number, title: string) {
    if (!confirm(`Xóa album «${title}»? Ảnh không bị xóa nhưng mất liên kết.`)) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      await deleteMediaAlbum(id, token);
      if (activeAlbumId === id) handleAlbumSelect(null);
      setToast("Đã xóa album.");
      await loadAlbums();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa album thất bại.");
    } finally {
      setBusy(false);
    }
  }

  // ── Album columns (Albums tab) ─────────────────────────────────────────
  const albumColumns: ProTableColumn<AlbumRow>[] = [
    {
      key: "cover",
      header: "Ảnh bìa",
      width: 72,
      render: (row) => {
        const url = getAlbumCoverUrl(row as MediaAlbumDto);
        const letter = (row.title as string).charAt(0).toUpperCase();
        return url ? (
          <img src={url} alt="" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "var(--radius-sm)", display: "block" }} />
        ) : (
          <div style={{ width: 48, height: 48, borderRadius: "var(--radius-sm)", background: "var(--color-primary)", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 700, fontSize: "1.2rem", color: "#fff" }}>
            {letter}
          </div>
        );
      },
    },
    {
      key: "title",
      header: "Tên album",
      sortable: true,
      render: (row) => <strong style={{ fontFamily: "var(--font-display)" }}>{row.title as string}</strong>,
      exportValue: (row) => String(row.title ?? ""),
    },
    {
      key: "description",
      header: "Mô tả",
      render: (row) => (row.description as string | null | undefined) ?? "—",
      exportValue: (row) => String(row.description ?? ""),
    },
    {
      key: "actions",
      header: "Thao tác",
      hideable: false,
      width: 220,
      render: (row) => (
        <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
          <Button type="button" variant="secondary" onClick={() => { handleAlbumSelect(row.id as number); setTab("photos"); }}>Xem ảnh</Button>
          <Button type="button" variant="secondary" onClick={() => { setEditAlbum(row as MediaAlbumDto); setEditTitle(row.title as string); setEditDesc((row.description as string | null | undefined) ?? ""); }}>Sửa</Button>
          <Button type="button" variant="secondary" onClick={() => void doDeleteAlbum(row.id as number, row.title as string)}>Xóa</Button>
        </div>
      ),
    },
  ];

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="admin-stack">
      <AdminPageHeader
        title="Thư viện ảnh & tư liệu"
        description="Quản lý album, ảnh sự kiện, tư liệu lịch sử dòng họ — FR-08."
        actions={
          <div style={{ display: "flex", gap: "var(--spacing-sm)" }}>
            <Button type="button" variant="secondary" onClick={() => setShowCreateAlbum(true)}>+ Album mới</Button>
            <Button type="button" onClick={() => setTab("upload")}>Tải ảnh lên</Button>
          </div>
        }
      />

      {error ? <Alert title="Lỗi" variant="error">{error}</Alert> : null}
      {toast ? <Alert title="Xong" variant="success">{toast}</Alert> : null}

      {/* ── Stats ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-lg)" }}>
        {[
          { label: "Tổng ảnh", value: photoTotal, sub: "trong thư viện", accent: true },
          { label: "Số album", value: albums.length, sub: "album sự kiện & tư liệu" },
          { label: "Trang này", value: filteredPhotos.length, sub: activeAlbumId ? `ảnh trong album · trang ${photoPage + 1}` : `trang ${photoPage + 1}` },
          { label: "Đã chọn", value: selectedIds.size, sub: selectedIds.size > 0 ? "→ thanh thao tác" : "click ảnh để chọn" },
        ].map((c) => (
          <div key={c.label} style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--spacing-md)", boxShadow: "var(--shadow-sm)" }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--color-text-muted)", marginBottom: "var(--spacing-xs)" }}>{c.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: c.accent ? "var(--color-primary)" : "var(--color-text-default)" }}>
              {c.value.toLocaleString("vi-VN")}
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: "flex", gap: 4, background: "var(--color-surface-raised)", padding: 5, borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-lg)", width: "fit-content" }} role="tablist">
        {([["photos", "Ảnh"], ["albums", "Album"], ["upload", "Tải lên"]] as [Tab, string][]).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            style={{ padding: "7px 20px", borderRadius: "var(--radius-sm)", border: "none", background: tab === k ? "var(--color-surface-card)" : "none", boxShadow: tab === k ? "var(--shadow-sm)" : "none", fontSize: "13px", fontWeight: 600, cursor: "pointer", color: tab === k ? "var(--color-text-default)" : "var(--color-text-muted)" }}
          >{lbl}</button>
        ))}
      </div>

      {/* ═══ TAB: ẢNH ══════════════════════════════════════════════════════ */}
      {tab === "photos" && (
        <>
          {/* Album strip header — số album + nút tạo NGOÀI scroll */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "var(--spacing-xs)" }}>
            <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--color-text-muted)", textTransform: "uppercase", letterSpacing: ".5px" }}>
              {loadingAlbums ? "Đang tải…" : `${albums.length} album`}
            </span>
            <Button type="button" variant="secondary" onClick={() => setShowCreateAlbum(true)}>+ Tạo album</Button>
          </div>

          {/* Album strip — chỉ scroll, không có nút create bên trong */}
          <div style={{ display: "flex", gap: "var(--spacing-sm)", overflowX: "auto", paddingBottom: "var(--spacing-xs)", marginBottom: "var(--spacing-md)" }}>
            {/* Ô "Tất cả ảnh" */}
            {(() => {
              const isActive = activeAlbumId === null;
              return (
                <div
                  className="ml-album-card"
                  role="button" tabIndex={0} aria-pressed={isActive}
                  onClick={() => handleAlbumSelect(null)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleAlbumSelect(null); }}
                  style={{ flexShrink: 0, width: 130, borderRadius: "var(--radius-md)", overflow: "hidden", border: `2px solid ${isActive ? "var(--color-primary)" : "var(--color-border-subtle)"}`, cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "all 0.15s", background: "var(--color-surface-card)" }}
                >
                  <div style={{ height: 80, background: "var(--color-surface-raised)", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, padding: 2 }}>
                    {[0,1,2,3].map((j) => <div key={j} className="ml-skel" style={{ borderRadius: 2 }} />)}
                  </div>
                  <div style={{ padding: "6px 8px", borderTop: "1px solid var(--color-border-subtle)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>Tất cả ảnh</div>
                    {isActive && <div style={{ fontSize: "9px", color: "var(--color-primary)", fontWeight: 700, marginTop: 1 }}>Đang xem</div>}
                  </div>
                </div>
              );
            })()}

            {/* Album cards */}
            {albums.map((album, i) => {
              const isActive = activeAlbumId === album.id;
              const url = getAlbumCoverUrl(album);
              const letter = album.title.charAt(0).toUpperCase();
              return (
                <div
                  key={album.id}
                  className="ml-album-card"
                  role="button" tabIndex={0} aria-pressed={isActive}
                  onClick={() => handleAlbumSelect(album.id ?? null)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleAlbumSelect(album.id ?? null); }}
                  style={{ flexShrink: 0, width: 130, borderRadius: "var(--radius-md)", overflow: "hidden", border: `2px solid ${isActive ? "var(--color-primary)" : "var(--color-border-subtle)"}`, cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "all 0.15s", background: "var(--color-surface-card)" }}
                >
                  <div style={{ height: 80, overflow: "hidden" }}>
                    {url ? (
                      <img src={url} alt={album.title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", background: `color-mix(in srgb, var(--color-primary) ${60 - (i % 5) * 8}%, var(--color-surface-raised))`, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-display)", fontWeight: 800, fontSize: "2rem", color: "var(--color-on-primary, #fff)" }}>
                        {letter}
                      </div>
                    )}
                  </div>
                  <div style={{ padding: "6px 8px", borderTop: "1px solid var(--color-border-subtle)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{album.title}</div>
                    {isActive && <div style={{ fontSize: "9px", color: "var(--color-primary)", fontWeight: 700, marginTop: 1 }}>Đang lọc</div>}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Tìm chú thích…" style={{ width: 200 }} aria-label="Tìm ảnh" />
            {activeAlbumId != null && (
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "3px 10px", background: "color-mix(in srgb,var(--color-primary) 12%,var(--color-surface-card))", borderRadius: "var(--radius-sm)", fontSize: "12px", fontWeight: 600, color: "var(--color-primary)" }}>
                {albums.find((a) => a.id === activeAlbumId)?.title ?? "Album"}
                <button type="button" onClick={() => handleAlbumSelect(null)} aria-label="Bỏ lọc album" style={{ background: "none", border: "none", cursor: "pointer", lineHeight: 1, color: "inherit", padding: 0, marginLeft: 2 }}>✕</button>
              </span>
            )}
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)", marginLeft: "auto" }}>
              {loadingPhotos ? "Đang tải…" : `${photoTotal.toLocaleString("vi-VN")} ảnh · trang ${photoPage + 1}/${photoTotalPages}`}
            </span>
            <button type="button" onClick={() => void loadPhotos(activeAlbumId, photoPage)} aria-label="Tải lại" style={{ background: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)", borderRadius: "var(--radius-sm)", padding: "6px 10px", cursor: "pointer", fontSize: "14px", color: "var(--color-text-muted)" }}>↻</button>
          </div>

          {/* Selection bar */}
          {selectedIds.size > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "var(--spacing-sm) var(--spacing-md)", background: "color-mix(in srgb,var(--color-primary) 8%,var(--color-surface-card))", border: "1px solid color-mix(in srgb,var(--color-primary) 30%,var(--color-border-subtle))", borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-md)" }}>
              <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>Đã chọn {selectedIds.size} ảnh</span>
              <Button type="button" variant="secondary" onClick={() => setSelectedIds(new Set())}>Bỏ chọn</Button>
              <Button type="button" variant="secondary" onClick={() => setSelectedIds(new Set(filteredPhotos.map((p) => p.id)))}>Chọn tất cả trang</Button>
              <Button type="button" variant="secondary" disabled={busy} onClick={() => void doDeleteSelected()}>Xóa {selectedIds.size}</Button>
            </div>
          )}

          {/* Photo grid */}
          {loadingPhotos ? (
            <div style={{ display: "grid", gap: "var(--spacing-sm)", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
              {Array.from({ length: PHOTO_PAGE }).map((_, i) => (
                <div key={i} className="ml-skel" style={{ aspectRatio: "1", borderRadius: "var(--radius-sm)" }} />
              ))}
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div style={{ padding: "var(--spacing-xl)", textAlign: "center", color: "var(--color-text-muted)", background: "var(--color-surface-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)" }}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "var(--color-surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--spacing-sm)" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}>
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="8.5" cy="8.5" r="1.5"/>
                  <polyline points="21 15 16 10 5 21"/>
                </svg>
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-size-lg)", marginBottom: "var(--spacing-xs)" }}>
                {activeAlbumId ? "Album này chưa có ảnh" : "Chưa có ảnh nào"}
              </div>
              <div style={{ fontSize: "13px", marginBottom: "var(--spacing-md)" }}>Tải ảnh lên để bổ sung thư viện tư liệu dòng họ.</div>
              <Button type="button" onClick={() => setTab("upload")}>Tải ảnh lên</Button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "var(--spacing-sm)", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
              {filteredPhotos.map((photo, idx) => {
                const src = photo.thumbUrl ?? photo.url ?? "";
                const isSel = selectedIds.has(photo.id);
                const albumName = albums.find((a) => a.id === photo.albumId)?.title;
                return (
                  <div
                    key={photo.id}
                    className="ml-card"
                    role="button" tabIndex={0}
                    aria-label={photo.caption ?? `Ảnh #${photo.id}`}
                    onClick={() => { setLightboxPhoto(photo); setLightboxIdx(idx); }}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { setLightboxPhoto(photo); setLightboxIdx(idx); } }}
                    style={{ position: "relative", aspectRatio: "1", borderRadius: "var(--radius-sm)", overflow: "hidden", cursor: "pointer", border: `2px solid ${isSel ? "var(--color-primary)" : "transparent"}`, boxShadow: isSel ? "0 0 0 3px color-mix(in srgb,var(--color-primary) 25%,transparent)" : "var(--shadow-sm)", background: "var(--color-surface-raised)", transition: "border-color 0.15s,box-shadow 0.15s" }}
                  >
                    {src ? (
                      <img src={src} alt={photo.caption ?? ""} loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                        onError={(e) => { if (photo.url && e.currentTarget.src !== photo.url) e.currentTarget.src = photo.url; }}
                      />
                    ) : (
                      <div className="ml-skel" style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.2 }}>
                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                          <circle cx="8.5" cy="8.5" r="1.5"/>
                          <polyline points="21 15 16 10 5 21"/>
                        </svg>
                      </div>
                    )}
                    <div className="ml-ov" style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", opacity: 0, transition: "opacity 0.15s", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 6 }}>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button type="button" aria-label={isSel ? "Bỏ chọn" : "Chọn ảnh"}
                          onClick={(e) => { e.stopPropagation(); toggleSelect(photo.id); }}
                          style={{ width: 20, height: 20, borderRadius: "50%", background: isSel ? "var(--color-primary)" : "rgba(255,255,255,0.85)", border: "2px solid white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: isSel ? "white" : "transparent" }}
                        >✓</button>
                      </div>
                      <div style={{ fontSize: "10px", color: "white", fontWeight: 600, lineHeight: 1.3, textShadow: "0 1px 2px rgba(0,0,0,.8)" }}>
                        {photo.caption ? photo.caption.slice(0, 50) : `#${photo.id}`}
                      </div>
                    </div>
                    {albumName && activeAlbumId == null ? (
                      <div style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(0,0,0,.65)", color: "white", fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>
                        {albumName.slice(0, 14)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {photoTotalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "var(--spacing-xs)", marginTop: "var(--spacing-lg)", alignItems: "center", flexWrap: "wrap" }}>
              <Button type="button" variant="secondary" disabled={photoPage === 0 || loadingPhotos} onClick={() => handlePageChange(0)}>«</Button>
              <Button type="button" variant="secondary" disabled={photoPage === 0 || loadingPhotos} onClick={() => handlePageChange(photoPage - 1)}>‹ Trước</Button>

              {/* Page number pills */}
              {Array.from({ length: photoTotalPages }, (_, i) => i)
                .filter((i) => i === 0 || i === photoTotalPages - 1 || Math.abs(i - photoPage) <= 2)
                .reduce<(number | "…")[]>((acc, cur, idx, arr) => {
                  if (idx > 0) {
                    const prev = arr[idx - 1];
                    if (typeof prev === "number" && cur - prev > 1) acc.push("…");
                  }
                  acc.push(cur);
                  return acc;
                }, [])
                .map((item, i) =>
                  item === "…" ? (
                    <span key={`e-${i}`} style={{ fontSize: "13px", color: "var(--color-text-muted)", padding: "0 4px" }}>…</span>
                  ) : (
                    <button key={item} type="button" disabled={loadingPhotos}
                      onClick={() => handlePageChange(item as number)}
                      style={{ minWidth: 32, height: 32, borderRadius: "var(--radius-sm)", border: "1px solid", borderColor: item === photoPage ? "var(--color-primary)" : "var(--color-border-subtle)", background: item === photoPage ? "var(--color-primary)" : "var(--color-surface-card)", color: item === photoPage ? "#fff" : "var(--color-text-default)", fontSize: "13px", fontWeight: 600, cursor: "pointer" }}
                    >{(item as number) + 1}</button>
                  )
                )
              }

              <Button type="button" variant="secondary" disabled={photoPage >= photoTotalPages - 1 || loadingPhotos} onClick={() => handlePageChange(photoPage + 1)}>Tiếp ›</Button>
              <Button type="button" variant="secondary" disabled={photoPage >= photoTotalPages - 1 || loadingPhotos} onClick={() => handlePageChange(photoTotalPages - 1)}>»</Button>
              <span style={{ fontSize: "12px", color: "var(--color-text-muted)", marginLeft: "var(--spacing-sm)" }}>
                {photoTotal.toLocaleString("vi-VN")} ảnh · {PHOTO_PAGE}/trang
              </span>
            </div>
          )}
        </>
      )}

      {/* ═══ TAB: ALBUM ════════════════════════════════════════════════════ */}
      {tab === "albums" && (
        <ProTable
          rowKey="id"
          columns={albumColumns}
          rows={albums as AlbumRow[]}
          loading={loadingAlbums}
          exportable
          exportFilename="albums"
          onRefresh={() => void loadAlbums()}
          toolbar={{ title: `${albums.length} album`, actions: <Button type="button" onClick={() => setShowCreateAlbum(true)}>+ Tạo album</Button> }}
          emptyState={{ title: "Chưa có album", description: "Tạo album để tổ chức ảnh theo sự kiện.", action: <Button type="button" onClick={() => setShowCreateAlbum(true)}>Tạo album mới</Button> }}
        />
      )}

      {/* ═══ TAB: TẢI LÊN ══════════════════════════════════════════════════ */}
      {tab === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", maxWidth: 680 }}>
          {/* Drop zone */}
          <div
            className={`ml-drop${uploading ? "" : ""}`}
            onDragOver={(e) => { e.preventDefault(); }}
            onDragLeave={() => {}}
            onDrop={(e) => { e.preventDefault(); void doUpload(e.dataTransfer.files); }}
            onClick={() => { if (!uploading) document.getElementById("ml-file-input")?.click(); }}
            style={{ border: "2px dashed var(--color-border-subtle)", borderRadius: "var(--radius-md)", padding: "var(--spacing-xl)", textAlign: "center", cursor: uploading ? "default" : "pointer", transition: "all 0.15s", background: "var(--color-surface-card)", opacity: uploading ? 0.7 : 1 }}
          >
            <div style={{ width: 48, height: 48, borderRadius: "50%", background: "var(--color-surface-raised)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto var(--spacing-sm)" }}>
              {uploading ? (
                // Spinner inline SVG
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" style={{ color: "var(--color-primary)", animation: "ml-shimmer 1s linear infinite" }}>
                  <path d="M12 2a10 10 0 1 0 10 10" />
                </svg>
              ) : (
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--color-primary)" }}>
                  <polyline points="16 16 12 12 8 16"/>
                  <line x1="12" y1="12" x2="12" y2="21"/>
                  <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
                </svg>
              )}
            </div>
            {uploading ? (
              <>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-size-lg)", marginBottom: "var(--spacing-xs)" }}>
                  Đang tải lên {uploadDoneCount + uploadErrorCount + 1}/{uploadQueue.length}…
                </div>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                  {currentUploadingFile?.file.name}
                </div>
              </>
            ) : (
              <>
                <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-size-lg)", marginBottom: "var(--spacing-xs)" }}>Kéo thả ảnh vào đây</div>
                <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>hoặc <strong style={{ color: "var(--color-primary)" }}>chọn file</strong> — JPG, PNG, WebP · nhiều file cùng lúc</div>
              </>
            )}
            <input id="ml-file-input" type="file" accept="image/*" multiple hidden disabled={uploading} onChange={(e) => void doUpload(e.target.files)} />
          </div>

          {/* Upload config */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
            <FormField label="Gắn vào album">
              <Select options={albumOptions} value={uploadAlbumId} onChange={(e) => setUploadAlbumId(e.target.value)} disabled={uploading} />
            </FormField>
            <FormField label="Chú thích chung">
              <Input value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} placeholder="VD: Giỗ Tổ 2026" disabled={uploading} />
            </FormField>
          </div>

          {/* Upload queue list */}
          {uploadQueue.length > 0 && (
            <div style={{ background: "var(--color-surface-card)", borderRadius: "var(--radius-md)", border: "1px solid var(--color-border-subtle)", overflow: "hidden" }}>
              <div style={{ padding: "var(--spacing-sm) var(--spacing-md)", borderBottom: "1px solid var(--color-border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: 700 }}>
                  {uploadQueue.length} file · {uploadDoneCount} xong{uploadErrorCount > 0 ? ` · ${uploadErrorCount} lỗi` : ""}
                </span>
                {!uploading && <button type="button" onClick={() => setUploadQueue([])} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "12px", color: "var(--color-text-muted)" }}>Xóa danh sách</button>}
              </div>
              <div style={{ maxHeight: 240, overflowY: "auto" }}>
                {uploadQueue.map((item, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "center", gap: "var(--spacing-sm)", padding: "8px var(--spacing-md)", borderBottom: "1px solid var(--color-border-subtle)" }}>
                    <span style={{ fontSize: "14px" }}>
                      {item.status === "done" ? "✓" : item.status === "error" ? "✕" : item.status === "uploading" ? "↑" : "·"}
                    </span>
                    <span style={{ flex: 1, fontSize: "12px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.file.name}</span>
                    <span style={{ fontSize: "11px", color: item.status === "done" ? "var(--color-success, green)" : item.status === "error" ? "var(--color-danger, red)" : "var(--color-text-muted)", whiteSpace: "nowrap" }}>
                      {item.status === "done" ? `ID ${item.result?.photoId}` : item.status === "error" ? item.error : item.status === "uploading" ? "đang tải…" : `${(item.file.size / 1024).toFixed(0)} KB`}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Alert title="Sau khi tải lên" variant="info">
            Ảnh xuất hiện ngay trong thư viện và trang album trên{" "}
            <a href="/photos/" target="_blank" rel="noreferrer">cổng thông tin</a>.
          </Alert>
        </div>
      )}

      {/* ═══ LIGHTBOX ═════════════════════════════════════════════════════ */}
      {lightboxPhoto != null && (() => {
        const src = lightboxPhoto.url ?? "";
        const thumbSrc = lightboxPhoto.thumbUrl ?? src;
        const album = albums.find((a) => a.id === lightboxPhoto.albumId);
        return (
          <div
            role="dialog" aria-modal="true" aria-label="Xem ảnh"
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.88)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => { if (e.target === e.currentTarget) setLightboxPhoto(null); }}
          >
            <div style={{ display: "flex", maxWidth: 980, width: "95vw", maxHeight: "90vh", borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.6)" }}>
              <div style={{ flex: 1, background: "#111", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                {src ? (
                  <img src={src} alt={lightboxPhoto.caption ?? ""} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }}
                    onError={(e) => { if (lightboxPhoto.thumbUrl && e.currentTarget.src !== lightboxPhoto.thumbUrl) e.currentTarget.src = lightboxPhoto.thumbUrl; }}
                  />
                ) : thumbSrc ? (
                  <img src={thumbSrc} alt={lightboxPhoto.caption ?? ""} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, opacity: 0.3 }}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                      <circle cx="8.5" cy="8.5" r="1.5"/>
                      <polyline points="21 15 16 10 5 21"/>
                    </svg>
                    <span style={{ color: "white", fontSize: "12px" }}>Ảnh chưa load</span>
                  </div>
                )}
                <button type="button" onClick={lightboxPrev} disabled={lightboxIdx === 0} aria-label="Ảnh trước"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.5)", color: "white", border: "none", width: 40, height: 40, borderRadius: "50%", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: lightboxIdx === 0 ? 0.25 : 1 }}>‹</button>
                <button type="button" onClick={lightboxNext} disabled={lightboxIdx >= photos.length - 1} aria-label="Ảnh tiếp"
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.5)", color: "white", border: "none", width: 40, height: 40, borderRadius: "50%", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: lightboxIdx >= photos.length - 1 ? 0.25 : 1 }}>›</button>
                <button type="button" onClick={() => setLightboxPhoto(null)} aria-label="Đóng"
                  style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.6)", color: "white", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.5)", color: "white", fontSize: "11px", padding: "3px 10px", borderRadius: 12 }}>
                  {lightboxIdx + 1} / {photos.length}
                </div>
              </div>

              <div style={{ width: 260, flexShrink: 0, background: "#1a1a1a", color: "#e0e0e0", padding: "var(--spacing-md)", display: "flex", flexDirection: "column", gap: "var(--spacing-sm)", overflowY: "auto" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", color: "white", lineHeight: 1.4 }}>
                    {lightboxPhoto.caption ?? `Ảnh #${lightboxPhoto.id}`}
                  </div>
                  <div style={{ fontSize: "11px", color: "#777", marginTop: 3 }}>ID: {lightboxPhoto.id}</div>
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,.1)" }} />
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", marginBottom: 4 }}>Album</div>
                  {album ? (
                    <button type="button"
                      onClick={() => { handleAlbumSelect(album.id ?? null); setLightboxPhoto(null); setTab("photos"); }}
                      style={{ background: "none", border: "none", color: "#90CAF9", cursor: "pointer", fontSize: "13px", padding: 0, textAlign: "left" }}
                    >{album.title} →</button>
                  ) : (
                    <span style={{ fontSize: "13px", color: "#666" }}>Chưa gắn album</span>
                  )}
                </div>
                <div style={{ height: 1, background: "rgba(255,255,255,.1)" }} />
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", marginBottom: 6 }}>Liên kết</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <a href={album ? `/photos/album-${album.id}/` : "/photos/"} target="_blank" rel="noreferrer" style={{ fontSize: "12px", color: "#90CAF9", textDecoration: "none" }}>Xem trên cổng thông tin</a>
                    {src ? (
                      <button type="button" onClick={() => { navigator.clipboard.writeText(src).catch(() => undefined); setToast("Đã sao chép link."); }}
                        style={{ background: "none", border: "none", color: "#90CAF9", cursor: "pointer", fontSize: "12px", textAlign: "left", padding: 0 }}>Sao chép link ảnh</button>
                    ) : null}
                  </div>
                </div>
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {src ? (
                    <a href={src} download target="_blank" rel="noreferrer"
                      style={{ display: "block", padding: "8px", textAlign: "center", borderRadius: "var(--radius-sm)", background: "var(--color-primary)", color: "white", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}>Tải xuống</a>
                  ) : null}
                  <button type="button" disabled={busy}
                    onClick={() => void doDeletePhoto(lightboxPhoto.id)}
                    style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(198,40,40,.3)", background: "rgba(198,40,40,.15)", color: "#EF9A9A", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}>Xóa ảnh này</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ CREATE ALBUM ══════════════════════════════════════════════════ */}
      {showCreateAlbum && (
        <div role="dialog" aria-modal="true" aria-label="Tạo album mới"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowCreateAlbum(false); }}
        >
          <div style={{ background: "var(--color-surface-card)", borderRadius: "var(--radius-md)", padding: "var(--spacing-lg)", width: 400, boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "var(--font-size-lg)" }}>Tạo album mới</h2>
            <FormField label="Tên album" required>
              <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="VD: Giỗ Tổ 2026" autoFocus />
            </FormField>
            <FormField label="Mô tả">
              <Textarea rows={2} value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Mô tả ngắn…" />
            </FormField>
            <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-end" }}>
              <Button type="button" variant="secondary" onClick={() => setShowCreateAlbum(false)}>Hủy</Button>
              <Button type="button" disabled={busy || !newTitle.trim()} onClick={() => void doCreateAlbum()}>Tạo album</Button>
            </div>
          </div>
        </div>
      )}

      {/* ═══ EDIT ALBUM ════════════════════════════════════════════════════ */}
      {editAlbum != null && (
        <div role="dialog" aria-modal="true" aria-label="Sửa album"
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditAlbum(null); }}
        >
          <div style={{ background: "var(--color-surface-card)", borderRadius: "var(--radius-md)", padding: "var(--spacing-lg)", width: 400, boxShadow: "var(--shadow-lg)", display: "flex", flexDirection: "column", gap: "var(--spacing-md)" }}>
            <h2 style={{ fontFamily: "var(--font-display)", margin: 0, fontSize: "var(--font-size-lg)" }}>Sửa album</h2>
            <FormField label="Tên album" required>
              <Input value={editTitle} onChange={(e) => setEditTitle(e.target.value)} autoFocus />
            </FormField>
            <FormField label="Mô tả">
              <Textarea rows={2} value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
            </FormField>
            <div style={{ display: "flex", gap: "var(--spacing-sm)", justifyContent: "flex-end" }}>
              <Button type="button" variant="secondary" onClick={() => setEditAlbum(null)}>Hủy</Button>
              <Button type="button" disabled={busy || !editTitle.trim()} onClick={() => void doUpdateAlbum()}>Lưu</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
