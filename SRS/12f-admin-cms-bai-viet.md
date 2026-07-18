# SRS-12f — Quản trị CMS: chuyên mục & soạn bài viết

**Version:** 1.0 · 2026-07-19  
**Liên kết:** SRS-06 (FR-06.*), FR-12.11–12.12, FR-08 (media), TK-08, mockup `instruction/mockups/admin-posts.html`  
**Rule:** `.cursor/rules/data-provenance-admin.mdc`, `no-tech-jargon-on-ui`

---

## 0. Nguyên tắc

1. **Chuyên mục là master data** do thư ký CRUD — không hardcode menu portal theo tên tiếng Việt trong code FE (trừ fallback tạm khi API trống).
2. **Liên kết portal = `CmsCategory.slug`** — URL công khai suy ra từ slug đã lưu, không đoán từ tiêu đề bài.
3. **Một bài thuộc đúng một chuyên mục** (FK `CmsPost.category`) — chọn tường minh khi soạn.
4. **Ảnh/video trong bài lấy từ Thư viện media** (hoặc URL ngoài tường minh) — không upload “mù” ngoài kho.
5. Chữ trên UI: ngôn ngữ nghiệp vụ (Ban biên tập, chuyên mục, xuất bản…).

---

## 1. Mục tiêu & phạm vi

| Trong phạm vi (bản này) | Ngoài phạm vi (sau) |
|-------------------------|---------------------|
| CRUD chuyên mục + seed chuẩn SRS-06 | Phân quyền biên tập theo từng chuyên mục |
| Portal: hub tin + trang theo chuyên mục | RSS / OpenGraph đầy đủ |
| Soạn bài TipTap đủ công cụ + chèn media | Hẹn giờ đăng / bài nổi bật trang chủ |
| Xem trước kiểu cổng trong admin | Preview token công khai cho nháp |
| Ảnh đại diện bài từ thư viện | Trang tĩnh Page (Giới thiệu pháp lý) |

---

## 2. Mô hình liên kết chuyên mục ↔ portal

```text
Admin CRUD CmsCategory
        │  slug (duy nhất), name, sortOrder, visibleOnNav, description, layout
        ▼
GET /api/v1/categories  ──► Portal: lọc chuyên mục hiện menu / trang hub
        │
Admin soạn CmsPost ──FK──► category_id
        │  status=published
        ▼
GET /api/v1/posts?category={slug}  ──► /tin/{slug}   (danh sách theo chuyên mục)
GET /api/v1/posts/{postSlug}       ──► /news/{postSlug}  (chi tiết — slug bài toàn cục)
```

### 2.1 Quy tắc URL

| Bề mặt | Path | Nguồn dữ liệu |
|--------|------|----------------|
| Hub tin | `/news` | Mọi bài `published` |
| Theo chuyên mục | `/tin/{categorySlug}` | `category` query = slug chuyên mục; 404 nếu slug không tồn tại |
| Chi tiết bài | `/news/{postSlug}` | Bài published theo slug bài; breadcrumb lấy `post.category` |
| Nav chính | «Tin tức» → `/news` | Cố định nghiệp vụ |
| Nav phụ / hub | Danh sách chuyên mục `visibleOnNav=true` | API categories, sắp `sortOrder` |

**Cấm:** map cứng `/thong-tin-dong-ho` trong FE mà không có bản ghi category tương ứng.

### 2.2 Chuyên mục chuẩn (seed lần đầu — có thể sửa/ẩn sau)

| slug | Tên | layout gợi ý |
|------|-----|--------------|
| `thong-tin-dong-ho` | Thông tin dòng họ | `article` |
| `hoat-dong-dong-ho` | Hoạt động dòng họ | `article` |
| `thong-bao` | Thông báo | `notice` |
| `ho-hoang-bon-phuong` | Họ Hoàng bốn phương | `article` |
| `danh-nhan-guong-sang-dong-ho` | Danh nhân – Gương sáng | `portrait` |
| `thu-vien-tu-lieu` | Thư viện – Tư liệu | `document` |

«Công đức dòng họ» **không** là chuyên mục tin — thuộc module quỹ (SRS-12b).

### 2.3 Trường `CmsCategory`

| Field | Bắt buộc | Ghi chú |
|-------|----------|---------|
| id | hệ thống | |
| slug | có | URL segment; đổi slug = đổi path `/tin/{slug}` (admin cảnh báo) |
| name | có | Nhãn UI |
| description | không | Lead trang chuyên mục |
| layout | không | Gợi ý trình bày (`article` / `notice` / …) — portal có thể dùng sau |
| sortOrder | có | Thứ tự menu (số nhỏ trước) |
| visibleOnNav | có | Hiện trên hub / nav phụ |

### 2.4 Trường bổ sung `CmsPost`

| Field | Bắt buộc | Ghi chú |
|-------|----------|---------|
| coverObjectKey | không | Ảnh đại diện — `MediaPhoto.objectKey` hoặc key MinIO đã có trong thư viện |
| (các field cũ) | | slug, title, summary, bodyHtml, status, publishedAt, viewCount, authorName, category |

---

## 3. Luồng nguồn → đích

