# SRS-12a — Màn hình Soạn phả đồ (Admin Tree Editor)

**Phiên bản:** 1.0 · **Ngày:** 2026-07-17
**Tham chiếu:** TK-04, FR-12.4, FR-12.5, FR-12.6
**Mockup:** `instruction/mockups/admin-tree-editor.html`

---

## 1. Mục tiêu & phạm vi

Màn hình Soạn phả đồ là công cụ chính để ban quản trị tộc sự **xây dựng và duy trì phả hệ** — thêm thành viên, tạo hôn phối, nối quan hệ cha-con — trong một giao diện trực quan dạng sơ đồ SVG có khả năng pan/zoom. Đây là màn hình phức tạp nhất của khu admin, phục vụ bên trong (không công khai).

**Đối tượng người dùng:** Tộc trưởng, Thư ký gia phả, Ban quản trị.
**URL admin:** `/admin/tree-editor` (hoặc `/admin/gia-pha/:slug/soan-pha-do`).

---

## 2. Bố cục giao diện (Layout)

Giao diện chia **3 cột cố định + thanh tiêu đề**:

```
┌──────────────────────────────────────────────────────────┐
│  TOPBAR  (56px): Logo · Tiêu đề · Thống kê · Hành động  │
├──────────┬─────────────────────────────┬─────────────────┤
│  SIDEBAR │                             │  DETAIL PANEL   │
│  (256px) │       CANVAS SVG            │    (300px)      │
│  Danh    │  Pan/zoom · Phả đồ cây      │  Hiển thị khi   │
│  sách    │  Có thể mở rộng hết canvas  │  chọn hôn phối  │
│  thành   │                             │  hoặc thành     │
│  viên    │                             │  viên           │
└──────────┴─────────────────────────────┴─────────────────┘
```

### 2.1 Topbar

| Phần tử | Mô tả |
|---------|-------|
| Logo + tên app | "GiaPhaHub" |
| Tên phả hệ | "Họ Hoàng Trung Bình" |
| Thống kê nhanh | `N thành viên · M hôn phối · K quan hệ cha-con` — cập nhật real-time sau mỗi thao tác |
| Nút **Tải lại** | Tải lại toàn bộ dữ liệu từ API, giữ nguyên vị trí pan/zoom |
| Nút **Tạo hôn phối** | Mở modal tạo hôn phối mới (xem §5.2) |

### 2.2 Sidebar trái

- **Tiêu đề:** "Thành viên (N)"
- **Ô tìm kiếm:** tìm theo tên hoặc mã hiệu, lọc real-time danh sách bên dưới
- **Bộ lọc nhanh:** chip toggle — Tất cả · Nam · Nữ · Đời X (dropdown đời)
- **Danh sách thành viên:** cuộn được; mỗi mục gồm:
  - Avatar chữ cái màu (xanh = nam, đỏ = nữ)
  - Tên đầy đủ
  - Mã hiệu + đời (VD: `A1 · Đời 1`)
  - Badge đặc biệt: "Thủy tổ", "Hôn phối", "Chưa rõ tên"
  - **Trạng thái active**: người đang được chọn/nổi bật trên canvas
- **Nút "Thêm thành viên":** cuối sidebar → mở form thêm người mới

### 2.3 Canvas SVG (khu vực chính)

Xem §3 (Phả đồ SVG).

### 2.4 Panel phải (Detail Panel)

- Ẩn mặc định; hiện khi người dùng click vào hôn phối hoặc thành viên trên canvas
- Hai chế độ: **Union Panel** (§5.3) hoặc **Person Panel** (§5.4)
- Nút đóng (✕) góc phải

---

## 3. Phả đồ SVG (Canvas)

### 3.1 Nguyên tắc layout

**FR-12a.1** Mỗi thành viên là một **node hình chữ nhật bo góc** (120×54px cơ bản).

