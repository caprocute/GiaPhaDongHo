# SRS-12b — Quản trị quỹ công đức (Admin + Portal)

**Version:** 1.1 · 2026-07-19 (bổ sung bên CHI, cross-ref sổ quỹ)  
**Liên kết:** FR-07.1–07.7 (SRS-07), FR-12a (admin soan pha), TK-06 (security), SRS-12c (khuyến học), SRS-12d (sự kiện), SRS-12e (sổ quỹ thu–chi)

---

## 1. Mục tiêu & phạm vi

Màn hình `/donation` trong admin portal và trang `/cong-duc` trong portal thành viên hỗ trợ
toàn bộ luồng: chiến dịch gây quỹ → thành viên đóng góp → admin xác nhận → bảng vàng công đức.

**Actors:** Quản trị viên (ROLE_ADMIN), Thủ quỹ (ROLE_TREASURER), Thành viên (authenticated member), Khách (public).

---

## 2. Luồng hệ thống

### 2.1 Admin ghi nhận trực tiếp (tiền mặt / hiện vật)
1. Admin chọn chiến dịch đang mở.
2. Click "Ghi nhận mới" → form inline mở.
3. Nhập: tên người đóng, số tiền, loại (`money_cash` / `goods` / `labor`), ghi chú, isPublic.
4. Submit → `POST /contributions?confirm=true` → `status=confirmed`, `raisedAmount` tăng.
5. Tùy chọn in biên nhận PDF.

### 2.2 Thành viên portal đóng góp (chuyển khoản)
1. Thành viên vào `/cong-duc` → chọn chiến dịch đang mở → điền form (họ tên, số tiền tùy chọn).
2. Submit → `POST /contributions?confirm=false` → `status=pending_portal`.
3. Admin thấy đóng góp trong tab "Chờ xác nhận" với badge đếm.
4. Admin đối chiếu sao kê, click "Xác nhận" → `PATCH /contributions/{id}/confirm` → `status=confirmed`.
5. Hoặc "Từ chối" → `PATCH /contributions/{id}/reject` → `status=rejected`.

### 2.3 Chuyển khoản không khai (đối soát sao kê)
1. Admin đọc sao kê ngân hàng thấy giao dịch không có `pending_portal` tương ứng.
2. Admin tạo thủ công với loại `money_transfer`, `status=confirmed`.

---

## 3. Entities DB

### DonationCampaign
| Field | Type | Ghi chú |
|---|---|---|
| id | Long | PK tự sinh |
| treeId | String | FK mã dòng họ |
| title | String(255) | Tên chiến dịch * |
| description | Text | Mô tả (nullable) |
| goalAmount | BigDecimal | Mục tiêu (nullable) |
| raisedAmount | BigDecimal | Computed: SUM confirmed contributions |
| status | Enum | `draft` / `open` / `closed` |
| purpose | Enum | `general` / `scholarship` / `tomb` / `ancestral_house` / `genealogy` / `event` / `relief` / `other` — **do admin chọn**, không đoán theo tên. `scholarship` = nguồn quỹ cho SRS-12c |
| vietqrPayload | String | JSON `{bankBin,accountNo,accountName}` |
| createdAt | Instant | Auto |
| updatedAt | Instant | Auto |

**Quy tắc:** `raisedAmount` = aggregate từ confirmed contributions; backend cập nhật bằng trigger hoặc computed lúc query.

### DonationContribution
| Field | Type | Ghi chú |
|---|---|---|
| id | Long | PK |
| campaignId | Long | FK → DonationCampaign |
| treeId | String | FK |
| donorName | String(255) | Tên người đóng * |
| personCode | String(50) | Mã thành viên (nullable) |
| amount | BigDecimal | Số tiền |
| kind | Enum | `money_cash` / `money_transfer` / `goods` / `labor` |
| status | Enum | `confirmed` / `pending_portal` / `pending_reconcile` / `rejected` |
| isPublic | Boolean | Hiển thị trên bảng vàng portal, mặc định true |
| note | String(500) | Ghi chú tự do |
| createdAt | Instant | Auto |
| confirmedAt | Instant | Nullable — khi admin xác nhận |
| confirmedBy | String | UserId admin xác nhận |

---

## 4. API Endpoints