| Thao tác | Nguồn | Đích |
|----------|-------|------|
| Thêm chuyên mục | Form admin | `CmsCategory` + xuất hiện `/tin/{slug}` khi có bài |
| Ẩn chuyên mục (`visibleOnNav=false`) | Admin | Không hiện hub/nav; URL `/tin/{slug}` vẫn đọc được nếu biết slug |
| Viết bài + chọn chuyên mục | Form soạn | `CmsPost` FK category |
| Chèn ảnh/video | Thư viện / URL | HTML trong `bodyHtml` (`img` / iframe YouTube) |
| Xuất bản | status → published | Portal hub + trang chuyên mục |
| Xem trước (admin) | Form hiện tại (chưa lưu cũng được) | Pane «Xem trước» style cổng — **không** công bố |

---

## 4. API

### 4.1 Công khai (đã có / mở rộng)

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/api/v1/categories` | Chỉ category `visibleOnNav` (hoặc toàn bộ nếu không filter — bản này: **chỉ hiện nav**, kèm field đủ) |
| GET | `/api/v1/posts?category=&query=` | Bài published |
| GET | `/api/v1/posts/{slug}` | Chi tiết published |

### 4.2 Admin (JHipster CRUD + UI)

| Method | Path | Mô tả |
|--------|------|--------|
| GET/POST/PUT/DELETE | `/api/cms-categories` | CRUD chuyên mục |
| GET/POST/PUT/DELETE | `/api/cms-posts` | CRUD bài |
| GET | `/api/v1/media/gallery/...` + upload | Chọn / tải ảnh vào thư viện rồi chèn |

---

## 5. UI Admin — soạn bài (mục tiêu UX)

### 5.1 Bố cục (bám mockup + tối ưu viết)

- Cột chính (~70%): tiêu đề lớn → slug → tóm tắt → **tabs Soạn | Xem trước** → TipTap full chiều cao.
- Cột phụ: trạng thái xuất bản, chuyên mục (bắt buộc khi xuất bản), ảnh đại diện (chọn từ thư viện), bút danh, liên kết «Xem trên cổng» (chỉ khi đã published).

### 5.2 TipTap — thanh công cụ tối thiểu

Đậm, nghiêng, gạch ngang, H2/H3, danh sách, trích dẫn, liên kết, **chèn ảnh (thư viện)**, **chèn video YouTube (URL)**, hoàn tác/làm lại.  
Chiều cao soạn ≥ 420px; sticky toolbar khi cuộn.

### 5.3 Dialog thư viện media

- Lưới ảnh từ gallery API; chọn → chèn `<img src="…" alt="…">` tại con trỏ.
- Nút «Tải lên» trong dialog → `POST /api/v1/media/upload` rồi chèn ngay.
- Video: prompt URL YouTube → node embed an toàn (domain youtube.com / youtu.be).

### 5.4 Xem trước

- Pane dùng class tương đương prose portal (font display tiêu đề, meta giả lập, body HTML).
- Không gọi API publish; nhãn «Bản xem trước — chưa công bố» nếu status ≠ published.

### 5.5 Quản lý chuyên mục

- Trên màn danh sách bài (sidebar) hoặc dialog «Quản lý chuyên mục»: thêm / sửa tên·slug·thứ tự·hiện menu / xóa khi không còn bài.
- Empty state nếu chưa có chuyên mục: bắt buộc tạo trước khi xuất bản bài.

---

## 6. Portal

1. `/news` — hub + chip chuyên mục từ API.
2. `/tin/[categorySlug]` — danh sách lọc; lead = `category.description`.
3. `/news/[postSlug]` — chi tiết; breadcrumb: Trang chủ → Tin tức → {tên chuyên mục} → tiêu đề.
4. Ảnh trong `bodyHtml` và cover hiển thị khi URL public/presigned còn hiệu lực.

---

## 7. Lệch hiện trạng → yêu cầu

| Hiện trạng | Yêu cầu |
|------------|---------|
| Fake category tiếng Anh; không UI CRUD | Seed VI + CRUD admin |
| Portal chỉ `/news` — không trang theo slug chuyên mục | Thêm `/tin/{slug}` |
| TipTap StarterKit tối giản | + Link, Image, YouTube, media picker |
| Không preview cổng | Tab Xem trước |
| Không cover / chèn media | coverObjectKey + chèn từ thư viện |
| Nav cứng 1 mục Tin tức | Hub + chip từ categories API |

---

## 8. UAT chấp nhận

1. Seed/CRUD chuyên mục `thong-bao` → `/tin/thong-bao` hiện đúng tên & lead.
2. Đổi tên chuyên mục → portal đổi theo; slug đổi → path đổi (cảnh báo admin).
3. Xuất bản bài gắn chuyên mục → xuất hiện hub và trang chuyên mục; không gắn → không cho published (validate).
4. Chèn ảnh từ thư viện → thấy trong preview và trên cổng sau publish.
5. Chèn YouTube → iframe trong preview/portal.
6. Tab Xem trước phản ánh title/body đang soạn trước khi lưu.
7. `visibleOnNav=false` → không còn chip hub; URL trực tiếp vẫn mở nếu có bài.

---

## 9. Trace

| Mã | Nội dung |
|----|----------|
| FR-06.1–06.3, 06.8–06.9 | Danh sách / chi tiết / WYSIWYG / chuyên mục |
| FR-12.11–12.12 | CRUD bài + chuyên mục admin |
| FR-08 | Thư viện ảnh tái dùng |
| FR-12f.* | Các mục §2–§6 tài liệu này |