**FR-12a.2** Node được xếp theo **đời (generation)**:
- Trục Y: mỗi đời một hàng ngang, khoảng cách `ROW_H = 148px`
- Nhãn đời hiển thị bên trái canvas: "Đời 1 · Thủy tổ", "Đời 2"…

**FR-12a.3** Vợ chồng trong cùng một hôn phối và cùng đời được **đặt cạnh nhau** theo trục X với khoảng cách nhỏ `H_GAP = 28px`; các cặp/cá nhân khác nhau cách nhau `FAMILY_GAP = 48px`.

**FR-12a.4** Thứ tự ngang theo mã hiệu tự nhiên (A1, A2a, A2b…).

### 3.2 Kiểu node

| Thuộc tính | Nam | Nữ | Chưa rõ |
|-----------|-----|----|---------|
| Viền | `#1D4E89` (xanh) | `#7D1D3F` (đỏ tím) | `#D9CBAA` (vàng nhạt) |
| Thanh màu trái (8px) | Xanh | Đỏ tím | Vàng |
| Ký hiệu giới tính | ♂ | ♀ | ? |
| Nền khi được chọn | `#D6E4F5` | `#F5D6E2` | `#F5EFE0` |
| Viền khi được chọn | 2.5px + glow | 2.5px + glow | — |

Nội dung trong node (3 dòng):
1. **Tên đầy đủ** (font serif, 12px, bold, màu theo giới tính)
2. Mã hiệu + đời (10px, muted)
3. Ký hiệu giới tính + số đời (9px)

### 3.3 Đường kết nối

**FR-12a.5 — Hôn phối (union line):**
- Đường nét đứt ngang (`stroke-dasharray: 5,3`) nối giữa hai node vợ chồng
- Màu `#5C3A1E` (nâu trầm)
- Ký hiệu **kim cương vàng** (`♦`) ở điểm giữa đường nối — click vào kim cương để mở Union Panel

**FR-12a.6 — Quan hệ cha-con (child line):**
- Đường liền nét từ kim cương xuống thanh ngang, rồi từ thanh ngang xuống từng node con
- Màu `#D9CBAA`
- Thanh ngang nối các anh chị em cùng cha mẹ

**FR-12a.7** — Nếu thành viên chưa có hôn phối, đường cha-con nối thẳng từ node cha/mẹ xuống node con (không qua kim cương).

### 3.4 Pan & Zoom

**FR-12a.8** Toàn bộ phả đồ nằm trong một `<g>` transform; người dùng có thể:
- **Pan:** giữ và kéo chuột trên canvas trống (cursor: grab)
- **Zoom:** cuộn chuột (wheel) trên canvas — tỷ lệ 0.2× đến 2×
- **Nút zoom:** +/−/vừa màn hình (fit-to-screen) ở góc phải dưới
- Hiển thị tỷ lệ % hiện tại (VD: `85%`)

**FR-12a.9** Nút "Vừa màn hình" tính bounding box của toàn bộ node và scale/translate để vừa canvas.

**FR-12a.10** Nhãn đời (`Đời 1`, `Đời 2`…) **không bị zoom** — luôn hiển thị cố định bên trái canvas ở vị trí Y tương ứng với hàng đó, nhưng scroll theo pan dọc.

### 3.5 Chú thích (Legend)

Góc dưới trái canvas, không bị zoom:
- ■ Nam (xanh) · ■ Nữ (đỏ) · ◆ Hôn phối (vàng)
- `— —` Liên kết hôn nhân · `——` Quan hệ cha-con

### 3.6 Nền canvas

Nền chấm lưới (`radial-gradient` 28×28px) trên nền vàng nhạt `#FDF6E3` — giúp định hướng khi pan.

---

## 4. Tương tác chọn node

**FR-12a.11** Click vào **node thành viên**:
- Node được highlight (viền dày + nền tô)
- Thành viên tương ứng được highlight trong sidebar trái
- Panel phải chuyển sang **Person Panel** (§5.4)

