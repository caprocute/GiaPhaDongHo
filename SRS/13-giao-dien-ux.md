# SRS-13 — Giao diện & Trải nghiệm người dùng (theme "hotoc")

## 1. Ngôn ngữ thiết kế

- **UI-13.1** Bảng màu truyền thống thờ tự Việt: **đỏ trầm (#8B3A2A vùng nền ngoài) – vàng nghệ – kem**, hoa văn rồng chầu, khung viền kiểu câu đối.
- **UI-13.2** Banner đầu trang: tộc huy tròn (chữ Hán 黃 + "HỌ HOÀNG - HUỲNH VIỆT NAM"), tên "HỌ HOÀNG - HUỲNH Thôn Trung Bính" chữ vàng viền đỏ trên nền hoa văn.
- **UI-13.3** Typography: **Be Vietnam Pro** (nội dung) + **Noto Serif** (tiêu đề trang trọng); hỗ trợ đầy đủ dấu tiếng Việt.
- **UI-13.4** Các nút tab dạng "con dấu" bo tròn nền đỏ chữ vàng (THÔNG TIN CHUNG / PHẢ KÝ / PHẢ ĐỒ / TỘC ƯỚC / HƯƠNG HOẢ / DANH SÁCH NGÀY GIỖ).
- **UI-13.5** Phả đồ đóng khung trang trí như ấn phẩm in (có nút "Tắt khung" khi cần thao tác).

## 2. Bố cục

- **UI-13.6** Trang chủ: hero thống kê → lưới block nội dung 2–3 cột; trang trong: nội dung chính + **sidebar cố định** (Ngày giỗ sắp tới, Danh mục, Bài viết mới, Bài xem nhiều, Album ảnh, Thống kê truy cập, QR).
- **UI-13.7** Breadcrumb mọi trang (Trang nhất > Gia phả > …).
- **UI-13.8** Responsive: theme có biến thể mobile (`?nvvithemever=r`); menu thu gọn; sơ đồ phả hệ hỗ trợ cuộn ngang + zoom trên màn nhỏ.

## 3. Tương tác đặc trưng

- **UI-13.9** Số liệu thống kê hero dạng "counter" nổi bật.
- **UI-13.10** Widget ngày giỗ: ô ngày to kiểu tờ lịch + tháng âm lịch.
- **UI-13.11** Lightbox xem ảnh album; tooltip trên phả đồ; collapse cây phả hệ.
- **UI-13.12** Toàn bộ điều khiển phả đồ gom một thanh công cụ: zoom, xem sâu hơn, thủy tổ, tắt khung, tải SVG/PNG/PDF.

## 4. Yêu cầu khi tái tạo giao diện tương đồng

- Xây theme độc lập dữ liệu, biến CSS cho bộ màu đỏ–vàng để đổi theo dòng họ khác.
- Tài nguyên đồ họa cần chuẩn bị: tộc huy (SVG), hoa văn rồng/mây nền banner, khung viền phả đồ, texture giấy.
- Giữ nguyên tắc: trang trọng – truyền thống ở khu gia phả; hiện đại – gọn ở khu tin tức.
