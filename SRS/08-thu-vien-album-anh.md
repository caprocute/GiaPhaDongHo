# SRS-08 — Thư viện tư liệu & Album ảnh

## 1. Thư viện – Tư liệu (`/thu-vien-tu-lieu/`)

- **FR-08.1** Kho bài tư liệu lịch sử/văn hóa: bài sớ cúng họ, tư liệu về danh sĩ, văn bản cổ… (dạng bài viết, dùng chung engine tin tức — SRS-06).
- **FR-08.2** Mỗi tư liệu có: tiêu đề, mô tả, thời gian đăng, lượt xem, số phản hồi.
- **FR-08.3** Giá trị nghiệp vụ: số hóa văn bản cúng lễ (sớ, văn tế) để tái sử dụng hằng năm.

## 2. Album ảnh (`/photos/`) — module Photos

- **FR-08.4** Danh sách album: ảnh bìa, tên album, ngày tạo, **số ảnh**, **lượt xem**.
- **FR-08.5** Album thuộc **danh mục ảnh** (VD "Nối mạch nguồn cội", "Ảnh quê hương", "Danh nhân - gương sáng dòng họ") — URL `/photos/{danh-muc}/{album}-{id}/`.
- **FR-08.6** Trang album: lưới ảnh thumbnail, click mở **lightbox/slideshow** (nút ‹ › xem ảnh trước/tiếp theo, đóng ×).
- **FR-08.7** Ảnh có caption; đếm lượt xem theo album.
- **FR-08.8** Khu bình luận "Ý kiến bạn đọc" ngay dưới album (sắp xếp mới/cũ/lượt thích).
- **FR-08.9** Block "Album ảnh" ở sidebar/trang chủ hiển thị album mới nhất.

## 3. Suy luận phần quản trị (ẩn)

- **FR-08.10** Upload ảnh hàng loạt, tự sinh thumbnail nhiều cỡ, sắp thứ tự ảnh, chọn ảnh bìa.
- **FR-08.11** Quản lý danh mục album; duyệt/ẩn ảnh; watermark (tùy chọn của module NukeViet Photos).
