# SRS-12c — Quản trị Khuyến học & Bảng vàng (Admin + Portal)

**Version:** 1.0 · 2026-07-19  
**Liên kết:** F8 (TK-06), FR-07 (quỹ), FR-15.35 (parity mockup), SRS-12b (quỹ công đức)

---

## 0. Nguyên tắc bắt buộc

1. **Mọi dữ liệu hiển thị phải có nguồn gốc quản trị được** — không sinh nhãn/đợt/số liệu từ lịch máy, heuristic tên, hay hardcode UI.
2. **Master data do thư ký/tộc trưởng CRUD** trước khi dùng ở luồng nghiệp vụ (đợt trao, quỹ nguồn, hồ sơ thành tích).
3. **Nguồn → đích rõ ràng** trên mỗi thao tác (bảng §3); UI không được gộp hai bước khác nguồn vào một nút mơ hồ.
4. **Không đoán quỹ theo tên chiến dịch** — chỉ gắn qua `DonationCampaign.purpose = scholarship` (SRS-12b mở rộng) do admin chọn.
5. Chữ trên UI: ngôn ngữ nghiệp vụ (rule `no-tech-jargon-on-ui`).

---

## 1. Mục tiêu & phạm vi

| Trong phạm vi | Ngoài phạm vi (phiên bản sau) |
|---------------|-------------------------------|
| Đề cử / CRUD hồ sơ thành tích | Chi trả ngân hàng tự động |
| Duyệt vào bảng vàng cổng thông tin | Xếp hạng học bổng AI |
| **Đợt trao học bổng** (CRUD) gắn quỹ | Multi-currency |
| Ghi nhận suất tiền theo đợt | Import Excel hàng loạt (RP riêng) |
| Liên kết lễ vinh danh (ClanEvent) tùy chọn | |

**Actors**

| Actor | Việc được phép |
|-------|----------------|
| Thành viên đăng nhập (portal) | Đề cử hồ sơ (chờ duyệt) |
| Thư ký / tộc trưởng (admin) | CRUD hồ sơ, duyệt/từ chối, CRUD đợt, trao suất, xuất danh sách |
| Khách | Chỉ xem bảng vàng đã duyệt |

---

## 2. Thực thể (source of truth)

### 2.1 `ScholarshipEntry` — hồ sơ thành tích

| Field | Bắt buộc | Nguồn / ghi chú |
|-------|----------|-----------------|
| id | hệ thống | PK |
| tree | hệ thống | FK FamilyTree |
| personName | có | Form đề cử / admin |
| personCode | không | Liên kết Person (nếu có) |
| person | không | FK Person khi resolve được mã |
| achievement | có | Form |
| level | có | Enum: `phd` / `master` / `university` / `highschool` |
| schoolOrField | không | Form |
| medalNote | không | Form |
| lineageNote | không | Form / suy từ Person |
| year | có | Năm thành tích (do người nhập) |
| status | hệ thống | `nominated` → `approved` \| `rejected` |
| reviewNote | không | Admin khi duyệt |
| createdBy | hệ thống | userId đề cử / admin |
| createdAt | hệ thống | |
| reviewedAt / reviewedBy | hệ thống | Khi duyệt/từ chối |

**Đích công bố:** `status = approved` → hiện portal bảng vàng.  
**Cấm:** gắn số tiền học bổng ở bước duyệt bảng vàng.

### 2.2 `ScholarshipAwardRound` — đợt trao học bổng (**master data**)

Mỗi «Đợt …» trên UI **bắt buộc** là bản ghi này — **cấm** ghép từ tháng/năm hệ thống.

