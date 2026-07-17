# SRS TỔNG HỢP — Website Gia Phả Dòng Họ (phân tích từ hohoangtrungbinh.com)

> Tài liệu đặc tả yêu cầu phần mềm (SRS) được xây dựng bằng phương pháp **reverse-engineering** trang https://hohoangtrungbinh.com/ — trang chính thức của Họ Hoàng thôn Trung Bính (Bảo Ninh, Đồng Hới, Quảng Trị).
> Ngày phân tích: 16/07/2026.

## 1. Tổng quan hệ thống

Website là **cổng thông tin dòng họ (họ tộc)** kết hợp 2 khối chức năng lớn:

1. **Khối Gia phả (lõi nghiệp vụ)**: quản lý cây phả hệ 13 đời / 1.586 thành viên, phả đồ trực quan, ngày giỗ âm lịch, phả ký, tộc ước, hương hỏa, xuất bản gia phả (PDF/Excel).
2. **Khối Cổng thông tin (CMS)**: tin tức hoạt động dòng họ, thông báo, danh nhân, thư viện tư liệu, album ảnh, bảng vàng công đức, liên hệ, tìm kiếm, RSS.

**Nền tảng thực tế**: NukeViet CMS 4.x (mã nguồn mở Việt Nam, GPL) + module `gia-pha` + theme `hotoc` (giao diện đặc thù họ tộc: đỏ – vàng, hoa văn rồng, logo tộc huy). Chi tiết tại [01-kien-truc-nen-tang.md](01-kien-truc-nen-tang.md).

## 2. Danh mục tính năng (chia theo file chi tiết)

| # | Nhóm tính năng | File chi tiết | Mức độ |
|---|----------------|---------------|--------|
| 1 | Kiến trúc & nền tảng (NukeViet, theme, SEO, đa gia phả) | [01-kien-truc-nen-tang.md](01-kien-truc-nen-tang.md) | Nền tảng |
| 2 | Trang chủ & các khối hiển thị | [02-trang-chu.md](02-trang-chu.md) | Cao |
| 3 | Gia phả — hồ sơ thành viên & dữ liệu phả hệ | [03-gia-pha-ho-so-thanh-vien.md](03-gia-pha-ho-so-thanh-vien.md) | **Lõi** |
| 4 | Phả đồ trực quan (chart/tree, zoom, xuất SVG/PNG/PDF) | [04-pha-do-truc-quan.md](04-pha-do-truc-quan.md) | **Lõi** |
| 5 | Ngày giỗ âm lịch | [05-ngay-gio-am-lich.md](05-ngay-gio-am-lich.md) | **Lõi** |
| 6 | Tin tức & quản lý nội dung (6 chuyên mục) | [06-tin-tuc-noi-dung.md](06-tin-tuc-noi-dung.md) | Cao |
| 7 | Công đức dòng họ (bảng vàng, tài khoản quỹ) | [07-cong-duc.md](07-cong-duc.md) | Trung bình |
| 8 | Thư viện tư liệu & Album ảnh | [08-thu-vien-album-anh.md](08-thu-vien-album-anh.md) | Trung bình |
| 9 | Tìm kiếm (toàn site + trong gia phả) | [09-tim-kiem.md](09-tim-kiem.md) | Cao |
| 10 | Thành viên, tài khoản, 2FA | [10-thanh-vien-tai-khoan.md](10-thanh-vien-tai-khoan.md) | Cao |
| 11 | Liên hệ & tương tác (bình luận, RSS, mạng xã hội) | [11-lien-he-tuong-tac.md](11-lien-he-tuong-tac.md) | Trung bình |
| 12 | **Quản trị / CRM ẩn** (suy luận từ nền tảng & dữ liệu) | [12-quan-tri-crm-an.md](12-quan-tri-crm-an.md) | **Lõi** |
| 12a | Soạn phả đồ (Admin Tree Editor) | [12a-admin-soan-pha-do.md](12a-admin-soan-pha-do.md) | **Lõi** |
| 12b | **Cấu hình hệ thống** (13 mục settings, SMTP/Zalo/PII…) | [12b-admin-cau-hinh.md](12b-admin-cau-hinh.md) | **Lõi · RP** |
| 13 | Giao diện & trải nghiệm người dùng | [13-giao-dien-ux.md](13-giao-dien-ux.md) | Cao |
| 14 | Nghiên cứu mã nguồn mở tương đương | [14-nghien-cuu-opensource.md](14-nghien-cuu-opensource.md) | Nghiên cứu |
| 15 | **Production & go-live** (portal/CRM/ATTT/vận hành/UAT) | [15-production-go-live.md](15-production-go-live.md) | **Lõi · RP** |

