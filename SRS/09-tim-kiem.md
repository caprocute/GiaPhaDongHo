# SRS-09 — Tìm kiếm

Hệ thống có **2 công cụ tìm kiếm tách biệt**: tìm toàn site (nội dung) và tìm trong gia phả (con người).

## 1. Tìm kiếm toàn site (module Seek — `/seek/?q=`)

- **FR-09.1** Ô tìm kiếm ở thanh điều hướng mọi trang; autocomplete/gợi ý (tối thiểu 3 ký tự, gọi `data-url="/seek/?q="`).
- **FR-09.2** Trang kết quả cho phép **chọn phạm vi**: Tìm trên site / Giới thiệu / Tin Tức / Page / Điều khoản sử dụng / Album ảnh (theo module).
- **FR-09.3** **Tìm nâng cao**: chế độ "Cả cụm từ" hoặc "Tối thiểu 1 từ".
- **FR-09.4** Kết quả nhóm theo module, đếm số kết quả ("Kết quả tìm kiếm trên 'Tin Tức': 17"), trích đoạn có ngữ cảnh từ khóa, link "Xem tất cả".

## 2. Tìm người trong gia phả

- **FR-09.5** Ô "Tìm người trong gia phả" tại hero trang chủ → submit về trang phả đồ của gia phả (`/gia-pha/{họ}/{chi}/pha-do/?q=`).
- **FR-09.6** Ô tìm ngay trên trang phả đồ: "Tìm theo **tên** hoặc **mã hiệu**…"; kết quả dùng để (a) mở hồ sơ chi tiết hoặc (b) vẽ cây gia phả từ người đó.
- **FR-09.7** Tìm kiếm không dấu/có dấu tiếng Việt (yêu cầu suy ra — cần chuẩn hóa unaccent khi xây mới).

## 3. Yêu cầu suy ra khi xây mới

- Index riêng cho người (tên, tên húy, mã hiệu, đời, nhánh) tách khỏi index bài viết.
- Lọc nâng cao trong gia phả: theo đời, giới tính, tình trạng, nhánh/phái, năm sinh–mất.