| Method | Path | Auth | Mô tả |
|---|---|---|---|
| GET | `/donation-campaigns` | Public | Chiến dịch đang mở (status=open) |
| GET | `/donation-campaigns/{id}?amount={n}` | Public | Chi tiết + VietQR URL |
| GET | `/donation-campaigns/admin?page&size` | ADMIN | Tất cả chiến dịch (all status) |
| POST | `/donation-campaigns` | ADMIN | Tạo chiến dịch |
| PUT | `/donation-campaigns/{id}` | ADMIN | Cập nhật / đổi status |
| GET | `/donation-campaigns/{id}/contributions/admin?status&kind&search&page&size` | ADMIN | Danh sách đóng góp |
| POST | `/donation-campaigns/{id}/contributions?confirm=true` | ADMIN | Ghi nhận trực tiếp (confirmed) |
| POST | `/donation-campaigns/{id}/contributions?confirm=false` | Member | Đăng ký từ portal (pending_portal) |
| PATCH | `/donation-campaigns/{id}/contributions/{cid}/confirm` | ADMIN | Xác nhận pending |
| PATCH | `/donation-campaigns/{id}/contributions/{cid}/reject` | ADMIN | Từ chối pending |
| GET | `/donation-campaigns/{id}/contributions/{cid}/receipt` | ADMIN | Biên nhận HTML/PDF |
| GET | `/honor-board` | Public | Bảng vàng công đức (confirmed + isPublic) |

---

## 5. UI Admin — Màn hình Quỹ công đức

### 5.1 Page Header
```
Quỹ công đức                                    [Xuất Excel] [+ Tạo chiến dịch]
Quản lý chiến dịch gây quỹ, ghi nhận đóng góp và in biên nhận.
```

### 5.2 Stats (4 ô)
| Label | Nguồn |
|---|---|
| Tổng quỹ đã thu | SUM raisedAmount tất cả campaigns |
| Chiến dịch đang mở | COUNT status=open |
| Người đóng góp | COUNT DISTINCT donorName, confirmed |
| Chờ xác nhận | COUNT pending_portal + pending_reconcile |

Stats lấy từ response header/body khi gọi campaign list (hoặc dashboard API thêm field).

### 5.3 Master-detail layout

**Desktop (≥ 1024px):** grid `280px 1fr`

**Sidebar (campaign list):**
- Label "CHIẾN DỊCH" (uppercase, muted)
- Mỗi item: tên campaign + badge status + raised mini + mini progress bar
- Khi chọn: highlight border gold + background muted
- Pagination nếu > 10 campaigns

**Detail panel:**

**[1] Campaign header:**
```
[Tên chiến dịch]          [Badge: Đang mở]   [Sửa]  [Đóng chiến dịch / Mở lại]
```

**[2] Progress section:**
```
127,5 triệu đồng đã thu / Mục tiêu: 200 triệu
████████████████████░░░░░░░░░░ 63% · 84 người đóng góp
```

**[3] VietQR box (nếu đã cấu hình bankBin/accountNo):**
```
[QR 80×80]  Vietcombank – 1234567890  [Tải QR]
            HỘI ĐỒNG HỌ ...
            Nội dung: [transferContent]
```

**[4] Contribution section:**
- Tab strip: `Tất cả` | `Chờ xác nhận (n)` | `Đã xác nhận` | `Từ chối`
- Filter bar: `[Tìm người đóng...]` `[Loại ▼]` `[+ Ghi nhận mới]`
- Form ghi nhận (collapse khi không cần):
  - Người công đức *, Số tiền (VND), Loại, Ghi chú, Hiển thị bảng vàng
  - [Ghi nhận & cộng quỹ] [Hủy]
- Contribution table (CSS grid):
  - Cột: Người công đức / Số tiền / Loại / Trạng thái / Ngày / Thao tác
  - Pending: [Xác nhận] [Từ chối]
  - Confirmed: [Biên nhận ↗]
- Pagination

### 5.4 Campaign Create/Edit Dialog
- Tiêu đề *
- Mô tả (Textarea)
- Mục tiêu (VND, optional)
- Trạng thái (draft / open / closed)
- Ngân hàng (bankBin — dropdown phổ biến: Vietcombank 970436, BIDV 970418, Agribank 970405)
- Số tài khoản
- Tên tài khoản

