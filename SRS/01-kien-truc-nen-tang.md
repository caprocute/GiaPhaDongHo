# SRS-01 — Kiến trúc & Nền tảng

## 1. Nền tảng công nghệ (xác định từ mã nguồn trang)

| Thành phần | Công nghệ | Bằng chứng |
|-----------|-----------|------------|
| CMS | **NukeViet 4.x** (PHP + MySQL, mã nguồn mở Việt Nam, GPL) | Link `wiki.nukeviet.vn`, cấu trúc `index.php?language=vi&nv=gia-pha&op=...`, social link facebook.com/nukeviet |
| Theme | `themes/hotoc` (theme chuyên biệt website họ tộc) | `/themes/hotoc/css/theme.bundle.min.css`, `custom.css`, `news.css`, `users.css`, `gia-pha.js` |
| JS | jQuery, Bootstrap, jquery.treeview (cây phả hệ), DOMPurify | `/assets/js/...`, `/themes/hotoc/js/...` |
| Font | Google Fonts: Be Vietnam Pro, Noto Serif | thẻ `<link>` fonts.googleapis.com |
| CDN/bảo vệ | Cloudflare (email protection `/cdn-cgi/l/email-protection`) | mã hoá email trong HTML |
| Module chính | `gia-pha` (module gia phả NukeViet), `news`, `photos`, `contact`, `users`, `seek` (tìm kiếm), `rss/feeds`, `statistics` | URL các trang |

## 2. Kiến trúc module (NukeViet)

- **FR-01.1** Hệ thống tổ chức theo **module độc lập**, mỗi module có route riêng (`nv=<module>&op=<operation>`) và được rewrite thành URL đẹp.
- **FR-01.2** Mỗi chuyên mục tin tức là một **module ảo** của module news: `thong-tin-dong-ho`, `hoat-dong-dong-ho`, `ho-hoang-bon-phuong`, `danh-nhan-guong-sang-dong-ho`, `thu-vien-tu-lieu`, `thong-bao`, `cong-duc-dong-ho`.
- **FR-01.3** Theme tách khỏi lõi: đổi giao diện không đổi dữ liệu; có biến thể responsive/mobile (`?nvvithemever=r`).
- **FR-01.4** Hỗ trợ đa ngôn ngữ ở tầng route (`language=vi`).

## 3. Kiến trúc dữ liệu gia phả (suy luận từ URL & màn hình)

- **FR-01.5** Hệ thống hỗ trợ **nhiều gia phả** (multi-tree): trang `/gia-pha/` là "Bản đồ gia phả theo tỉnh/thành phố" liệt kê 34+ tỉnh thành, mỗi tỉnh chứa nhiều gia phả. Gia phả định danh bằng cặp slug `{Họ}/{Chi-Thôn-Xã}`: `/gia-pha/Hoang/Thon-Trung-Binh-Bao-Ninh-Dong-Hoi/`.
- **FR-01.6** Mỗi thành viên có **mã hiệu** duy nhất trong gia phả: huyết thống `A1, A7, A18…`; vợ/chồng (dâu/rể) gắn hậu tố: `A7-sp1` (spouse 1) — hỗ trợ nhiều vợ/chồng (`-sp2`…).
- **FR-01.7** Mỗi gia phả gồm các thành phần văn bản: **Thông tin chung, Phả ký, Phả đồ, Tộc ước, Hương hỏa, Danh sách ngày giỗ**.
- **FR-01.8** Metadata gia phả: năm biên soạn, người biên soạn, người liên hệ, email; thống kê tự động: số đời, tổng thành viên, nam/nữ, đã mất, không rõ.

## 4. SEO & phân phối nội dung

- **FR-01.9** URL rewrite thân thiện toàn site (bài viết dạng `slug-{id}.html`).
- **FR-01.10** RSS từng chuyên mục (`/rss/<chuyen-muc>/`) + trang tổng feeds (`/feeds/`).
- **FR-01.11** Meta OpenGraph/schema cho bài viết (ảnh đại diện, thời gian xuất bản ISO, logo site).
- **FR-01.12** Favicon, logo tộc huy riêng (upload `/uploads/`).

## 5. Vận hành & bảo mật tầng nền

- **NFR-01.1** Cảnh báo bắt buộc bật JavaScript.
- **NFR-01.2** Phiên làm việc có timeout; hiển thị hộp thoại "duy trì trạng thái đăng nhập" đếm ngược 60 giây.
- **NFR-01.3** Chống bot thu thập email (mã hóa email phía client).
- **NFR-01.4** Làm sạch HTML đầu vào bằng DOMPurify (chống XSS).
- **NFR-01.5** Khu quản trị tách riêng tại `/admin/` (xem [12-quan-tri-crm-an.md](12-quan-tri-crm-an.md)).
