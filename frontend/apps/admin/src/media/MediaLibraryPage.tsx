import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@giapha/auth";
import {
  Alert,
  Badge,
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
  getPhotoUrl,
  listMediaAlbums,
  listMediaPhotosFiltered,
  updateMediaAlbum,
  uploadMediaPhoto,
  type MediaAlbumDto,
  type MediaPhotoDto,
  type UploadResponse,
} from "../api/mediaApi";
import { AdminPageHeader } from "../components/AdminPageHeader";

// ── CSS injection (hover effects) ──────────────────────────────────────────
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
    .ml-skel{animation:ml-shimmer 1.5s ease infinite;background:linear-gradient(90deg,var(--color-surface-raised) 0%,var(--color-surface-card) 50%,var(--color-surface-raised) 100%);background-size:200% 100%}
  `;
  document.head.appendChild(s);
}

// ── Types ───────────────────────────────────────────────────────────────────
type Tab = "photos" | "albums" | "upload";
type AlbumRow = MediaAlbumDto & Record<string, unknown>;

const PHOTO_PAGE = 24;
const ALBUM_LIMIT = 100;

export function MediaLibraryPage() {
  ensureMediaCss();
  const { getAccessToken } = useAuth();

  // ── Tab / view ──
  const [tab, setTab] = useState<Tab>("photos");

  // ── Data ──
  const [albums, setAlbums] = useState<MediaAlbumDto[]>([]);
  const [photos, setPhotos] = useState<MediaPhotoDto[]>([]);
  const [photoTotal, setPhotoTotal] = useState(0);
  const [photoTotalPages, setPhotoTotalPages] = useState(1);

  // ── Filters ──
  const [activeAlbumId, setActiveAlbumId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [photoPage, setPhotoPage] = useState(0);

  // ── Selection ──
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  // ── Lightbox ──
  const [lightboxPhoto, setLightboxPhoto] = useState<MediaPhotoDto | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  // ── Album modals ──
  const [showCreateAlbum, setShowCreateAlbum] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [editAlbum, setEditAlbum] = useState<MediaAlbumDto | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");

  // ── Upload ──
  const [uploadAlbumId, setUploadAlbumId] = useState("");
  const [uploadCaption, setUploadCaption] = useState("");
  const [lastUpload, setLastUpload] = useState<UploadResponse | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // ── Status ──
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  // ── Data loading ────────────────────────────────────────────────────────
  const loadAlbums = useCallback(async () => {
    const token = await getAccessToken();
    const res = await listMediaAlbums(token, 0, ALBUM_LIMIT);
    setAlbums(res.content);
  }, [getAccessToken]);

  const loadPhotos = useCallback(
    async (albumId: number | null, page: number) => {
      setLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        const res = await listMediaPhotosFiltered(token, { albumId, page, size: PHOTO_PAGE });
        setPhotos(res.content);
        setPhotoTotal(res.totalElements);
        setPhotoTotalPages(Math.max(1, res.totalPages));
      } catch (e) {
        setError(e instanceof ApiError ? e.message : "Không tải được ảnh.");
      } finally {
        setLoading(false);
      }
    },
    [getAccessToken],
  );

  const reload = useCallback(async () => {
    await Promise.all([loadAlbums(), loadPhotos(activeAlbumId, photoPage)]);
  }, [activeAlbumId, loadAlbums, loadPhotos, photoPage]);

  useEffect(() => {
    void reload();
  }, [reload]);

  useEffect(() => {
    setPhotoPage(0);
    setSelectedIds(new Set());
  }, [activeAlbumId]);

  // ── Lightbox keyboard nav ──────────────────────────────────────────────
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
    return photos.filter(
      (p) => p.caption?.toLowerCase().includes(q) || p.album?.title?.toLowerCase().includes(q),
    );
  }, [photos, searchQuery]);

  const albumOptions = useMemo(
    () => [
      { value: "", label: "— Không gắn album —" },
      ...albums.map((a) => ({ value: String(a.id), label: a.title })),
    ],
    [albums],
  );

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
      setNewTitle("");
      setNewDesc("");
      setShowCreateAlbum(false);
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
    if (!confirm(`Xóa album «${title}»? Ảnh trong album sẽ mất liên kết nhưng không bị xóa.`)) return;
    setBusy(true);
    try {
      const token = await getAccessToken();
      await deleteMediaAlbum(id, token);
      if (activeAlbumId === id) setActiveAlbumId(null);
      setToast("Đã xóa album.");
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Xóa album thất bại.");
    } finally {
      setBusy(false);
    }
  }

  async function doUpload(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setError(null);
    setLastUpload(null);
    try {
      const token = await getAccessToken();
      const albumId = uploadAlbumId ? Number(uploadAlbumId) : undefined;
      let last: UploadResponse | null = null;
      for (const file of Array.from(files)) {
        last = await uploadMediaPhoto(file, { albumId, caption: uploadCaption }, token);
      }
      setLastUpload(last);
      setUploadCaption("");
      setToast(`Đã tải lên ${files.length} ảnh.`);
      await reload();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Tải ảnh lên thất bại.");
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
        return url ? (
          <img
            src={url}
            alt=""
            style={{ width: 48, height: 48, objectFit: "cover", borderRadius: "var(--radius-sm)", display: "block" }}
          />
        ) : (
          <div style={{
            width: 48, height: 48, borderRadius: "var(--radius-sm)",
            background: "var(--color-surface-raised)",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem",
          }}>📁</div>
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
          <Button
            type="button"
            variant="secondary"
            onClick={() => { setActiveAlbumId(row.id as number); setTab("photos"); }}
          >
            Xem ảnh
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setEditAlbum(row as MediaAlbumDto);
              setEditTitle(row.title as string);
              setEditDesc((row.description as string | null | undefined) ?? "");
            }}
          >
            Sửa
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => void doDeleteAlbum(row.id as number, row.title as string)}
          >
            Xóa
          </Button>
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
            <Button type="button" variant="secondary" onClick={() => setShowCreateAlbum(true)}>
              📁 Album mới
            </Button>
            <Button type="button" onClick={() => setTab("upload")}>
              ⬆ Tải ảnh lên
            </Button>
          </div>
        }
      />

      {error ? <Alert title="Lỗi" variant="error">{error}</Alert> : null}
      {toast ? <Alert title="Xong" variant="success">{toast}</Alert> : null}

      {/* ── Stats row ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "var(--spacing-sm)", marginBottom: "var(--spacing-lg)" }}>
        {[
          { label: "Tổng ảnh", value: photoTotal, sub: "trong thư viện", color: "var(--color-primary)" },
          { label: "Số album", value: albums.length, sub: "album sự kiện & tư liệu" },
          { label: "Hiển thị", value: filteredPhotos.length, sub: activeAlbumId ? "ảnh trong album" : "ảnh trang này" },
          { label: "Đã chọn", value: selectedIds.size, sub: selectedIds.size > 0 ? "→ thanh thao tác" : "click ảnh để chọn" },
        ].map((c) => (
          <div key={c.label} style={{
            background: "var(--color-surface-card)", border: "1px solid var(--color-border-subtle)",
            borderRadius: "var(--radius-md)", padding: "var(--spacing-md)", boxShadow: "var(--shadow-sm)",
          }}>
            <div style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".6px", color: "var(--color-text-muted)", marginBottom: "var(--spacing-xs)" }}>{c.label}</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "22px", fontWeight: 700, color: c.color ?? "var(--color-text-default)" }}>
              {c.value.toLocaleString("vi-VN")}
            </div>
            <div style={{ fontSize: "11px", color: "var(--color-text-muted)", marginTop: 2 }}>{c.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Tab bar ── */}
      <div style={{ display: "flex", gap: 4, background: "var(--color-surface-raised)", padding: 5, borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-lg)", width: "fit-content" }} role="tablist">
        {([ ["photos", "🖼 Ảnh"], ["albums", "📁 Album"], ["upload", "⬆ Tải lên"] ] as [Tab, string][]).map(([k, lbl]) => (
          <button key={k} type="button" role="tab" aria-selected={tab === k} onClick={() => setTab(k)}
            style={{
              padding: "7px 18px", borderRadius: "var(--radius-sm)", border: "none",
              background: tab === k ? "var(--color-surface-card)" : "none",
              boxShadow: tab === k ? "var(--shadow-sm)" : "none",
              fontSize: "13px", fontWeight: 600, cursor: "pointer",
              color: tab === k ? "var(--color-text-default)" : "var(--color-text-muted)",
            }}
          >{lbl}</button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: ẢNH                                                          */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tab === "photos" && (
        <>
          {/* Album strip */}
          <div style={{ display: "flex", gap: "var(--spacing-sm)", overflowX: "auto", paddingBottom: "var(--spacing-xs)", marginBottom: "var(--spacing-md)" }}>
            {/* All-photos card */}
            {([
              { id: null as number | null, title: "Tất cả ảnh", coverObjectKey: null as string | null },
              ...albums.map((a) => ({ id: a.id ?? null, title: a.title, coverObjectKey: a.coverObjectKey ?? null })),
            ]).map((item) => {
              const isActive = activeAlbumId === item.id;
              const url = item.coverObjectKey ? getPhotoUrl(item.coverObjectKey) : "";
              return (
                <div
                  key={item.id ?? "all"}
                  className="ml-album-card"
                  role="button" tabIndex={0}
                  aria-pressed={isActive}
                  onClick={() => setActiveAlbumId(item.id)}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setActiveAlbumId(item.id); }}
                  style={{
                    flexShrink: 0, width: 130, borderRadius: "var(--radius-md)", overflow: "hidden",
                    border: `2px solid ${isActive ? "var(--color-primary)" : "var(--color-border-subtle)"}`,
                    cursor: "pointer", boxShadow: "var(--shadow-sm)", transition: "all 0.15s",
                    background: "var(--color-surface-card)",
                  }}
                >
                  <div style={{ height: 80, background: "var(--color-surface-raised)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {url ? (
                      <img src={url} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ fontSize: "1.8rem", opacity: 0.4 }}>{item.id == null ? "🗃" : "📁"}</span>
                    )}
                  </div>
                  <div style={{ padding: "6px 8px", borderTop: "1px solid var(--color-border-subtle)" }}>
                    <div style={{ fontSize: "11px", fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.title}</div>
                    {isActive && <div style={{ fontSize: "9px", color: "var(--color-primary)", fontWeight: 700, marginTop: 1 }}>Đang xem</div>}
                  </div>
                </div>
              );
            })}
            {/* Add album */}
            <div
              className="ml-album-card"
              role="button" tabIndex={0}
              onClick={() => setShowCreateAlbum(true)}
              onKeyDown={(e) => { if (e.key === "Enter") setShowCreateAlbum(true); }}
              style={{
                flexShrink: 0, width: 130, borderRadius: "var(--radius-md)",
                border: "2px dashed var(--color-border-subtle)", cursor: "pointer",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                gap: "var(--spacing-xs)", padding: "var(--spacing-md)",
                color: "var(--color-text-muted)", fontSize: "12px",
                background: "var(--color-surface-card)", transition: "all 0.15s",
              }}
            >
              <span style={{ fontSize: "1.5rem", opacity: 0.5 }}>+</span>
              <span>Tạo album</span>
            </div>
          </div>

          {/* Toolbar */}
          <div style={{ display: "flex", gap: "var(--spacing-sm)", alignItems: "center", marginBottom: "var(--spacing-md)", flexWrap: "wrap" }}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm chú thích, album…"
              style={{ width: 220 }}
              aria-label="Tìm ảnh"
            />
            {activeAlbumId != null && (
              <Badge tone="default">
                {albums.find((a) => a.id === activeAlbumId)?.title ?? "Album"}
                <button
                  type="button"
                  onClick={() => setActiveAlbumId(null)}
                  aria-label="Bỏ lọc album"
                  style={{ background: "none", border: "none", cursor: "pointer", marginLeft: 4, color: "inherit" }}
                >✕</button>
              </Badge>
            )}
            <span style={{ fontSize: "13px", color: "var(--color-text-muted)", marginLeft: "auto" }}>
              {filteredPhotos.length} ảnh{activeAlbumId ? " trong album" : ""}
            </span>
            <Button type="button" variant="secondary" onClick={() => void reload()} aria-label="Tải lại">↻</Button>
          </div>

          {/* Selection bar */}
          {selectedIds.size > 0 && (
            <div style={{
              display: "flex", alignItems: "center", gap: "var(--spacing-sm)",
              padding: "var(--spacing-sm) var(--spacing-md)",
              background: "color-mix(in srgb,var(--color-primary) 8%,var(--color-surface-card))",
              border: "1px solid color-mix(in srgb,var(--color-primary) 30%,var(--color-border-subtle))",
              borderRadius: "var(--radius-md)", marginBottom: "var(--spacing-md)",
            }}>
              <span style={{ flex: 1, fontSize: "13px", fontWeight: 600 }}>Đã chọn {selectedIds.size} ảnh</span>
              <Button type="button" variant="secondary" onClick={() => setSelectedIds(new Set())}>Bỏ chọn</Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setSelectedIds(new Set(filteredPhotos.map((p) => p.id!).filter(Boolean)))}
              >
                Chọn tất cả
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busy}
                onClick={() => void doDeleteSelected()}
              >
                🗑 Xóa {selectedIds.size} ảnh
              </Button>
            </div>
          )}

          {/* Photo grid */}
          {loading ? (
            <div style={{ display: "grid", gap: "var(--spacing-sm)", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
              {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="ml-skel" style={{ aspectRatio: "1", borderRadius: "var(--radius-sm)", background: "var(--color-surface-raised)" }} />
              ))}
            </div>
          ) : filteredPhotos.length === 0 ? (
            <div style={{ padding: "var(--spacing-xl)", textAlign: "center", color: "var(--color-text-muted)" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "var(--spacing-sm)" }}>🖼</div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-size-lg)", marginBottom: "var(--spacing-xs)" }}>
                {activeAlbumId ? "Album này chưa có ảnh" : "Chưa có ảnh nào"}
              </div>
              <div style={{ fontSize: "13px", marginBottom: "var(--spacing-md)" }}>
                Tải ảnh lên để bổ sung thư viện tư liệu dòng họ.
              </div>
              <Button type="button" onClick={() => setTab("upload")}>Tải ảnh lên</Button>
            </div>
          ) : (
            <div style={{ display: "grid", gap: "var(--spacing-sm)", gridTemplateColumns: "repeat(auto-fill,minmax(150px,1fr))" }}>
              {filteredPhotos.map((photo, idx) => {
                const url = photo.objectKey ? getPhotoUrl(photo.objectKey) : "";
                const isSel = photo.id != null && selectedIds.has(photo.id);
                return (
                  <div
                    key={photo.id}
                    className="ml-card"
                    role="button" tabIndex={0}
                    aria-label={photo.caption ?? `Ảnh #${photo.id}`}
                    onClick={() => { setLightboxPhoto(photo); setLightboxIdx(idx); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") { setLightboxPhoto(photo); setLightboxIdx(idx); }
                    }}
                    style={{
                      position: "relative", aspectRatio: "1", borderRadius: "var(--radius-sm)",
                      overflow: "hidden", cursor: "pointer",
                      border: `2px solid ${isSel ? "var(--color-primary)" : "transparent"}`,
                      boxShadow: isSel
                        ? "0 0 0 3px color-mix(in srgb,var(--color-primary) 25%,transparent)"
                        : "var(--shadow-sm)",
                      background: "var(--color-surface-raised)", transition: "border-color 0.15s,box-shadow 0.15s",
                    }}
                  >
                    {url ? (
                      <img src={url} alt={photo.caption ?? ""} loading="lazy"
                        style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                    ) : (
                      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", color: "var(--color-text-muted)" }}>🖼</div>
                    )}

                    {/* Hover overlay */}
                    <div className="ml-ov" style={{
                      position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)",
                      opacity: 0, transition: "opacity 0.15s",
                      display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 6,
                    }}>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          aria-label={isSel ? "Bỏ chọn" : "Chọn ảnh"}
                          onClick={(e) => { e.stopPropagation(); if (photo.id != null) toggleSelect(photo.id); }}
                          style={{
                            width: 20, height: 20, borderRadius: "50%",
                            background: isSel ? "var(--color-primary)" : "rgba(255,255,255,0.85)",
                            border: "2px solid white", cursor: "pointer",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: "10px", color: isSel ? "white" : "transparent",
                          }}
                        >✓</button>
                      </div>
                      <div style={{ fontSize: "10px", color: "white", fontWeight: 600, lineHeight: 1.3, textShadow: "0 1px 2px rgba(0,0,0,.8)" }}>
                        {photo.caption ? photo.caption.slice(0, 50) : `#${photo.id}`}
                      </div>
                    </div>

                    {/* Album badge (when viewing all) */}
                    {photo.album?.title && activeAlbumId == null ? (
                      <div style={{ position: "absolute", bottom: 5, right: 5, background: "rgba(0,0,0,.65)", color: "white", fontSize: "9px", fontWeight: 700, padding: "1px 5px", borderRadius: 8 }}>
                        {photo.album.title.slice(0, 12)}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {photoTotalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", gap: "var(--spacing-xs)", marginTop: "var(--spacing-lg)", alignItems: "center" }}>
              <Button type="button" variant="secondary" disabled={photoPage === 0} onClick={() => setPhotoPage((p) => p - 1)}>‹ Trước</Button>
              <span style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
                Trang {photoPage + 1} / {photoTotalPages} · {photoTotal.toLocaleString("vi-VN")} ảnh
              </span>
              <Button type="button" variant="secondary" disabled={photoPage >= photoTotalPages - 1} onClick={() => setPhotoPage((p) => p + 1)}>Tiếp ›</Button>
            </div>
          )}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: ALBUM                                                         */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tab === "albums" && (
        <ProTable
          rowKey="id"
          columns={albumColumns}
          rows={albums as AlbumRow[]}
          loading={loading}
          exportable
          exportFilename="albums"
          onRefresh={() => void loadAlbums()}
          toolbar={{
            title: `${albums.length} album`,
            actions: (
              <Button type="button" onClick={() => setShowCreateAlbum(true)}>+ Tạo album</Button>
            ),
          }}
          emptyState={{
            title: "Chưa có album",
            description: "Tạo album để tổ chức ảnh theo sự kiện dòng họ.",
            action: <Button type="button" onClick={() => setShowCreateAlbum(true)}>Tạo album mới</Button>,
          }}
        />
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* TAB: TẢI LÊN                                                       */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {tab === "upload" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-md)", maxWidth: 680 }}>
          {/* Drop zone */}
          <div
            className={`ml-drop${dragOver ? " over" : ""}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => { e.preventDefault(); setDragOver(false); void doUpload(e.dataTransfer.files); }}
            onClick={() => document.getElementById("ml-file-input")?.click()}
            style={{
              border: "2px dashed var(--color-border-subtle)", borderRadius: "var(--radius-md)",
              padding: "var(--spacing-xl)", textAlign: "center", cursor: "pointer",
              transition: "all 0.15s", background: "var(--color-surface-card)",
            }}
          >
            <div style={{ fontSize: "2.5rem", marginBottom: "var(--spacing-sm)", opacity: 0.6 }}>📤</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: "var(--font-size-lg)", marginBottom: "var(--spacing-xs)" }}>
              Kéo thả ảnh vào đây
            </div>
            <div style={{ fontSize: "13px", color: "var(--color-text-muted)" }}>
              hoặc <strong style={{ color: "var(--color-primary)" }}>chọn file</strong> — JPG, PNG, WebP · nhiều file cùng lúc
            </div>
            <input
              id="ml-file-input"
              type="file"
              accept="image/*"
              multiple
              hidden
              disabled={busy}
              onChange={(e) => void doUpload(e.target.files)}
            />
          </div>

          {/* Upload options */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
            <FormField label="Gắn vào album">
              <Select options={albumOptions} value={uploadAlbumId} onChange={(e) => setUploadAlbumId(e.target.value)} />
            </FormField>
            <FormField label="Chú thích chung">
              <Input
                value={uploadCaption}
                onChange={(e) => setUploadCaption(e.target.value)}
                placeholder="VD: Giỗ Tổ 2026 — lễ dâng hương"
              />
            </FormField>
          </div>

          {lastUpload ? (
            <Alert title="Tải lên thành công" variant="success">
              Ảnh #{lastUpload.photoId} đã lưu.{" "}
              <a href={lastUpload.presignedGetUrl} target="_blank" rel="noreferrer" style={{ color: "var(--color-primary)" }}>Xem ảnh</a>
            </Alert>
          ) : null}

          <Alert title="Sau khi tải lên" variant="info">
            Ảnh xuất hiện ngay trong thư viện và trang album trên{" "}
            <a href="/photos/" target="_blank" rel="noreferrer">cổng thông tin</a>.
            Mở ảnh trong tab Ảnh để gắn thẻ thành viên trong ảnh.
          </Alert>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* LIGHTBOX MODAL                                                     */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {lightboxPhoto != null && (() => {
        const url = lightboxPhoto.objectKey ? getPhotoUrl(lightboxPhoto.objectKey) : "";
        return (
          <div
            role="dialog" aria-modal="true" aria-label="Xem ảnh"
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.87)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}
            onClick={(e) => { if (e.target === e.currentTarget) setLightboxPhoto(null); }}
          >
            <div style={{ display: "flex", maxWidth: 980, width: "95vw", maxHeight: "90vh", borderRadius: "var(--radius-md)", overflow: "hidden", boxShadow: "0 24px 64px rgba(0,0,0,.6)" }}>
              {/* Photo side */}
              <div style={{ flex: 1, background: "#111", position: "relative", display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400 }}>
                {url ? (
                  <img src={url} alt={lightboxPhoto.caption ?? ""} style={{ maxWidth: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
                ) : (
                  <div style={{ fontSize: "4rem", opacity: 0.2 }}>🖼</div>
                )}

                {/* Prev / Next */}
                <button type="button" onClick={lightboxPrev} disabled={lightboxIdx === 0} aria-label="Ảnh trước"
                  style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.5)", color: "white", border: "none", width: 40, height: 40, borderRadius: "50%", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: lightboxIdx === 0 ? 0.25 : 1 }}>‹</button>
                <button type="button" onClick={lightboxNext} disabled={lightboxIdx >= photos.length - 1} aria-label="Ảnh tiếp"
                  style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,.5)", color: "white", border: "none", width: 40, height: 40, borderRadius: "50%", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: lightboxIdx >= photos.length - 1 ? 0.25 : 1 }}>›</button>

                {/* Close */}
                <button type="button" onClick={() => setLightboxPhoto(null)} aria-label="Đóng"
                  style={{ position: "absolute", top: 10, right: 10, background: "rgba(0,0,0,.6)", color: "white", border: "none", width: 32, height: 32, borderRadius: "50%", cursor: "pointer", fontSize: "18px", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>

                {/* Index indicator */}
                <div style={{ position: "absolute", bottom: 10, left: "50%", transform: "translateX(-50%)", background: "rgba(0,0,0,.5)", color: "white", fontSize: "11px", padding: "3px 10px", borderRadius: 12 }}>
                  {lightboxIdx + 1} / {photos.length}
                </div>
              </div>

              {/* Metadata sidebar */}
              <div style={{ width: 260, flexShrink: 0, background: "#1a1a1a", color: "#e0e0e0", padding: "var(--spacing-md)", display: "flex", flexDirection: "column", gap: "var(--spacing-sm)", overflowY: "auto" }}>
                <div>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: "15px", color: "white", lineHeight: 1.4 }}>
                    {lightboxPhoto.caption ?? `Ảnh #${lightboxPhoto.id}`}
                  </div>
                  <div style={{ fontSize: "11px", color: "#777", marginTop: 3 }}>ID: {lightboxPhoto.id}</div>
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,.1)" }} />

                {/* Album link */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", marginBottom: 4 }}>Album</div>
                  {lightboxPhoto.album ? (
                    <button type="button"
                      onClick={() => { setActiveAlbumId(lightboxPhoto.album?.id ?? null); setLightboxPhoto(null); setTab("photos"); }}
                      style={{ background: "none", border: "none", color: "#90CAF9", cursor: "pointer", fontSize: "13px", padding: 0, textAlign: "left" }}
                    >
                      {lightboxPhoto.album.title} →
                    </button>
                  ) : (
                    <span style={{ fontSize: "13px", color: "#666" }}>Chưa gắn album</span>
                  )}
                </div>

                <div style={{ height: 1, background: "rgba(255,255,255,.1)" }} />

                {/* Cross-module links */}
                <div>
                  <div style={{ fontSize: "11px", fontWeight: 700, color: "#aaa", marginBottom: 6 }}>Liên kết</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                    <a
                      href={lightboxPhoto.album ? `/photos/album-${lightboxPhoto.album.id}/` : "/photos/"}
                      target="_blank" rel="noreferrer"
                      style={{ fontSize: "12px", color: "#90CAF9", textDecoration: "none" }}
                    >🌐 Xem trên cổng thông tin</a>
                    {url ? (
                      <button type="button"
                        onClick={() => { navigator.clipboard.writeText(url).catch(() => undefined); setToast("Đã sao chép link."); }}
                        style={{ background: "none", border: "none", color: "#90CAF9", cursor: "pointer", fontSize: "12px", textAlign: "left", padding: 0 }}
                      >📋 Sao chép link ảnh</button>
                    ) : null}
                    <button type="button"
                      onClick={() => { setLightboxPhoto(null); setTab("photos"); }}
                      style={{ background: "none", border: "none", color: "#90CAF9", cursor: "pointer", fontSize: "12px", textAlign: "left", padding: 0 }}
                    >🏷 Gắn tag thành viên (xem trong tab Ảnh)</button>
                  </div>
                </div>

                {/* View count */}
                {lightboxPhoto.viewCount != null ? (
                  <>
                    <div style={{ height: 1, background: "rgba(255,255,255,.1)" }} />
                    <div style={{ fontSize: "12px", color: "#aaa" }}>
                      Lượt xem: <strong style={{ color: "#e0e0e0" }}>{lightboxPhoto.viewCount.toLocaleString("vi-VN")}</strong>
                    </div>
                  </>
                ) : null}

                {/* Actions */}
                <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 6 }}>
                  {url ? (
                    <a href={url} download target="_blank" rel="noreferrer"
                      style={{ display: "block", padding: "8px", textAlign: "center", borderRadius: "var(--radius-sm)", background: "var(--color-primary)", color: "white", fontSize: "12px", fontWeight: 600, textDecoration: "none" }}
                    >📥 Tải xuống</a>
                  ) : null}
                  <button type="button" disabled={busy}
                    onClick={() => { if (lightboxPhoto.id != null) void doDeletePhoto(lightboxPhoto.id); }}
                    style={{ padding: "8px", borderRadius: "var(--radius-sm)", border: "1px solid rgba(198,40,40,.3)", background: "rgba(198,40,40,.15)", color: "#EF9A9A", fontSize: "12px", fontWeight: 600, cursor: "pointer" }}
                  >🗑 Xóa ảnh này</button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* CREATE ALBUM MODAL                                                 */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {showCreateAlbum && (
        <div
          role="dialog" aria-modal="true" aria-label="Tạo album mới"
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

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* EDIT ALBUM MODAL                                                   */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      {editAlbum != null && (
        <div
          role="dialog" aria-modal="true" aria-label="Sửa album"
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
