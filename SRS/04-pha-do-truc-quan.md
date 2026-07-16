# SRS-04 — Phả đồ trực quan (LÕI)

Hai chế độ xem phả đồ, chuyển bằng toggle "Xem phả đồ dạng": **Cây phả hệ** (danh sách phân cấp) và **Sơ đồ phân cấp** (chart đồ họa).

## 1. Sơ đồ phân cấp (chart)

URL: `/gia-pha/{họ}/{chi}/pha-do/chart/`

- **FR-04.1** Vẽ cây phả hệ dạng **sơ đồ hộp phân cấp** (mỗi người một node, vợ/chồng ghi kèm trong node, nối cha–con), render SVG, nhóm theo hàng "Đời N".
- **FR-04.2** **Giới hạn thông minh để vừa khổ màn hình**: mặc định chỉ hiện ~43 người, kèm chú thích "Sơ đồ đã giới hạn để vừa khổ. Bấm vào một người (viền đỏ) để xem riêng nhánh của họ, hoặc 'Xem sâu hơn'".
- **FR-04.3** **Chọn gốc (root) bất kỳ**: click một người → vẽ lại cây từ người đó (`?root=A7`); nút **"Thuỷ tổ"** quay về gốc đời 1.
- **FR-04.4** **Chọn độ sâu**: nút "Xem sâu hơn ↓" tăng số đời hiển thị (`?depth=6`, `?depth=8`…).
- **FR-04.5** **Zoom**: nút − / tỷ lệ % / +.
- **FR-04.6** **Tắt/bật khung** trang trí ("Tắt khung"), chế độ khung đầy đủ/frame=0 (toàn màn hình).
- **FR-04.7** **Xuất sơ đồ**: Tải SVG, Tải PNG, Tải PDF (`?export=pdf`).
- **FR-04.8** Ô **tìm thành viên ngay trên trang phả đồ** ("Tìm theo tên, mã hiệu…") — tìm để xem chi tiết hoặc vẽ cây từ người đó.
- **FR-04.9** Phân biệt giới tính bằng màu/kiểu node; người gốc hiện tại viền đỏ.

## 2. Cây phả hệ (tree view)

URL: `/gia-pha/{họ}/{chi}/pha-do/tree/` (jquery.treeview)

- **FR-04.10** Danh sách phân cấp thu/mở từng nhánh (collapse/expand) toàn bộ 1.586 người.
- **FR-04.11** Mỗi dòng: số thứ tự `Đời.thứ-tự-anh-em` (VD `5.1`, `6.3`), tên có link về hồ sơ, vợ/chồng ghi cạnh nhau ("Hoàng Văn Thành - Phạm Thị Soạn"), CSS class `male`/`female` để tô màu.
- **FR-04.12** Truy vấn tìm kiếm (`?q=`) filter/định vị người trong cây.

## 3. Sơ đồ nhúng trong hồ sơ cá nhân

- **FR-04.13** Trang hồ sơ mỗi người nhúng sơ đồ **nhánh hậu duệ** của riêng người đó, kèm bộ đếm "N người (ông X và con cháu)", zoom, tải SVG/PNG (không có PDF ở đây).

## 4. Yêu cầu phi chức năng

- **NFR-04.1** Render phía server ra SVG/HTML (hoạt động không cần framework JS nặng); xuất PDF server-side.
- **NFR-04.2** Chart 43 node tải nhanh; nhánh 245 người vẫn render trong 1 trang.
- **NFR-04.3** Sơ đồ giữ phong cách ấn phẩm truyền thống (khung viền đỏ–vàng) để in trực tiếp.
