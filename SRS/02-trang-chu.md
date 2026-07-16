# SRS-02 — Trang chủ & các khối hiển thị

Trang chủ đóng vai trò **dashboard công khai của dòng họ**, tổng hợp dữ liệu từ mọi module. Thứ tự các khối từ trên xuống:

## 1. Vùng đầu trang (header)

- **FR-02.1** Banner nhận diện: tộc huy (logo tròn "Họ Hoàng - Huỳnh Việt Nam"), tên dòng họ, nền hoa văn rồng đỏ–vàng truyền thống.
- **FR-02.2** Thanh tiện ích trên cùng: thông tin liên hệ (email, Yahoo, Skype, Viber), liên kết mạng xã hội (Facebook, Twitter, YouTube), nút **Đăng nhập**.
- **FR-02.3** Menu chính 7 mục: Trang nhất, Thông tin dòng họ, Hoạt động dòng họ, Gia phả, Họ Hoàng bốn phương, Thư viện - Tư liệu, Liên hệ (có dropdown con).
- **FR-02.4** Ô **tìm kiếm toàn site** trên breadcrumb (gợi ý qua `/seek/?q=`, tối thiểu 3 ký tự).
- **FR-02.5** Hiển thị ngày giờ hiện tại (thứ, ngày dương lịch).

## 2. Khối hero "Phả hệ dòng họ"

- **FR-02.6** Câu giới thiệu sứ mệnh dòng họ.
- **FR-02.7** **4 thẻ thống kê tự động** từ dữ liệu gia phả: Tổng thành viên (1.586), Số đời (13), Nam (769), Nữ (817).
- **FR-02.8** Khối "Tra cứu phả đồ": ô tìm người trong gia phả (submit về trang phả đồ) + nút "Xem sơ đồ phả hệ" trỏ thẳng tới chart.

## 3. Các khối nội dung động

- **FR-02.9** **Tin tức & Hoạt động dòng họ**: 1 bài nổi bật (ảnh lớn) + danh sách bài mới; mỗi bài hiện tác giả, thời gian đăng, lượt xem; nút "Xem tất cả →".
- **FR-02.10** **Thông báo**: danh sách thông báo chính thức của hội đồng gia tộc (ngày đăng, lượt xem).
- **FR-02.11** **Ngày giỗ sắp tới**: 5–8 ngày giỗ gần nhất theo **âm lịch** (ngày/tháng ÂL, danh xưng Ông/Bà + họ tên, nhãn "Tháng này"/"Tháng sau"); link "Xem tất cả ngày giỗ".
- **FR-02.12** **Bảng vàng công đức**: vinh danh người đóng góp (họ tên + nội dung công đức), link xem tất cả.
- **FR-02.13** **Tin tức Họ Hoàng - Huỳnh bốn phương**: tin các chi/vùng khác trên cả nước.
- **FR-02.14** **Danh nhân, gương sáng dòng họ**: danh sách nhân vật tiêu biểu.
- **FR-02.15** **Thư viện – Tư liệu**: bài tư liệu mới nhất.
- **FR-02.16** **Album ảnh**: album mới (ảnh bìa, số ảnh, lượt xem).

## 4. Khối chân trang & tiện ích

- **FR-02.17** **Thống kê truy cập** thời gian thực: đang truy cập (tách "máy chủ tìm kiếm" và "khách viếng thăm"), hôm nay, tháng hiện tại, tổng lượt truy cập.
- **FR-02.18** **QR-code** của website (quét để mở trang).
- **FR-02.19** Footer pháp lý: tên trang, người chịu trách nhiệm, địa chỉ, SĐT, email, **số tài khoản ngân hàng nhận công đức** (BIDV).

## 5. Yêu cầu suy ra cho bản xây mới

- Trang chủ phải cấu thành từ **block/widget cấu hình được** (bật/tắt, đổi thứ tự) — NukeViet quản lý block theo theme ở khu quản trị.
- Mọi khối lấy dữ liệu động, không hardcode; giới hạn số item mỗi khối cấu hình được.