### 5.5 Mobile (< 1024px)
- fund-layout: single column, sidebar → tab strip nằm ngang cuộn được
- Contribution table: giản lược còn Người / Số tiền / Thao tác; các cột phụ ẩn
- Form fields: single column

---

## 6. Portal — /cong-duc (CongDucClient)

### 6.1 Layout
1. Danh sách chiến dịch đang mở: card với progress bar + raised/goal
2. Click chiến dịch → expand panel:
   - VietQR image + bank info + nội dung CK
   - Form đóng góp: Họ tên *, Số tiền (optional), Ghi chú, [Đăng ký đóng góp]
   - Sau submit: thông báo thành công, form reset
3. Bảng vàng công đức: danh sách confirmed+isPublic (HonorBoardCard)

### 6.2 Portal contribution form
```
Tên bạn *  [Hoàng Minh Quang               ]
Số tiền    [1,000,000           ] VND (để trống nếu chưa biết)
Ghi chú    [Thay mặt chi họ Hoàng Đông...  ]
           [Đăng ký đóng góp]
```
→ POST /contributions?confirm=false
→ Hiển thị: "Cảm ơn! Sau khi thủ quỹ xác nhận, tên bạn sẽ xuất hiện trên bảng vàng."

---

## 7. Dashboard Widget

KPI card "Quỹ công đức" (đã có trong DashboardPage) hiển thị chiến dịch open đầu tiên.
Mở rộng tương lai: Panel riêng với progress bars cho tất cả chiến dịch đang mở.

---

## 7b. Bên CHI (Expense) — liên kết với SRS-12e

Campaign detail panel thêm tab **"Sổ thu–chi"** — xem SRS-12e §6.1:

- Hiển thị `fund_ledger_v` filter theo `campaign_id`: tất cả thu (contributions confirmed) + chi (awards, event expenses, fund expenses).
- KPI inline: **Tổng thu / Tổng chi / Số dư**.
- Nút **[+ Ghi khoản chi]** → tạo `FundExpense` gắn campaign này (SRS-12e §2).
- Tab "Chờ duyệt" (badge đếm): FundExpense pending + ClanEventExpense pending của sự kiện liên kết campaign này.

**Kết nối tới các module:**

| Từ campaign detail | Đến | Điều kiện |
|--------------------|-----|-----------|
| Tab "Sự kiện" | Danh sách ClanEvent.linkedCampaignId = this | Luôn hiện (có thể rỗng) |
| Tab "Khuyến học" | Danh sách AwardRound.fundCampaignId = this | Chỉ khi purpose = scholarship |
| Nút [Xem sổ đầy đủ →] | Màn Sổ quỹ (SRS-12e) filter campaign này | Luôn hiện |

**Số dư thực tế campaign (thêm vào Campaign header §5.3):**
```
127,5 tr đã thu / Mục tiêu: 200 tr
▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓░░░░░░░░░░ 63%  ·  84 người
Đã chi: 35,2 tr  ·  Số dư: 92,3 tr  [Xem sổ →]
```

`raisedAmount` (thu) và `totalExpenses` (chi) lấy từ `fund_ledger_v` — không lưu riêng trong campaign.

---

## 8. Bảo mật & phân quyền

- Public: GET campaigns, GET honor-board, POST contributions?confirm=false
- ROLE_MEMBER: POST contributions?confirm=false (với userId từ JWT)
- ROLE_ADMIN / ROLE_TREASURER: toàn bộ admin operations
- Diff chạm donation confirm/reconcile → `/security-review` + người duyệt thứ hai
- Audit log: mọi thao tác xác nhận/từ chối/tạo chiến dịch

---

## 9. Yêu cầu phi tính năng

- **FR-12b.N1:** Giá trị tiền tệ format `vi-VN` + đơn vị "đ" / "tr" / "tỷ"
- **FR-12b.N2:** VietQR QR image từ backend (không call vietqr.io trực tiếp từ client)
- **FR-12b.N3:** raisedAmount = SUM confirmed (không lưu riêng, backend tính hoặc aggregate)
- **FR-12b.N4:** isPublic mặc định true; thành viên có thể unchecked khi đăng ký ẩn danh
- **FR-12b.N5:** Excel export: tên / số tiền / loại / ngày / ghi chú; chỉ confirmed contributions
- **FR-12b.N6:** receipt = HTML in (window.print) hoặc PDF tải về