| Field | Bắt buộc | Nguồn / ghi chú |
|-------|----------|-----------------|
| id | hệ thống | PK |
| tree | hệ thống | FK |
| title | có | VD «Đợt 2/2026 — Giỗ tổ», do admin đặt |
| code | không | Mã nội bộ ngắn (tuỳ chọn) |
| fundCampaign | có | FK → `DonationCampaign` (`purpose = scholarship`, cùng tree) |
| openFrom / openTo | không | Khoảng thời gian đợt (admin) |
| defaultAmount | không | Gợi ý số tiền mỗi suất khi trao |
| status | có | `draft` / `open` / `closed` |
| honorEvent | không | FK ClanEvent nếu đã tạo lễ vinh danh |
| note | không | |
| createdBy / createdAt | hệ thống | |
| closedAt / closedBy | hệ thống | Khi đóng đợt |

**Quy tắc**

- Chỉ đợt `open` mới được dùng để trao suất.
- Một đợt chỉ gắn **một** quỹ khuyến học; đổi quỹ = sửa đợt (audit).
- Đóng đợt không xóa lịch sử suất đã trao.

### 2.3 `ScholarshipAward` — suất đã trao (giao dịch)

| Field | Bắt buộc | Nguồn / ghi chú |
|-------|----------|-----------------|
| id | hệ thống | PK |
| round | có | FK AwardRound |
| entry | có | FK Entry (`approved`) |
| amount | có | Admin nhập / mặc định từ đợt |
| awardedAt | hệ thống | |
| awardedBy | hệ thống | userId |
| note | không | |

**Đích:** tổng hợp «Học bổng đã trao», trừ dần «quỹ còn» = `campaign.raisedAmount − SUM(awards.amount)` trong các đợt gắn quỹ đó.  
**Ràng buộc:** mỗi `(entry, round)` tối đa một suất; entry chưa `approved` thì không trao.

### 2.4 Quỹ nguồn

- Chỉ `DonationCampaign` với `purpose = scholarship` (SRS-12b).
- Admin chọn quỹ khi **tạo/sửa đợt**, không chọn ngầm theo tên.

---

## 3. Luồng nguồn → đích

```text
[A] Portal đề cử ──POST──► Entry(nominated)
[B] Admin «Thêm hồ sơ» ──► Entry(nominated|approved nếu công bố ngay)

Entry(nominated) ──Duyệt──► Entry(approved) ──► Portal Bảng vàng
                 ──Từ chối──► Entry(rejected)

Admin CRUD AwardRound(open) + chọn quỹ scholarship
Entry(approved) + Round(open) ──Trao suất──► Award ──► KPI tiền / quỹ còn
                                         └─(tuỳ chọn)──► ClanEvent lễ vinh danh
```

| Thao tác UI | Nguồn | Đích | Không được làm |
|-------------|-------|------|----------------|
| Gửi đề cử / Thêm hồ sơ | Form người dùng | `ScholarshipEntry` | Tự công bố nếu chưa tick |
| Vào bảng vàng | Entry chờ duyệt | `status=approved` + portal | Ghi tiền |
| Tạo đợt trao | Form admin | `ScholarshipAwardRound` | Sinh «Đợt n/năm» tự động |
| Trao học bổng đợt | Entry đã duyệt + đợt đang mở | `ScholarshipAward` | Trao khi chưa có đợt / chưa chọn quỹ |
| Xem quỹ | FK đợt → campaign | Màn Công đức | Đoán quỹ khác purpose |

---

## 4. API (hợp đồng mục tiêu)

Prefix: `/api/v1/trees/{slug}/…`  
Quyền: `scholarship:entry:nominate` | `read` | `review` (đã có); thêm `scholarship:round:write` nếu tách (hoặc gộp `review` cho đợt).

