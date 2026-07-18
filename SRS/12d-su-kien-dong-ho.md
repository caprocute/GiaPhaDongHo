# SRS-12d — Sự kiện dòng họ (ClanEvent)

**Version:** 1.0 · 2026-07-19  
**Liên kết:** SRS-12b (quỹ công đức), SRS-12c §2.2 (honorEvent), SRS-05 (ngày âm lịch), TK-06 (security)

---

## 0. Nguyên tắc bắt buộc

1. **Mọi sự kiện phải do admin CRUD** — không sinh sự kiện từ lịch máy, ngày giỗ, hay heuristic.
2. **Chi phí sự kiện phải ghi nhận từng khoản** — không gộp vào một con số tổng; mỗi khoản có người chịu trách nhiệm, ngày chi, mô tả rõ.
3. **Quỹ liên kết phải chọn tường minh** — sự kiện chỉ trừ quỹ khi admin gắn `linkedCampaignId` (campaign `purpose = event`).
4. **Không chi từ quỹ khi chưa có sự kiện ở trạng thái đã công bố** — expense chỉ tạo được khi event `status ≠ draft`.

---

## 1. Mục tiêu & phạm vi

| Trong phạm vi | Ngoài phạm vi |
|---------------|---------------|
| CRUD sự kiện + chi phí | Livestream / vé điện tử |
| RSVP thành viên (đăng ký tham dự) | Phân bổ nhân sự phức tạp (HR) |
| Gắn quỹ chiến dịch → trừ số dư | Bán hàng / thương mại tại sự kiện |
| Liên kết đợt học bổng (nếu là lễ vinh danh) | |
| Nhắc qua email/Zalo trước N ngày | |

**Actors**

| Actor | Việc được phép |
|-------|---------------|
| Khách (public) | Xem sự kiện đã công bố, không xem chi phí |
| Thành viên đăng nhập | Đăng ký tham dự (RSVP) |
| Thư ký / Admin | CRUD sự kiện, ghi chi phí, xuất báo cáo |

---

## 2. Thực thể

### 2.1 `ClanEvent` — Sự kiện dòng họ (**master data**)

| Field | Bắt buộc | Nguồn / ghi chú |
|-------|----------|-----------------|
| id | hệ thống | PK |
| treeId | hệ thống | FK FamilyTree |
| title | có | Admin đặt — không sinh từ ngày hệ thống |
| type | có | Enum: `ancestral_anniversary` / `clan_meeting` / `scholarship_ceremony` / `grave_renovation` / `other` |
| startsAt | có | Datetime (admin nhập) |
| endsAt | không | Datetime (nullable) |
| lunarDate | không | JSON `{day, month, year, isLeap}` qua `core.lunar` |
| location | không | Chuỗi địa chỉ |
| description | không | Nội dung mô tả (rich text) |
| coverImageKey | không | FK MinIO object key |
| status | có | `draft` / `published` / `completed` / `cancelled` |
| linkedCampaignId | không | FK `DonationCampaign` (`purpose = event`) — admin chọn tường minh |
| estimatedBudget | không | Dự toán chi phí (BigDecimal, admin nhập) |
| honorScholarshipRoundId | không | FK `ScholarshipAwardRound` — nếu đây là lễ vinh danh học bổng |
| createdBy / createdAt | hệ thống | |
| publishedBy / publishedAt | hệ thống | Khi chuyển status → published |
| cancelledBy / cancelledAt | hệ thống | |

**Quy tắc:**
- `draft` → không hiển thị portal, không ghi chi phí.
- `published` → hiển thị portal, RSVP mở, cho phép ghi chi phí.
- `completed` → hiển thị, RSVP đóng, vẫn ghi/sửa chi phí (hoàn tất quyết toán).
- `cancelled` → ẩn RSVP, không ghi chi phí mới; chi phí cũ giữ nguyên.

### 2.2 `ClanEventExpense` — Chi phí sự kiện (**giao dịch**)

Mỗi khoản chi phí tổ chức sự kiện là một bản ghi riêng — **cấm gộp**.

