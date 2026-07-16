# TK-05 — Ma trận kế thừa tính năng (parity với bản cũ)

> Nguồn: bộ `SRS/` (00→13). Quy ước trạng thái: **Giữ nguyên** = làm lại y hệt về nghiệp vụ;
> **Nâng cấp** = giữ nghiệp vụ, cải tiến trải nghiệm/kỹ thuật; **Thay thế** = đạt cùng mục đích bằng cơ chế mới.

## 1. Lõi gia phả (SRS-03, 04, 05)

| FR bản cũ | Tính năng | Bản mới | Trạng thái |
|-----------|-----------|---------|-----------|
| FR-03.1..2 | Đa gia phả theo tỉnh/thành | module genealogy multi-tree + trang danh bạ | Giữ nguyên |
| FR-03.3..5 | Bìa, metadata, thống kê tự động | `stats_cache` + trang thông tin chung | Giữ nguyên |
| FR-03.6 | Xuất PDF/Excel chọn chương | pdf-render service + Apache POI; thêm dàn trang sách (TK-06 F10) | Nâng cấp |
| FR-03.7..10 | Tab Phả ký/Tộc ước/Hương hỏa | bảng `chapter` + TipTap editor, versioned | Nâng cấp |
| FR-03.11..15 | Hồ sơ người: tên húy, can chi, mộ táng, đa hôn phối, mã hiệu, nhánh hậu duệ | schema TK-03 §2, giữ định dạng mã A7/A7-sp1 | Giữ nguyên |
| BR-03.1..4 | Tính đời, sinh mã, thống kê, tự động vào ngày giỗ | trigger + domain service + event | Giữ nguyên |
| FR-04.1..9 | Chart phân cấp: giới hạn khổ, chọn root, depth, zoom, tắt khung, SVG/PNG/PDF | `packages/tree-viz` canvas + minimap + animation; export server-side | Nâng cấp |
| FR-04.10..12 | Tree view thu/mở, số đời.thứ tự, màu giới tính | chế độ "danh sách" của tree-viz | Nâng cấp |
| FR-04.13 | Sơ đồ hậu duệ nhúng trong hồ sơ | component `DescendantChart` | Giữ nguyên |
| FR-05.1..4 | Bảng giỗ + lọc tháng âm (Giêng→Chạp) | trang ngày giỗ + `LunarDateBadge` | Giữ nguyên |
| FR-05.5..7 | Widget giỗ sắp tới "tháng này/tháng sau" | block registry + tính toán `core.lunar` | Giữ nguyên |
| FR-05.8..9, BR-05.1 | Song lịch, can chi, tháng nhuận UTC+7 | lib amlich Java+TS, golden tests | Giữ nguyên |

## 2. Cổng thông tin (SRS-02, 06, 07, 08)

| FR bản cũ | Tính năng | Bản mới | Trạng thái |
|-----------|-----------|---------|-----------|
| FR-02.* | Trang chủ: hero thống kê, tra cứu, các block, QR, footer ngân hàng | widget/block registry cấu hình được (không sửa code) | Nâng cấp |
| FR-06.1..7 | 6+ chuyên mục, lượt xem, bài xem nhiều, OG meta, bình luận | module cms; chuyên mục = category có layout | Giữ nguyên |
| FR-06.8..10 | WYSIWYG, hẹn giờ đăng, phân quyền biên tập | TipTap + publish workflow + RBAC | Nâng cấp |
| FR-07.1..5 | Bảng vàng công đức, tài khoản ngân hàng | module donation (mở rộng thành quỹ minh bạch — TK-06 F4) | Nâng cấp |
| FR-08.1..9 | Album, danh mục, lightbox, bình luận, đếm xem | module media + MediaLightbox + blurhash | Nâng cấp |
| FR-08.10..11 | Upload hàng loạt, thumbnail, watermark | MinIO + imgproxy (watermark preset) | Giữ nguyên |

## 3. Tìm kiếm, tài khoản, tương tác (SRS-09, 10, 11)

| FR bản cũ | Tính năng | Bản mới | Trạng thái |
|-----------|-----------|---------|-----------|
| FR-09.1..4 | Tìm toàn site, phạm vi module, nâng cao, highlight | Elasticsearch `content_v1` + filter | Nâng cấp |
| FR-09.5..7 | Tìm người theo tên/mã hiệu, không dấu | ES `person_v1` + suggest | Nâng cấp |
| FR-10.1..3 | Đăng nhập, 2FA TOTP + backup codes, keep-alive | Keycloak (OIDC) — parity 2FA có sẵn | Thay thế |
| FR-10.4..8 | Đăng ký, câu hỏi bảo mật, kích hoạt email, quên mật khẩu | Keycloak flows; **bỏ câu hỏi bảo mật** (lỗi thời, kém an toàn) → thay bằng email OTP | Thay thế (nâng an toàn) |
| FR-10.9..11 | Nhóm quyền, hồ sơ cá nhân | RBAC scope theo tree/nhánh + user_profile | Nâng cấp |
| FR-11.1..4 | Liên hệ theo bộ phận, chủ đề, captcha | module contact (gộp vào moderation inbox) + Cloudflare Turnstile | Nâng cấp |
| FR-11.5..7 | Bình luận, like, sort, duyệt | comment đa thực thể (bài, album), queue duyệt | Giữ nguyên |
| FR-11.8..10 | RSS, mạng xã hội, QR | RSS/Atom route portal; QR generator | Giữ nguyên |
| FR-11.11..12 | Thống kê truy cập công khai + admin | **Umami/Plausible self-host** (thay đếm thô NukeViet); block hiển thị số liệu public API | Thay thế |

## 4. Quản trị (SRS-12) & Giao diện (SRS-13)

| FR bản cũ | Bản mới | Trạng thái |
|-----------|---------|-----------|
| FR-12.1..2 Cổng admin riêng, phân cấp, audit log | Admin SPA + Keycloak role + `audit_log` | Nâng cấp |
| FR-12.3..10 CRUD gia phả/thành viên, quy đổi lịch, xuất bản, phân quyền nhánh | Tree Editor trực quan (TK-07 §3) — nâng cấp lớn nhất | Nâng cấp |
| FR-12.11..15 CRUD nội dung, duyệt bình luận, file manager | CMS admin + Media library MinIO | Nâng cấp |
| FR-12.16..23 User, cấu hình site, module on/off, backup, SMTP, thống kê | System settings + module_registry + backup job (TK-09) | Giữ nguyên |
| UI-13.* Bộ nhận diện đỏ–vàng, khung ấn phẩm, widget lịch | Token heritage layer (TK-04 §1) | Nâng cấp |
| NFR-01.2 Keep-alive session 60s | Silent token refresh (OIDC) — không cần hộp thoại | Thay thế |

## 5. Khác biệt có chủ đích so với bản cũ (cần chủ đầu tư duyệt)

1. **Bỏ câu hỏi bảo mật** khi đăng ký (an toàn kém) → email OTP.
2. **Bỏ Yahoo/Skype** ở khối liên hệ → Zalo/Facebook/YouTube.
3. Thống kê truy cập chuyển sang Umami (chính xác hơn, tách bot chuẩn).
4. Bình luận mặc định yêu cầu đăng nhập (giảm spam), khách chỉ đọc — có thể mở bằng config.
5. Trang "Họ Hoàng bốn phương" tổng quát hóa thành chuyên mục "Liên tộc" cấu hình được.
