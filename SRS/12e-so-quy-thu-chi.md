# SRS-12e — Sổ quỹ thu–chi thống nhất (Fund Ledger)

**Version:** 1.0 · 2026-07-19  
**Liên kết:** SRS-12b (quỹ công đức + thu), SRS-12c (khuyến học + chi), SRS-12d (sự kiện + chi phí), TK-06 (audit)

---

## 0. Nguyên tắc bắt buộc

1. **Mỗi khoản thu, mỗi khoản chi = một bản ghi** — không tổng hợp ngầm, không gộp nhiều khoản.
2. **Không có khoản nào tự xuất hiện** — mọi entry đều do admin tạo hoặc confirm tường minh; không có trigger DB tự sinh sổ.
3. **Quỹ nào → chi đó** — mỗi khoản chi gắn tường minh với một chiến dịch; không "chi chung chung" mà không rõ nguồn.
4. **Số dư = tổng hợp tính toán, không lưu trùng** — `balance` là view/query-time computed; không có cột balance để update trực tiếp.
5. **Audit log bắt buộc** — mọi thao tác confirm / reject / tạo khoản chi đều ghi `audit_log`.

---

## 1. Mô hình thu–chi theo chiến dịch

```
DonationCampaign (Quỹ nguồn)
    │
    THU IN                              CHI RA
    │                                    │
    ├── DonationContribution (confirmed) ─┤
    │   kind: cash/transfer/goods/labor  │
    │                                    ├── ScholarshipAward
    │                                    │   (purpose=scholarship)
    │                                    │
    │                                    ├── ClanEventExpense (confirmed)
    │                                    │   (purpose=event, via event.linkedCampaignId)
    │                                    │
    │                                    └── FundExpense (confirmed)
    │                                        (bất kỳ purpose: tomb/ancestral_house/general/...)
    │
    Số dư thực tế = SUM(confirmed contributions)
                  − SUM(scholarship awards for rounds linked here)
                  − SUM(confirmed event expenses for events linked here)
                  − SUM(confirmed fund expenses for this campaign)
```

---

## 2. Thực thể mới: `FundExpense` — Chi phí thông thường của quỹ

Dùng cho các khoản chi **không phải học bổng và không phải chi phí sự kiện** (xây lăng, nhà thờ, văn phòng phẩm, in ấn gia phả, v.v.).

| Field | Bắt buộc | Nguồn / ghi chú |
|-------|----------|-----------------|
| id | hệ thống | PK |
| campaignId | có | FK DonationCampaign (admin chọn — quỹ nào chịu khoản này) |
| treeId | hệ thống | FK FamilyTree |
| description | có | Mô tả khoản chi rõ ràng (VD "Đổ bê tông nền nhà thờ họ đợt 1") |
| amount | có | BigDecimal (dương) |
| category | có | Enum: `construction` / `maintenance` / `printing` / `admin` / `catering` / `transport` / `other` |
| expenseDate | có | LocalDate (ngày chi thực tế, admin nhập — không phải ngày hệ thống) |
| paidByName | có | Tên người / đơn vị thực hiện chi |
| receiptRef | không | Số hóa đơn / biên lai |
| receiptImageKey | không | FK MinIO (scan hóa đơn / biên lai) |
| note | không | Ghi chú tự do |
| status | có | `pending` / `confirmed` / `rejected` |
| createdBy / createdAt | hệ thống | |
| confirmedBy / confirmedAt | hệ thống | Nullable — khi admin/treasurer xác nhận |
| rejectedBy / rejectedAt | hệ thống | Nullable |

**Ràng buộc:**
- Chỉ `confirmed` mới tính vào số dư.
- `campaign` phải `status ≠ draft` mới tạo được khoản chi.
- Mỗi khoản chi phải có `description` + `expenseDate` + `paidByName` — không chấp nhận khoản mơ hồ.

---

## 3. View tổng hợp (Fund Ledger View)

Đây là VIEW database, không phải bảng riêng — tránh lưu trùng dữ liệu.