| Field | Bắt buộc | Nguồn / ghi chú |
|-------|----------|-----------------|
| id | hệ thống | PK |
| eventId | có | FK ClanEvent (`status ≠ draft`) |
| description | có | Mô tả khoản chi (VD "Mua 30kg nhang, nến", "Thuê âm thanh") |
| amount | có | BigDecimal (dương) |
| category | có | Enum: `catering` / `venue` / `equipment` / `printing` / `transport` / `ritual_items` / `other` |
| expenseDate | có | LocalDate (ngày chi thực tế, admin nhập) |
| paidByName | có | Tên người chi / đơn vị chi |
| receiptRef | không | Số hóa đơn / biên lai |
| receiptImageKey | không | FK MinIO (scan hóa đơn) |
| note | không | Ghi chú tự do |
| createdBy / createdAt | hệ thống | |
| confirmedBy / confirmedAt | hệ thống | Admin duyệt khoản chi; nullable nếu còn pending |
| status | có | `pending` / `confirmed` / `rejected` |

**Ràng buộc:**
- Chỉ chi phí `confirmed` mới được tính vào số dư quỹ của sự kiện.
- Số dư quỹ sự kiện = `campaign.raisedAmount` − `SUM(confirmed event expenses)` − chi phí khác cùng campaign.
- Không trao chi phí khi `event.status = draft` hoặc `= cancelled`.

### 2.3 `EventRsvp` — Đăng ký tham dự

| Field | Bắt buộc | Nguồn / ghi chú |
|-------|----------|-----------------|
| id | hệ thống | |
| eventId | có | FK ClanEvent (`published`) |
| userId | có | FK từ Keycloak JWT |
| headcount | không | Số người đi cùng (default 1) |
| note | không | Ghi chú thêm |
| rsvpAt | hệ thống | |

**Ràng buộc:** một user — một RSVP / event; có thể hủy trước khi event `completed`.

---

## 3. Luồng nguồn → đích

```text
[Admin tạo ClanEvent (draft)]
       │
       ▼ Admin công bố (published)
[ClanEvent (published)]
       │
       ├── [Thành viên RSVP] ──► EventRsvp
       │
       ├── [Admin ghi chi phí] ──► ClanEventExpense (pending)
       │         │
       │         ▼ Admin xác nhận chi phí
       │    ClanEventExpense (confirmed) ──► Trừ số dư quỹ linkedCampaignId
       │
       └── [Admin đánh dấu completed] ──► Admin quyết toán toàn bộ chi phí
```

| Thao tác UI | Nguồn | Đích | Không được làm |
|-------------|-------|------|----------------|
| Tạo sự kiện | Form admin | `ClanEvent (draft)` | Sinh tên từ ngày hệ thống |
| Công bố sự kiện | Admin | `status=published` | Tự công bố nếu chưa có title/date |
| Ghi khoản chi | Form admin (eventId, amount, desc, date) | `ClanEventExpense (pending)` | Gộp nhiều khoản |
| Xác nhận chi | Admin/Treasurer | `status=confirmed` | Xác nhận khi event=draft/cancelled |
| RSVP | Thành viên | `EventRsvp` | Cho guest RSVP khi event=draft |

---

## 4. API (hợp đồng mục tiêu)

