# SRS-12 — Khu Quản trị / "CRM ẩn" (suy luận có căn cứ)

Khu quản trị **không truy cập được từ ngoài** nhưng xác định được tồn tại và suy luận được tính năng dựa trên: (1) trang đăng nhập `/admin/` ("Đăng nhập quản trị hệ thống"), (2) bộ tính năng chuẩn của NukeViet 4.x admin, (3) dấu vết dữ liệu ở front-end (mã hiệu tự sinh, thống kê tự động, ảnh upload theo tháng, tác giả bài viết, hẹn giờ đăng…).

## 1. Cổng quản trị

- **FR-12.1** Trang đăng nhập riêng `/admin/` (username + mật khẩu + quên mật khẩu), tách hoàn toàn khỏi giao diện công khai; hỗ trợ 2FA.
- **FR-12.2** Phân cấp quản trị: quản trị tối cao → quản trị điều hành → quản trị module; nhật ký thao tác quản trị (admin log).

## 2. Quản trị GIA PHẢ (lõi nghiệp vụ — module gia-pha)

Đây là phần "CRM dòng họ" thực sự:

- **FR-12.3** **CRUD gia phả**: tạo nhiều gia phả, gắn tỉnh/thành, nhập metadata (năm biên soạn, người biên soạn, người liên hệ), viết bìa gia phả.
- **FR-12.4** **CRUD thành viên phả hệ**: thêm người theo quan hệ (con của ai, vợ/chồng của ai); hệ tự sinh **mã hiệu** (A-n, hôn phối `-spN`) và tính **đời** tự động.
- **FR-12.5** Nhập liệu hồ sơ: danh xưng, tên húy/tên thường, giới tính, tình trạng sống/mất, ngày sinh/mất (**nhập dương hoặc âm lịch, hệ quy đổi can chi**), nơi mộ táng, sự nghiệp công đức, ghi chú, ảnh chân dung.
- **FR-12.6** Quản lý **nhiều hôn phối** và con theo từng hôn phối; hỗ trợ "chưa rõ tên"/thiếu dữ liệu.
- **FR-12.7** Soạn thảo các chương: Phả ký, Tộc ước, Hương hỏa (rich-text, cho phép rỗng).
- **FR-12.8** Ngày giỗ sinh tự động từ dữ liệu; có thể ghi đè/hiệu chỉnh.
- **FR-12.9** **Xuất bản**: cấu hình xuất PDF (chọn chương), Excel phả đồ; khả năng nhập liệu hàng loạt (import Excel — tính năng phổ biến của module thương mại).
- **FR-12.10** Phân quyền nhập liệu gia phả cho thư ký từng nhánh/chi (mỗi người phụ trách nhánh của mình).

## 3. Quản trị NỘI DUNG (module news, photos, contact)

- **FR-12.11** CRUD bài viết: WYSIWYG (CKEditor), ảnh đại diện, chuyên mục, từ khóa, nguồn, **hẹn giờ đăng**, bài nổi bật, cho phép bình luận hay không.
- **FR-12.12** Quản lý chuyên mục (thêm/sửa/ẩn, thứ tự menu); quản lý trang tĩnh (Page: Điều khoản sử dụng, Giới thiệu).
- **FR-12.13** Duyệt bình luận, quản lý phản hồi liên hệ theo bộ phận (inbox liên hệ = mini-CRM tiếp nhận yêu cầu của con cháu).
- **FR-12.14** Quản lý album/danh mục ảnh, upload nhiều ảnh, thứ tự, ảnh bìa.
- **FR-12.15** Trình quản lý file/ảnh tập trung (`/uploads/`, phân thư mục theo module + năm_tháng).

## 4. Quản trị THÀNH VIÊN

- **FR-12.16** Danh sách thành viên đăng ký: duyệt/khóa/kích hoạt, gán nhóm quyền, reset mật khẩu, xem lịch sử đăng nhập.
- **FR-12.17** Cấu hình đăng ký: bật/tắt tự kích hoạt, câu hỏi bảo mật, quy định thành viên, captcha.

## 5. Quản trị HỆ THỐNG (chuẩn NukeViet)

- **FR-12.18** Cấu hình site: tên, logo, favicon, thông tin footer (người chịu trách nhiệm, tài khoản ngân hàng), meta SEO, mạng xã hội.
- **FR-12.19** Quản lý module (bật/tắt/cài mới), quản lý block trang chủ theo theme, quản lý theme (desktop/mobile).
- **FR-12.20** **Sao lưu CSDL** định kỳ, tối ưu bảng, cron job.
- **FR-12.21** Bảo mật: chặn IP, giới hạn đăng nhập sai, cấu hình captcha, quét thay đổi file (checkss), HTTPS.
- **FR-12.22** Cấu hình email SMTP (gửi kích hoạt, quên mật khẩu, thông báo liên hệ).
- **FR-12.23** Thống kê truy cập chi tiết; nhật ký hệ thống; quản lý ngôn ngữ giao diện.

## 6. Khoảng trống nên bổ sung nếu xây hệ CRM dòng họ mới

(Trang gốc chưa có — cơ hội cải tiến)

- Cổng **tự khai** cho con cháu: thành viên đăng nhập tự cập nhật hồ sơ nhánh mình, chờ tộc trưởng duyệt (workflow duyệt thay đổi).
- Liên kết tài khoản đăng nhập ↔ node trong phả hệ ("tôi là ai trong cây").
- Quản lý sự kiện + điểm danh/đăng ký tham dự; nhắc giỗ tự động qua email/Zalo.
- Sổ quỹ công đức thu–chi minh bạch, mục tiêu quyên góp theo công trình.
- Import/Export **GEDCOM** để tương thích phần mềm gia phả quốc tế.