```sql
-- fund_ledger_v (triển khai trong Liquibase changelog)
SELECT
  'credit'               AS direction,
  'contribution'         AS source_type,
  dc.campaign_id         AS campaign_id,
  dc.amount,
  dc.confirmed_at        AS tx_date,
  dc.donor_name          AS label,
  dc.id                  AS source_id
FROM donation_contribution dc
WHERE dc.status = 'confirmed'

UNION ALL

SELECT
  'debit', 'scholarship_award',
  sar.fund_campaign_id,
  sa.amount,
  sa.awarded_at,
  se.person_name || ' — ' || round.title,
  sa.id
FROM scholarship_award sa
JOIN scholarship_award_round round ON round.id = sa.round_id
JOIN scholarship_entry se ON se.id = sa.entry_id
JOIN donation_campaign sar ON sar.id = round.fund_campaign_id

UNION ALL

SELECT
  'debit', 'event_expense',
  ce.linked_campaign_id,
  cee.amount,
  cee.expense_date,
  cee.description || ' [' || ev.title || ']',
  cee.id
FROM clan_event_expense cee
JOIN clan_event ev ON ev.id = cee.event_id
WHERE cee.status = 'confirmed'
  AND ev.linked_campaign_id IS NOT NULL

UNION ALL

SELECT
  'debit', 'fund_expense',
  fe.campaign_id,
  fe.amount,
  fe.expense_date,
  fe.description,
  fe.id
FROM fund_expense fe
WHERE fe.status = 'confirmed'
```

**Số dư mỗi chiến dịch:**
```sql
SELECT
  campaign_id,
  SUM(CASE WHEN direction = 'credit' THEN amount ELSE 0 END) AS total_income,
  SUM(CASE WHEN direction = 'debit'  THEN amount ELSE 0 END) AS total_expense,
  SUM(CASE WHEN direction = 'credit' THEN amount ELSE -amount END) AS balance
FROM fund_ledger_v
GROUP BY campaign_id;
```

---

## 4. API bổ sung cho sổ quỹ

Prefix: `/api/v1/trees/{slug}/…`

| Method | Path | Auth | Mô tả |
|--------|------|------|-------|
| GET | `/fund-ledger?campaignId={id}&direction=&from=&to=&page=&size=` | ADMIN/TREASURER | Sổ quỹ tổng hợp (từ view) |
| GET | `/fund-summary` | ADMIN | Tóm tắt số dư tất cả chiến dịch (dashboard widget) |
| GET | `/fund-expenses?campaignId={id}&status=&page=&size=` | ADMIN/TREASURER | Danh sách FundExpense |
| POST | `/fund-expenses` | ADMIN | Tạo khoản chi thủ công |
| PUT | `/fund-expenses/{id}` | ADMIN | Sửa khoản chi (chỉ khi pending) |
| PATCH | `/fund-expenses/{id}/confirm` | ADMIN/TREASURER | Xác nhận chi |
| PATCH | `/fund-expenses/{id}/reject` | ADMIN | Từ chối chi |
| GET | `/fund-expenses/{id}/receipt` | ADMIN | Xem biên lai đính kèm |

---

## 5. UI Admin — Sổ quỹ thu–chi

### 5.1 Vị trí trong navigation
Màn **"Sổ quỹ"** nằm trong menu Tài chính (cùng cấp với Công đức, Khuyến học):
```
Tài chính
├── Quỹ công đức      (/admin/donation)
├── Khuyến học        (/admin/scholarship)
├── Sự kiện           (/admin/events)
└── Sổ quỹ thu–chi    (/admin/fund-ledger)  ← màn này
```

### 5.2 Stats tổng (4 ô)
| KPI | Nguồn |
|-----|-------|
| Tổng đã thu | SUM confirmed contributions (tất cả chiến dịch) |
| Tổng đã chi | SUM confirmed expenses (tất cả loại) |
| Số dư tổng | thu − chi |
| Khoản chi chờ duyệt | COUNT pending fund_expense + event_expense |

### 5.3 Filter + Sổ quỹ

**Filter bar:**
```
[Chiến dịch ▼]  [Thu / Chi / Tất cả ▼]  [Từ ngày]—[Đến ngày]  [Loại ▼]  [Xuất Excel]
```

**Bảng sổ quỹ (ProTable):**

| Ngày | Thu/Chi | Mô tả | Loại | Số tiền | Nguồn | Người ghi |
|------|---------|-------|------|---------|-------|-----------|
| 15/07/2026 | ▲ Thu | Hoàng Văn A — Trao công đức | Chuyển khoản | +5,000,000 đ | Công đức [→] | Admin |
| 16/07/2026 | ▼ Chi | Nguyễn Thị B — Đợt 1/2026 | Học bổng | −2,000,000 đ | Khuyến học [→] | Admin |
| 17/07/2026 | ▼ Chi | Mua nhang nến — Giỗ tổ | Chi phí sự kiện | −500,000 đ | Sự kiện: Giỗ tổ [→] | Admin |
| 18/07/2026 | ▼ Chi | Đổ bê tông nền | Xây dựng | −10,000,000 đ | Quỹ tôn tạo lăng | Thủ quỹ |