Prefix: `/api/v1/trees/{slug}/…`

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/events` | Public | Sự kiện `published`/`completed` |
| GET | `/events/{id}` | Public | Chi tiết (không trả chi phí) |
| POST | `/events/{id}/rsvp` | Member | Đăng ký tham dự |
| DELETE | `/events/{id}/rsvp` | Member | Hủy RSVP |
| GET | `/events/admin` | ADMIN | Tất cả status |
| POST | `/events` | ADMIN | Tạo sự kiện |
| PUT | `/events/{id}` | ADMIN | Sửa / đổi status |
| GET | `/events/{id}/expenses` | ADMIN | Danh sách chi phí |
| POST | `/events/{id}/expenses` | ADMIN | Ghi khoản chi |
| PATCH | `/events/{id}/expenses/{eid}/confirm` | ADMIN/TREASURER | Xác nhận chi |
| PATCH | `/events/{id}/expenses/{eid}/reject` | ADMIN | Từ chối chi |
| GET | `/events/{id}/rsvps` | ADMIN | Danh sách đăng ký |
| GET | `/events/{id}/summary` | ADMIN | Tổng kết: chi phí theo hạng mục, số dư quỹ |

---

## 5. UI Admin — Màn hình Sự kiện

### 5.1 Header
```
Sự kiện dòng họ                         [+ Tạo sự kiện]
```

### 5.2 Danh sách sự kiện (ProTable)
Cột: Tên sự kiện / Loại / Ngày / Địa điểm / Trạng thái / Đăng ký / Chi phí đã xác nhận / Quỹ liên kết / Thao tác

Filter: `[Tìm kiếm...]` `[Loại ▼]` `[Trạng thái ▼]`

### 5.3 Chi tiết sự kiện (Detail panel / page riêng)

**[1] Event header:**
```
[Tên sự kiện]          [Badge status]  [Công bố] [Sửa] [Hủy]
Loại · ngày · địa điểm
Dự toán: X đ · Đã chi: Y đ · Quỹ liên kết: [Tên chiến dịch →]
```

**[2] Tab "Chi phí":**
- Filter: `[Hạng mục ▼]` `[Trạng thái ▼]` `[+ Ghi khoản chi]`
- Form ghi chi phí (collapse):
  - Mô tả khoản * / Số tiền * / Hạng mục * / Ngày chi * / Người chi * / Số biên lai / Scan HĐ / Ghi chú
  - [Lưu — chờ xác nhận] [Hủy]
- Table chi phí (ProTable): Mô tả / Số tiền / Hạng mục / Ngày / Người chi / Trạng thái / Thao tác
  - pending: [Xác nhận] [Từ chối]
  - confirmed: (xem)

**[3] Tab "Đăng ký tham dự":**
- Danh sách RSVP (ProTable): Thành viên / Số người đi cùng / Ghi chú / Ngày đăng ký
- Tổng: N người đăng ký

**[4] Tab "Liên kết":**
- Quỹ liên kết: tên chiến dịch + số dư hiện tại + link → màn Công đức
- Đợt học bổng liên kết (nếu có): tên đợt + link → màn Khuyến học

### 5.4 Dialog Tạo / Sửa sự kiện
- Tiêu đề *
- Loại sự kiện *
- Ngày bắt đầu * / Ngày kết thúc
- Ngày âm lịch (optional — DualDatePicker)
- Địa điểm
- Mô tả (Textarea)
- Dự toán chi phí
- Quỹ liên kết (select campaign purpose=event — optional)
- Liên kết đợt học bổng (select AwardRound open — optional)
- Trạng thái

### 5.5 Portal `/su-kien`
1. Danh sách sự kiện `published`: card với loại / ngày / địa điểm
2. Chi tiết sự kiện:
   - Mô tả đầy đủ
   - Form RSVP (thành viên đăng nhập)
   - Số người đã đăng ký (tổng, không hiển thị danh sách cá nhân)
3. **Không hiển thị chi phí ra ngoài portal**

### 5.6 Responsive
- `< 1024px`: chi tiết sự kiện full-width single column; tab "Chi phí" ẩn theo mặc định (accordion)
- `< 640px`: table chi phí giản lược còn Mô tả / Số tiền / Trạng thái

---

## 6. Kết nối với các module khác

| Từ | Đến | Liên kết |
|----|-----|---------|
| ClanEvent detail | DonationCampaign | Link "Xem quỹ →" trong tab Liên kết |
| ClanEvent detail | ScholarshipAwardRound | Link "Xem đợt học bổng →" nếu có honorScholarshipRoundId |
| DonationCampaign detail | ClanEvent | Tab "Sự kiện liên quan" — list event.linkedCampaignId = campaign.id |
| ScholarshipAwardRound detail | ClanEvent | Link "Xem lễ vinh danh →" nếu có honorEvent |

---

## 7. Bảo mật & phân quyền

- Public: GET events (published), POST RSVP (member)
- ROLE_ADMIN / ROLE_TREASURER: CRUD event, ghi và xác nhận chi phí
- Diff chạm expense confirm → audit log + người duyệt thứ hai
- Chi phí: mọi thao tác confirm/reject ghi vào `audit_log`

---

## 8. Kiểm thử chấp nhận (UAT)

1. Tạo sự kiện `draft` → không hiện portal, không ghi chi phí được.
2. Công bố sự kiện → portal hiện; thành viên RSVP được.
3. Ghi khoản chi → trạng thái `pending`; số dư quỹ chưa đổi.
4. Xác nhận chi → số dư quỹ giảm đúng số tiền.
5. Từ chối chi → số dư giữ nguyên; khoản chi không tính.
6. Không có quỹ liên kết → ghi chi phí vẫn được (chỉ không trừ quỹ), cần ghi chú nguồn.
7. Event `cancelled` → không ghi chi phí mới; chi phí đã confirmed giữ nguyên.

---

## 9. Trace

| Mã | Nội dung |
|----|---------|
| FR-12d.1–… | Các mục §2–§5 tài liệu này |
| SRS-12b | DonationCampaign.purpose = event — quỹ nguồn |
| SRS-12c §2.2 | honorEvent FK ClanEvent |
| SRS-05 | Âm lịch — DualDatePicker |
| Rule | `no-tech-jargon-on-ui`, `data-provenance-admin` |
