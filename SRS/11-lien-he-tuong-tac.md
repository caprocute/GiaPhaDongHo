# SRS-11 — Liên hệ & Tương tác cộng đồng

## 1. Module Liên hệ (`/contact/`)

- **FR-11.1** Trang "Lời ngỏ" giải thích mục đích: nơi con cháu thưa gửi ý kiến, đăng ký nội dung liên quan gia phả, sự kiện, tộc sự.
- **FR-11.2** **Bộ phận tiếp nhận** (department): "Ban biên tập" có trang riêng `/contact/Ban-bien-tap/` — hệ thống hỗ trợ nhiều bộ phận nhận liên hệ.
- **FR-11.3** Form "Gửi phản hồi": chọn **chủ đề quan tâm** (dropdown), nội dung, thông tin người gửi; chống spam (captcha).
- **FR-11.4** Hiển thị thông tin liên hệ tĩnh: địa chỉ, email, Yahoo/Skype/Viber, SĐT.

## 2. Bình luận bài viết & album ("Ý kiến bạn đọc")

- **FR-11.5** Khu bình luận dưới bài viết và album ảnh; đếm "Phản hồi" trên danh sách bài.
- **FR-11.6** **Like bình luận** và sắp xếp: theo bình luận mới / cũ / **số lượt thích**.
- **FR-11.7** (Suy luận quản trị) Duyệt bình luận trước khi hiện, chặn từ khóa, yêu cầu đăng nhập hoặc cho khách kèm captcha — cấu hình được.

## 3. Kênh phân phối & mạng xã hội

- **FR-11.8** RSS từng chuyên mục (`/rss/...`) + trang feeds tổng (`/feeds/`).
- **FR-11.9** Liên kết mạng xã hội của dòng họ (Facebook, Twitter, YouTube) trên header.
- **FR-11.10** QR-code website ở footer (kết nối offline→online: in lên ấn phẩm, bia đá, thiệp mời).

## 4. Thống kê truy cập công khai (module Statistics)

- **FR-11.11** Block: Đang truy cập (tách bot "Máy chủ tìm kiếm" vs "Khách viếng thăm"), Hôm nay, Tháng hiện tại, Tổng lượt truy cập.
- **FR-11.12** (Suy luận quản trị) Trang thống kê chi tiết trong admin: theo quốc gia, trình duyệt, hệ điều hành, giờ cao điểm — tính năng chuẩn NukeViet.