**FR-12a.12** Click vào **kim cương hôn phối**:
- Panel phải chuyển sang **Union Panel** (§5.3)
- Hai node của hôn phối đó đều được highlight

**FR-12a.13** Click vào canvas trống: bỏ chọn tất cả, đóng panel phải.

---

## 5. Các hành động chỉnh sửa

### 5.1 Thêm thành viên mới

Trigger: nút "Thêm thành viên" ở sidebar hoặc từ Union Panel.

Form thu gọn (slide-in hoặc dialog):
| Trường | Bắt buộc | Ghi chú |
|--------|----------|---------|
| Họ tên | ✓ | |
| Giới tính | ✓ | Nam / Nữ / Chưa rõ |
| Đời (generation) | ✓ | Số nguyên dương; gợi ý tự động = đời của cha + 1 |
| Ngày sinh dương | | |
| Ngày sinh âm | | Nếu nhập âm → hệ tự quy đổi sang dương |
| Tình trạng | ✓ | Còn sống / Đã mất |
| Ghi chú ngắn | | |

Sau khi lưu: node xuất hiện ngay trên canvas (ở đúng hàng đời), sidebar cập nhật, thống kê topbar cập nhật.

### 5.2 Tạo hôn phối (modal)

Trigger: nút "Tạo hôn phối" trên topbar.

Modal fields:
| Trường | Bắt buộc | Ghi chú |
|--------|----------|---------|
| Thành viên 1 (chồng) | ✓ | Dropdown tìm kiếm — lọc theo tên/mã |
| Thành viên 2 (vợ) | | Có thể để trống nếu chưa rõ tên vợ |
| Loại hôn nhân | ✓ | Chính thất / Thứ thất / Người yêu / Chưa rõ |
| Ngày cưới (dương) | | |
| Ngày cưới (âm) | | |

Sau khi tạo: đường nét đứt + kim cương xuất hiện trên canvas; panel phải mở Union Panel của hôn phối vừa tạo.

**Validation:**
- Không cho phép tạo hai hôn phối trùng hai người (cùng cặp)
- Cảnh báo nếu hai người không cùng đời (hỏi xác nhận)

### 5.3 Union Panel (Panel hôn phối)

Hiển thị khi click kim cương. Các phần:

**A. Thành viên hôn phối**
- Danh sách card (tên + vai trò: Chồng/Vợ) + nút Xóa từng người
- Form thêm: dropdown chọn người + dropdown vai trò → nút "+ Thêm"

**B. Con cái (N)**
- Tag nhỏ mỗi người con (avatar chữ + tên) + nút "×" xóa liên kết
- Form thêm: dropdown chọn người con → nút "+ Thêm"
- Ghi chú: Thêm con **liên kết** người đã có trong hệ thống (không tạo mới)

**C. Thông tin hôn nhân**
- Grid 2 cột: Ngày cưới dương / âm / loại HN / trạng thái
- Trường readonly hiển thị, có nút "Chỉnh sửa"

**D. Nút hành động**
- **Lưu thay đổi** (primary)
- **Xóa hôn phối** (danger, confirm dialog) — chỉ xóa liên kết, không xóa người

### 5.4 Person Panel (Panel thành viên)

Hiển thị khi click node thành viên. Các phần:

**A. Thông tin cơ bản** (readonly + nút Edit dẫn sang form đầy đủ)
- Ảnh đại diện (nếu có) + Tên + Mã hiệu
- Giới tính · Đời · Tình trạng sống/mất

**B. Quan hệ tóm tắt**
- Cha/Mẹ: tên + link
- Anh chị em: số lượng
- Hôn phối: danh sách (click → mở Union Panel)
- Con: số lượng

**C. Nút hành động**
- **Xem hồ sơ đầy đủ** → điều hướng sang `/admin/persons/:code`
- **Đặt làm gốc cây** → vẽ lại canvas với người này làm root (thu hẹp chỉ hiện nhánh hậu duệ)
- **Xóa khỏi cây** (danger, confirm) — soft delete liên kết khỏi cây này