- Màu: Thu = xanh lá / Chi = đỏ cam / Chờ duyệt = vàng (italic)
- Link [→] dẫn thẳng đến record gốc (contribution, award, event expense)
- Cuối bảng: **Cộng thu: X đ · Cộng chi: Y đ · Số dư lọc: Z đ**

### 5.4 Panel khoản chi chờ duyệt

Tab riêng "Chờ duyệt (N)":
- FundExpense pending + ClanEventExpense pending
- Mỗi row: [Xác nhận] [Từ chối] [Xem chi tiết]
- Yêu cầu nhập "Ghi chú duyệt" khi từ chối

### 5.5 Tạo khoản chi thủ công (FundExpense)
- Chiến dịch nguồn * (select)
- Mô tả khoản chi *
- Số tiền *
- Hạng mục *
- Ngày chi *
- Người thực hiện chi *
- Số biên lai / Upload scan biên lai
- Ghi chú

### 5.6 Responsive
- `< 1024px`: filter collapse vào accordion
- `< 768px`: table sổ quỹ giản lược còn Ngày / Thu–Chi / Mô tả / Số tiền; cột Nguồn ẩn

---

## 6. Kết nối cross-module

### 6.1 Từ màn Công đức (DonationCampaign detail)
Thêm tab **"Sổ thu–chi"** trong campaign detail panel:
- Hiển thị tất cả entries của `fund_ledger_v` theo `campaign_id`
- KPI: Tổng thu / Tổng chi / Số dư
- Nút [+ Ghi khoản chi] → tạo FundExpense cho campaign này
- Link [Xem sổ đầy đủ →] → màn Sổ quỹ filter theo campaign này

### 6.2 Từ màn Khuyến học (AwardRound detail)
Thêm dòng KPI:
- "Quỹ nguồn: [Tên campaign] · Số dư hiện tại: Z đ · [Xem sổ quỹ →]"
- "Đã trao trong đợt: Y đ"

### 6.3 Từ màn Sự kiện (ClanEvent detail)
Trong tab "Liên kết":
- "Quỹ liên kết: [Tên campaign] · Số dư: Z đ · [Xem sổ quỹ →]"
- "Chi phí đã xác nhận trong sự kiện này: Y đ"

### 6.4 Dashboard widget
Widget **"Sổ quỹ"**:
- Số dư tổng tất cả quỹ (active campaigns)
- 3 giao dịch gần nhất (thu + chi)
- Link → Sổ quỹ đầy đủ

---

## 7. Luồng CHI hoàn chỉnh (tất cả loại)

```
Admin muốn ghi khoản chi
        │
        ├─ Chi học bổng → màn Khuyến học → trao suất đợt → ScholarshipAward
        │
        ├─ Chi phí sự kiện → màn Sự kiện → tab Chi phí → ClanEventExpense
        │                                             (phải có event published)
        │
        └─ Chi phí khác (xây dựng, hành chính...) → màn Sổ quỹ → FundExpense
                                                    (chọn chiến dịch chịu chi phí)

Tất cả khoản chi:
        ▼
   status = pending  (không ảnh hưởng số dư)
        │
        ▼ Admin / Treasurer xác nhận
   status = confirmed → trừ số dư quỹ liên kết
        │
        └─ ghi vào audit_log (who, what, when, amount)
```

---

## 8. Xuất báo cáo

| Báo cáo | Nội dung | Format |
|---------|---------|--------|
| Sổ quỹ theo chiến dịch | Tất cả thu–chi của một campaign | Excel |
| Sổ quỹ tổng hợp | Thu–chi tất cả chiến dịch theo khoảng thời gian | Excel |
| Báo cáo minh bạch | Thu–chi + số dư (dành để công bố nội bộ dòng họ) | PDF (print-friendly) |
| Quyết toán sự kiện | Chi phí của một sự kiện (confirmed) | Excel / PDF |

---

## 9. Bảo mật & phân quyền

- ROLE_ADMIN: toàn bộ
- ROLE_TREASURER: xem sổ, tạo + confirm khoản chi, xuất báo cáo; không sửa campaign
- Public / Member: không xem sổ quỹ chi tiết (chỉ xem bảng vàng công đức ở portal)
- Diff chạm confirm/reject chi phí → `audit_log` bắt buộc

---

## 10. Trace

| Mã | Nội dung |
|----|---------|
| FR-07.7 | "sổ quỹ thu–chi từng công trình" — FR ban đầu |
| FR-12e.1–… | Các mục §2–§7 tài liệu này |
| SRS-12b | Thu (DonationContribution) |
| SRS-12c | Chi học bổng (ScholarshipAward) |
| SRS-12d | Chi phí sự kiện (ClanEventExpense) |
| Rule | `data-provenance-admin`, `no-tech-jargon-on-ui` |