## 3. Số liệu hiện trạng (quan sát 16/07/2026)

- 1.586 thành viên, 13 đời, 769 nam / 817 nữ, 387 đã mất, 1.115 "không rõ".
- Tổng lượt truy cập: ~145.000; ~22.400 lượt/tháng; ~7–25 người online.
- 3 album ảnh, ~20 bài viết trên 6 chuyên mục, biên soạn gia phả năm 2025.

## 4. Vai trò người dùng (actor)

| Actor | Mô tả | Kênh truy cập |
|-------|-------|---------------|
| Khách vãng lai | Xem toàn bộ nội dung công khai, tra cứu phả đồ, tìm kiếm | Web công khai |
| Thành viên đăng ký | Đăng nhập (hỗ trợ 2FA), bình luận, gửi liên hệ | `/users/` |
| Ban biên tập (editor) | Soạn/duyệt bài viết, quản lý album (bút danh "Ban biên tập", "tuanhk") | `/admin/` (ẩn) |
| Quản trị gia phả (tộc trưởng/thư ký) | CRUD thành viên phả hệ, phả ký, tộc ước, hương hỏa, ngày giỗ | `/admin/` (ẩn) |
| Quản trị hệ thống | Cấu hình site, module, theme, backup, bảo mật | `/admin/` (ẩn) |

## 5. Yêu cầu phi chức năng nổi bật

- **NFR-01** Tiếng Việt là ngôn ngữ chính; kiến trúc hỗ trợ đa ngôn ngữ (`language=vi`).
- **NFR-02** URL thân thiện SEO (rewrite: `/gia-pha/Hoang/Thon-Trung-Binh-Bao-Ninh-Dong-Hoi/A7/`).
- **NFR-03** Responsive, có cơ chế chuyển giao diện mobile (`?nvvithemever=r`).
- **NFR-04** Bảo mật: 2FA cho thành viên, che email chống bot (Cloudflare email-protection), CSP qua DOMPurify, phiên tự hết hạn kèm cảnh báo duy trì đăng nhập (60s).
- **NFR-05** Lịch âm – dương chính xác theo lịch Việt Nam (can chi, tháng nhuận).
- **NFR-06** Toàn bộ dữ liệu gia phả công khai đọc; ghi/sửa chỉ qua khu quản trị.
- **NFR-07** Xuất bản ấn phẩm: PDF gia phả in được, Excel danh sách.

## 6. Kết luận nghiên cứu open source (tóm tắt)

- **Sát nhất tuyệt đối**: chính stack của trang — **NukeViet CMS (GPL, GitHub)** + module gia phả trên NukeViet Store (1.000.000đ, GPL) + theme dạng `hotoc`. Dựng lại được giao diện gần như 100%.
- **Sát nhất "thuần quốc tế"**: **webtrees** (PHP, GPL, hỗ trợ tiếng Việt, GEDCOM, phân quyền riêng tư mạnh) — thiếu ngày giỗ âm lịch/can chi, cần viết module.
- **Sát nhất "stack hiện đại + thuần Việt"**: **giapha-os** (MIT, Next.js + Supabase) — đã có sơ đồ phả hệ, xưng hô tự động, GEDCOM; cần bổ sung khối CMS tin tức.
- Chi tiết + thư viện vẽ phả đồ (family-chart, Topola, dTree) tại [14-nghien-cuu-opensource.md](14-nghien-cuu-opensource.md).
