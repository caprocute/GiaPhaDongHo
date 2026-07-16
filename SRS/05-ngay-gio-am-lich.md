# SRS-05 — Ngày giỗ & Lịch âm (LÕI, đặc thù Việt Nam)

Đây là tính năng khác biệt lớn nhất so với phần mềm gia phả phương Tây.

## 1. Danh sách ngày giỗ

URL: `/gia-pha/{họ}/{chi}/ngay-gio/`

- **FR-05.1** Bảng toàn bộ ngày giỗ của gia phả, cột: STT, Họ và tên, **Ngày giỗ (ÂL)** (dd/mm âm lịch), **Đời thứ**, **Năm mất** (dương lịch).
- **FR-05.2** **Lọc theo tháng âm lịch**: dropdown "Cả năm / Tháng Giêng (ÂL) / Tháng Hai … Tháng Một (11) / Tháng Chạp" — dùng đúng tên gọi dân gian (Giêng, Chạp); mặc định "Tháng này".
- **FR-05.3** Danh sách sinh **tự động** từ hồ sơ thành viên có tình trạng "Đã mất" + ngày mất âm lịch (không nhập tay hai nơi).
- **FR-05.4** Sắp xếp theo ngày/tháng âm lịch tăng dần.

## 2. Widget "Ngày giỗ sắp tới" (toàn site)

- **FR-05.5** Block hiển thị ở trang chủ và sidebar mọi trang: ngày (số to) + "th.N ÂL", danh xưng Ông/Bà + họ tên, nhãn tương đối "**Tháng này**" / "**Tháng sau**".
- **FR-05.6** Tự động cuộn theo thời gian thực: ngày giỗ đã qua trong tháng biến mất, lấy tiếp các ngày kế tiếp (quan sát: hiển thị từ 04/6 ÂL trong khi hôm nay ~02/6 ÂL).
- **FR-05.7** Link "Xem tất cả ngày giỗ →" về trang danh sách đầy đủ.

## 3. Lịch âm xuyên suốt hệ thống

- **FR-05.8** Chuyển đổi dương ⇄ âm lịch Việt Nam (có can chi): năm sinh hiện "1785 – Ất Tỵ"; bài viết ghi "ngày 11/6/2026, nhằm ngày 26 tháng 4 năm Bính Ngọ".
- **FR-05.9** Ngày mất lưu/hiển thị theo âm lịch ("14/6 (AL)") vì giỗ tính theo âm lịch hằng năm.
- **BR-05.1** Quy tắc: ngày giỗ là ngày mất âm lịch lặp lại hàng năm; hệ thống phải xử lý tháng nhuận và tháng thiếu/đủ của âm lịch Việt Nam (múi giờ UTC+7 — khác lịch âm Trung Quốc ở một số năm).

## 4. Gợi ý mở rộng khi xây mới (không có trên trang gốc)

- Nhắc giỗ qua email/Zalo trước N ngày; xuất iCal; trang lịch tổng hợp giỗ + sự kiện dòng họ.
