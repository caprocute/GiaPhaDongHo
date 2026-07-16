# TK-07 — CRM Quản trị hiện đại (Admin SPA)

> Thay thế toàn bộ khu `/admin/` NukeViet (SRS-12) bằng SPA React chuyên dụng.
> Triết lý: **"tộc trưởng 70 tuổi dùng được, thư ký 20 tuổi dùng sướng"** — mọi thao tác ≤ 3 click, tiếng Việt 100%, chữ to được (density toggle).

## 1. Kiến trúc thông tin (IA)

```
admin.{domain}/
├── Bảng điều khiển        # tổng quan: thành viên mới, giỗ tháng này, bài chờ duyệt, quỹ
├── Gia phả
│   ├── Cây phả hệ (Tree Editor)   # màn hình chủ lực — §3
│   ├── Danh sách thành viên       # DataTable: lọc đời/nhánh/tình trạng, bulk edit, import/export
│   ├── Chương sách (phả ký/tộc ước/hương hỏa)
│   ├── Ngày giỗ                   # bảng + ghi đè + cấu hình nhắc
│   └── Xuất ấn phẩm               # wizard chọn chương → PDF/Excel, hàng đợi jobs
├── Duyệt & Kiểm duyệt
│   ├── Tự khai của con cháu (change-request diff viewer)
│   ├── Bình luận
│   └── Hộp thư liên hệ
├── Nội dung
│   ├── Bài viết (kanban Nháp→Chờ duyệt→Đã đăng→Lên lịch)
│   ├── Chuyên mục & trang tĩnh
│   ├── Thư viện media (MinIO browser, kéo-thả, tag người trong ảnh)
│   └── Trang chủ (widget composer kéo-thả block)
├── Cộng đồng
│   ├── Sự kiện & điểm danh
│   ├── Quỹ công đức (chiến dịch, ghi nhận, sao kê, biên nhận)
│   └── Khuyến học (đề cử → duyệt → công bố)
├── Người dùng & Quyền     # user ↔ node phả hệ, vai trò theo nhánh
└── Hệ thống               # module on/off, token giao diện, backup, nhật ký audit, tích hợp (SMTP/Zalo)
```

## 2. Nguyên tắc UX của CRM

1. **Command palette (⌘K)**: gõ tên người/bài/lệnh — nhảy thẳng, không lần menu.
2. **Inline edit mọi nơi**: click ô là sửa (DataTable), autosave draft, undo toast 10s.
3. **Diff-first moderation**: mọi phê duyệt hiển thị dạng so sánh trước/sau từng trường.
4. **Nhập ngày kép**: mọi date-picker có 2 tab Dương/Âm (chọn 1 bên tự quy đổi bên kia, hiện can chi ngay), hỗ trợ "chỉ biết năm", "khoảng ước đoán".
5. **Audit hiển thị tại chỗ**: mỗi bản ghi có tab "Lịch sử" (ai, khi nào, đổi gì, khôi phục về bản cũ).
6. **Realtime nhẹ**: SSE đẩy badge "3 tự khai mới" không cần reload.
7. **Mobile admin**: thao tác duyệt (approve/reject) và ghi công đức dùng tốt trên điện thoại — tộc trưởng duyệt ngay tại từ đường.

## 3. Tree Editor — màn hình chủ lực (nâng cấp lớn nhất so với bản cũ)

| Khả năng | Mô tả |
|----------|-------|
| Canvas trực tiếp | Sửa ngay trên phả đồ: click node → side panel hồ sơ; không còn form rời rạc kiểu NukeViet |
| Thêm nhanh theo quan hệ | Nút ngữ cảnh trên node: **+ Con** / **+ Vợ/Chồng** / **+ Anh chị em**; modal 5 trường tối thiểu, enter liên tục để nhập hàng loạt |
| Kéo-thả có kiểm soát | Kéo node đổi cha/mẹ → preview ảnh hưởng (đời, mã hiệu, ngày giỗ) → xác nhận |
| Undo/Redo | Command stack theo phiên; mọi thao tác reversible |
| Phát hiện lỗi dữ liệu | Linter phả hệ chạy nền: con sinh trước cha 15 tuổi?, vòng lặp quan hệ, trùng tên+năm sinh (gợi ý merge), thiếu ngày giỗ ở người đã mất |
| Import | Wizard **Excel mẫu** + **GEDCOM** + di trú NukeViet (TK-03 §7); preview đối chiếu trước khi ghi |
| Chế độ hai người | Khóa mềm theo nhánh (optimistic lock + presence indicator) tránh 2 thư ký ghi đè nhau |

## 4. RBAC — vai trò mặc định

| Vai trò | Phạm vi | Quyền chính |
|---------|---------|-------------|
| Chủ hệ thống | toàn hệ | mọi quyền + cấu hình hệ thống |
| Tộc trưởng | 1 gia phả | duyệt mọi thay đổi, khóa/mở chương sách, công bố ấn phẩm |
| Thư ký nhánh | nhánh (subtree theo `lineage_path`) | CRUD person trong nhánh, đề xuất ngoài nhánh |
| Ban biên tập | module cms/media | soạn, lên lịch, duyệt bài, album |
| Thủ quỹ | module donation | ghi nhận đóng góp, xuất sao kê, không sửa phả hệ |
| Thành viên | bản thân + tự khai | sửa hồ sơ mình, gửi change-request nhánh mình |

Permission string: `module:entity:action:scope` — vd `genealogy:person:write:subtree(A3)`. Kiểm tra tại API (Spring Security) + ẩn UI theo quyền.

## 5. Màn hình then chốt (spec nghiệp vụ cho AI compose — TK-04 §4)

1. **Dashboard**: 4 stat card (thành viên, chờ duyệt, giỗ tháng này, quỹ đang chạy) + list giỗ 30 ngày + feed audit gần nhất.
2. **Danh sách thành viên**: DataTable server-side (keyset pagination), cột tùy chọn, filter đời/nhánh/giới/tình trạng, bulk: gán nhánh, đổi privacy, export.
3. **Change-request review**: split view diff, nút Approve/Reject + lý do, keyboard j/k duyệt nhanh hàng loạt.
4. **Widget composer trang chủ**: danh sách block kéo thả (hero, giỗ, tin, công đức...), form tham số từng block, preview iframe, publish có version.
5. **Ghi công đức**: form nhanh (tên — có autocomplete từ phả hệ, số tiền/hiện vật, chiến dịch), in biên nhận, hàng chờ đối soát chuyển khoản (import sao kê CSV ngân hàng → match tự động).
