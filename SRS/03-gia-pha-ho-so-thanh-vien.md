# SRS-03 — Gia phả: Hồ sơ thành viên & dữ liệu phả hệ (LÕI)

Module quan trọng nhất của hệ thống. Route gốc: `/gia-pha/`.

## 1. Danh bạ gia phả (multi-tree)

- **FR-03.1** Trang `/gia-pha/` hiển thị **bản đồ gia phả theo tỉnh/thành phố** (34+ tỉnh); mỗi tỉnh hiện số lượng gia phả trực thuộc (VD: "Quảng Trị (Có: 1 Gia phả)").
- **FR-03.2** Một cài đặt phục vụ được nhiều dòng họ/chi họ; mỗi gia phả có trang riêng theo slug `{Họ}/{Địa danh}`.

## 2. Trang thông tin chung của một gia phả

URL: `/gia-pha/Hoang/Thon-Trung-Binh-Bao-Ninh-Dong-Hoi/`

- **FR-03.3** Bìa gia phả trình bày kiểu văn bản chính thống: quốc hiệu, "HỘI ĐỒNG HOÀNG TỘC VIỆT NAM TỈNH...", tên gia phả.
- **FR-03.4** Metadata: năm biên soạn, người biên soạn, người liên hệ, email.
- **FR-03.5** Thống kê tự động: tổng số đời, tổng thành viên, nam, nữ, đã mất, không rõ.
- **FR-03.6** **Xuất gia phả thành ấn phẩm**: người dùng chọn thành phần (Bìa gia phả / Phả ký / Phả đồ / Tộc ước / Hương hỏa / Ngày giỗ / Thông tin thành viên) rồi **Xuất PDF** hoặc **Xuất Excel (phả đồ)**.
- **FR-03.7** Tab điều hướng nội bộ gia phả: Thông tin chung | Phả ký | Phả đồ | Tộc ước | Hương Hoả | Danh sách ngày giỗ.

## 3. Các chương văn bản của gia phả

- **FR-03.8** **Phả ký** (`/pha-ky/`): trang văn bản dài kể lịch sử dòng họ (nguồn gốc, di cư, các phái/nhánh), soạn bằng rich-text, hỗ trợ ảnh.
- **FR-03.9** **Tộc ước** (`/toc-uoc/`): quy ước của dòng họ (trang này hiện đang trống — hệ thống cho phép chương rỗng).
- **FR-03.10** **Hương hỏa** (`/huong-hoa/`): tư liệu về từ đường, lăng mộ, tài sản hương hỏa, người phụng sự qua các thời kỳ.

## 4. Hồ sơ thành viên (person record)

URL mẫu: `/gia-pha/Hoang/Thon-Trung-Binh-Bao-Ninh-Dong-Hoi/A7/`

Trường dữ liệu quan sát được:

| Nhóm | Trường |
|------|--------|
| Định danh | Danh xưng (Ông/Bà), Họ tên, **Tên húy**, **Mã hiệu** (A7), Đời thứ |
| Nhân khẩu | Giới tính, Tình trạng (Còn sống / Đã mất) |
| Ngày tháng | Ngày giờ sinh (dương lịch + **năm can chi**, VD "1785 – Ất Tỵ"), Ngày giờ mất (**âm lịch**, VD "14/6 (AL)") |
| An táng | Mộ táng tại (mô tả vị trí, tình trạng bia mộ) |
| Quan hệ | Bố, Mẹ (link sang hồ sơ tương ứng), vợ/chồng (mã `-spN`), các con (suy ra từ cây) |
| Tiểu sử | **Sự nghiệp, công đức**, Ghi chú |
| Ảnh | Ảnh chân dung (tùy chọn) |

- **FR-03.11** Hồ sơ hỗ trợ người ngoài huyết thống (dâu/rể) như thực thể riêng gắn với người trong họ.
- **FR-03.12** Hỗ trợ **nhiều vợ/chồng** và con theo từng bà/ông (quan sát: "Hoàng Liệu — Vợ: Nguyễn Thị Nhuận" và "Hoàng Liệu — Vợ: Nguyễn Thị Duyên" với 2 nhánh con riêng).
- **FR-03.13** Người chưa xác định tên hiển thị placeholder ("Chưa Rõ Tên", "Hữu Danh Vô Vị") — dữ liệu được phép thiếu.
- **FR-03.14** Từ hồ sơ có nút **"Xem cây phả đồ từ người này (nhánh con cháu)"**.
- **FR-03.15** Ngay trong trang hồ sơ nhúng **sơ đồ hậu duệ** (đếm số người, VD "245 người (ông Hoàng Văn Thành và con cháu)") với zoom −/100%/+ và nút **Tải SVG / Tải PNG**; sơ đồ nhóm theo cột "Đời 5, Đời 6, …".

## 5. Quy tắc nghiệp vụ suy ra

- **BR-03.1** Đời (generation) tính tự động từ quan hệ cha–con, hiển thị "Đời thứ N" và đánh số thứ tự anh em trong tree view (`5.1`, `6.2`…).
- **BR-03.2** Mã hiệu sinh tuần tự theo người huyết thống; hôn phối không có mã độc lập mà treo theo mã người trong họ.
- **BR-03.3** Thống kê (nam/nữ/mất/không rõ) tính lại tự động khi dữ liệu đổi.
- **BR-03.4** Người "Đã mất" + có ngày mất âm lịch ⇒ tự động vào danh sách ngày giỗ (xem SRS-05).