---

## 6. Chế độ xem cây từ root tùy chọn

**FR-12a.14** Nút "Đặt làm gốc cây" (trong Person Panel) → canvas re-render chỉ hiện nhánh hậu duệ của người đó.

**FR-12a.15** Breadcrumb trên canvas hiển thị: `Đang xem: [Tên người] & hậu duệ` + nút "Về toàn cây" để quay lại.

**FR-12a.16** Trạng thái root được lưu trong URL (`?root=A2a`) để có thể chia sẻ/bookmark.

---

## 7. Tìm kiếm & định vị trên canvas

**FR-12a.17** Tìm trong sidebar (§2.2) — khi click kết quả:
- Pan/zoom canvas đến node tương ứng (animated)
- Node được highlight
- Nếu canvas đang ở chế độ sub-tree mà người đó không trong view → hỏi "Chuyển về toàn cây để xem?"

---

## 8. Trạng thái loading & lỗi

**FR-12a.18** Khi tải dữ liệu lần đầu: skeleton loading trên canvas (placeholder node mờ).

**FR-12a.19** Khi API lỗi: Alert banner dưới topbar + nút Thử lại.

**FR-12a.20** Sau mỗi thao tác thành công: toast nhỏ góc phải dưới (VD: "✓ Đã tạo hôn phối #21") tự ẩn sau 3s.

**FR-12a.21** Nếu canvas có node nhưng không có vị trí (generation = null): node được xếp ở hàng "Chưa phân đời" phía dưới cùng, viền cam cảnh báo.

---

## 9. Yêu cầu hiệu năng

| Chỉ tiêu | Mục tiêu |
|----------|---------|
| Tải và render 200 node lần đầu | < 2s |
| Pan/zoom mượt | 60fps (dùng CSS transform, không re-render SVG) |
| Cập nhật sau thao tác (thêm/xóa node) | < 500ms |
| Tìm kiếm real-time trong sidebar | < 100ms |

---

## 10. Bảo mật & phân quyền

**FR-12a.22** Chỉ user có role `TREE_EDITOR` hoặc `ADMIN` mới truy cập được.

**FR-12a.23** Thao tác xóa hôn phối và xóa thành viên khỏi cây phải có dialog xác nhận 2 bước.

**FR-12a.24** Mọi thao tác chỉnh sửa phải ghi **audit log**: ai, lúc nào, thay đổi gì (diff JSON).

**FR-12a.25** Các trường ngày sinh đầy đủ của người còn sống chỉ hiển thị cho role `ADMIN` — áp dụng PII filter.

---

## 11. Tích hợp backend

| Hành động | Endpoint | Method |
|-----------|----------|--------|
| Tải toàn bộ dữ liệu cây | `GET /api/v1/trees/:slug/persons?size=500` + unions + members + children | GET |
| Tạo hôn phối | `POST /api/v1/trees/:slug/family-unions` | POST |
| Thêm thành viên hôn phối | `POST /api/v1/trees/:slug/family-unions/:id/members` | POST |
| Xóa thành viên hôn phối | `DELETE /api/v1/trees/:slug/union-members/:memberId` | DELETE |
| Thêm con vào hôn phối | `POST /api/v1/trees/:slug/family-unions/:id/children` | POST |
| Xóa quan hệ con | `DELETE /api/v1/trees/:slug/union-children/:childId` | DELETE |
| Tạo thành viên mới | `POST /api/v1/trees/:slug/persons` | POST |

---

## 12. Trạng thái chưa xử lý (Out of Scope — v1)

- Import/Export GEDCOM
- Undo/Redo thao tác
- Chế độ collaborative (nhiều người sửa cùng lúc)
- Drag & drop di chuyển node để đổi quan hệ
- In phả đồ từ admin (dùng portal viewer)