| Method | Path | Mô tả |
|--------|------|--------|
| GET | `/scholarship-board` | Public — entry `approved` |
| GET/POST | `/scholarship-entries` | Portal đề cử |
| GET | `/scholarship-entries/admin` | Lọc status/level/year/q |
| POST/PUT/DELETE | `/scholarship-entries/admin[/{id}]` | CRUD admin |
| POST | `/scholarship-entries/{id}/approve\|reject` | Duyệt bảng vàng (không tiền) |
| GET/POST | `/scholarship-award-rounds` | List / tạo đợt |
| PUT | `/scholarship-award-rounds/{id}` | Sửa / đổi status / gắn quỹ |
| POST | `/scholarship-award-rounds/{id}/awards` | Trao hàng loạt `{ entryIds[], amount? }` |
| GET | `/scholarship-entries/stats` | KPI — **đợt hiện hành = đợt `open` mới nhất do admin**, không phải lịch máy |

---

## 5. UI Admin (màn Khuyến học)

### 5.1 Header
- Tiêu đề nghiệp vụ; nút: **Xuất danh sách**, **Quản lý đợt**, **Thêm hồ sơ**.
- Không nút «Trao» nếu chưa có đợt `open`.

### 5.2 Khối quỹ & đợt (thay banner tự sinh)
Hiển thị **đợt đang mở** (nếu có):

- Tên đợt + khoảng ngày (từ bản ghi).
- Quỹ nguồn: tiêu đề chiến dịch + link Công đức (`fundCampaignId`).
- Quỹ còn / số suất chưa trao trong đợt (tính từ Award + Entry).
- CTA: **Trao suất đợt này** (mở dialog chọn entry + số tiền), **Sửa đợt**.

Nếu không có đợt `open`: empty state «Chưa có đợt trao — tạo đợt và chọn quỹ khuyến học».

### 5.3 Tabs hồ sơ
`Chờ duyệt` | `Bảng vàng` | `Chờ trao tiền` (approved chưa có Award) | `Từ chối` | `Tất cả`.

### 5.4 Dialog Quản lý đợt
CRUD: tiêu đề, quỹ (select chỉ campaign `purpose=scholarship`), ngày, số tiền gợi ý, trạng thái, ghi chú, tuỳ chọn tạo/gắn sự kiện vinh danh.

### 5.5 Portal
- Form đề cử: bắt buộc trình độ + thành tích + năm.
- Bảng vàng: chỉ `approved`; lọc trình độ phía client/API.

---

## 6. Lệch hiện trạng

| Đã đóng (2026-07-19) | Cách đóng |
|----------------------|-----------|
| Nhãn «Đợt n/năm» từ lịch máy | Stats/`awardRoundLabel` = `AwardRound.title` đợt `open` |
| Banner quỹ đầu tiên theo purpose | Banner theo đợt `open` + `fundCampaign` của đợt |
| Trao thẳng `entry.awardAmount` | `POST …/scholarship-award-rounds/{id}/awards` → `ScholarshipAward` (+ denormalize entry) |
| Không CRUD đợt | API + dialog «Quản lý đợt» trên admin |
| KPI đợt không quản trị | `GET …/stats` lấy đợt `open` mới nhất |

---

## 7. Kiểm thử chấp nhận (UAT)

1. Tạo chiến dịch Công đức `purpose=scholarship` tên bất kỳ → chưa hiện đợt trên Khuyến học.
2. Tạo đợt «Giỗ tổ 2026», gắn quỹ đó, `open` → banner hiện đúng tên đợt + tên quỹ.
3. Đổi tên đợt → banner đổi theo; không phụ thuộc ngày hệ thống.
4. Duyệt entry → portal có; quỹ còn không đổi.
5. Trao suất trong đợt → KPI tiền tăng; quỹ còn giảm theo công thức §2.3.
6. Đóng đợt → không trao thêm; lịch sử Award giữ nguyên.
7. Không có đợt `open` → không trao được; UI giải thích rõ.

---

## 8. Trace

| Mã | Nội dung |
|----|----------|
| F8 | TK-06 khuyến học |
| FR-15.35 | Parity mockup + số liệu thật |
| FR-12c.1–… | Các mục §2–§5 tài liệu này |
| Rule | `.cursor/rules/data-provenance-admin.mdc` |
