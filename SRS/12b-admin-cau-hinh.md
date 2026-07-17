# SRS-12b — Cấu hình hệ thống (Admin Settings)

**Phiên bản:** 1.0 · **Ngày:** 2026-07-17  
**Tham chiếu:** TK-07, TK-10, TK-13 §RP.1, FR-12.17–12.23, FR-12.18 (mở rộng)  
**Mockup:** `instruction/mockups/admin-settings.html`  
**API nền:** `GET/PUT /api/v1/trees/{slug}/settings` (metaJson + secret tách lớp)

---

## 1. Mục tiêu & phạm vi

Màn **Cấu hình** là trung tâm thiết lập toàn bộ hành vi của một dòng họ trên GiaPhaHub: nhận diện công khai, quy tắc phả hệ, thành viên & riêng tư, kênh thông báo, vận hành hệ thống.

**Đối tượng:** Quản trị hệ thống, tộc trưởng (theo phân quyền).  
**URL admin:** `/settings` (trong AppShell CRM).  
**Nguyên tắc:** mọi thay đổi lưu được → portal/CRM/notification phản ánh động; secret chỉ `ENC(...)` / secret manager; chữ trên UI là ngôn ngữ nghiệp vụ (không lộ tên stack).

### 1.1 Ngoài phạm vi v1 của SRS-12b

- Multi-tenant / custom domain (hàng đợi sau go-live).
- Theme editor kéo-thả block tùy ý (chỉ cấu hình bật/tắt block tối thiểu — xem SRS-15 / FR-12.19).
- Quét virus file upload (có thể bổ sung Gate S).

---

## 2. Bố cục giao diện

```
┌──────────────┬─────────────────────────────────────┐
│  NAV (220px) │  MAIN: section cards + sticky save  │
│  5 nhóm      │  Alert trạng thái lưu               │
│  13 mục      │                                     │
└──────────────┴─────────────────────────────────────┘
```

**FR-12b.1** Nav trái đúng mockup — 5 nhóm / 13 mục:

| Nhóm | Mục | Id section |
|------|-----|------------|
| Nhận diện | Thông tin dòng họ | `identity` |
| Nhận diện | Thương hiệu & logo | `brand` |
| Phả hệ | Cài đặt cây phả hệ | `tree` |
| Phả hệ | Âm-dương lịch | `calendar` |
| Phả hệ | Mã hiệu thành viên | `code` |
| Thành viên & bảo mật | Đăng ký & xác thực | `auth` |
| Thành viên & bảo mật | Quyền riêng tư & PII | `privacy` |
| Thành viên & bảo mật | Phân quyền vai trò | `roles` |
| Thông báo | Email (SMTP) | `smtp` |
| Thông báo | Zalo OA | `zalo` |
| Thông báo | Nhắc nhở & giỗ | `notify` |
| Hệ thống | Sao lưu & khôi phục | `backup` |
| Hệ thống | Tích hợp & webhook | `webhook` |
| Hệ thống | Nhật ký audit log | `audit` |

**FR-12b.2** Click mục nav → cuộn/mở section tương ứng; highlight mục đang xem.  
**FR-12b.3** Sticky **Thanh lưu**: số trường đổi chưa lưu · Đặt lại · Lưu cấu hình.  
**FR-12b.4** Sau lưu thành công: thông báo nghiệp vụ («Đã lưu cấu hình») + thời điểm; không hiện path API.

---

## 3. Nhóm Nhận diện

### 3.1 Thông tin dòng họ (`identity`)

**FR-12b.10** Trường bắt buộc / tuỳ chọn:

| Trường | Bắt buộc | Ảnh hưởng |
|--------|----------|-----------|
| Tên dòng họ (`displayName`) | ✓ | Header portal/admin, metadata, PDF |
| Tên viết tắt (`shortName`) | | Gợi ý xuất khẩu / mã |
| Tỉnh/Thành gốc (`provinceCode`) | | Metadata cây |
| Địa chỉ nhà từ đường (`address`) | | Footer portal |
| Người liên hệ + SĐT | | Footer / trang liên hệ |
| Email liên hệ | | Footer |
| Mô tả ngắn (`description`) | | Meta description, chia sẻ MXH |
| Từ khóa SEO (`seoKeywords[]`) | | Meta keywords |
| Ngân hàng: tên NH, chi nhánh, số TK, chủ TK | | Footer quỹ công đức |
| Mạng xã hội: Facebook, Zalo | | Footer / liên kết |

**FR-12b.11** Lưu vào `metaJson` + đồng bộ `FamilyTree.surname` / `branchName` / `provinceCode` khi có thể suy ra từ tên.

### 3.2 Thương hiệu & logo (`brand`)

**FR-12b.20** Upload **logo portal** (SVG/PNG, khuyến nghị ≥200×80) → MinIO → `logoUrl`.  
**FR-12b.21** Upload **favicon** (ICO/PNG 32×32) → `faviconUrl`; portal cập nhật `<link rel="icon">`.  
**FR-12b.22** **Bảng màu chủ đạo** (`brandPalette`): chọn trong tập token hệ thống (`bang-vang` | `co` …); không cho nhập hex tự do trên UI production (tránh lệch DS).  
**FR-12b.23** (Tuỳ chọn v1.1) Phông chữ tiêu đề — chỉ các font đã whitelist trong tokens.  
**FR-12b.24** Xóa logo/favicon → về mặc định hệ thống.

---

## 4. Nhóm Phả hệ

### 4.1 Cài đặt cây phả hệ (`tree`)

**FR-12b.30**

| Cấu hình | Kiểu | Mặc định | Hành vi hệ thống |
|----------|------|----------|------------------|
| Số node tối đa mặc định | int 20…500 | 43 | Portal/admin giới hạn page size phả đồ |
| Phả đồ công khai | bool | true | `false` → khách không đọc persons/unions/anniversaries công khai |
| Che ngày sinh người còn sống | bool | true | Xem §5.2 privacy |
| Cho phép tự khai | bool | true | `false` → chặn submit change-request |
| Cho phép xuất phả đồ | bool | false | Portal ẩn nút PNG/SVG/PDF |

### 4.2 Âm-dương lịch (`calendar`)

**FR-12b.40** Múi giờ hiển thị lịch (mặc định `Asia/Ho_Chi_Minh`).  
**FR-12b.41** Quy ước hiển thị tháng nhuận (nhãn «Nhuận») — dùng chung `core.lunar` / `packages/lunar`.  
**FR-12b.42** Không cho tắt can chi trên portal công khai (NFR âm lịch); chỉ cấu hình chi tiết nhãn nếu cần.

### 4.3 Mã hiệu thành viên (`code`)

**FR-12b.50** `codePrefix` (1–3 ký tự chữ, chuẩn hóa hoa) — ví dụ `A` → `A7`, `A7-sp1`.  
**FR-12b.51** Preview mẫu trên UI: «Người tiếp theo sẽ nhận mã dạng A…».  
**FR-12b.52** Đổi prefix **không** đổi mã người đã có; chỉ áp dụng khi tạo mới (BE `PersonCodeGenerator`).

---

## 5. Nhóm Thành viên & bảo mật

### 5.1 Đăng ký & xác thực (`auth`) — FR-12.17

**FR-12b.60** Bật/tắt **đăng ký công khai** trên portal.  
**FR-12b.61** Bật/tắt **tự kích hoạt** (email link) vs chờ admin duyệt (FR-12.16).  
**FR-12b.62** Bắt buộc đồng ý quy định thành viên (link trang tĩnh).  
**FR-12b.63** Captcha trên đăng ký / quên mật khẩu (bật/tắt).  
**FR-12b.64** Lưu preference vào settings; thực thi qua cấu hình IdP / luồng portal — UI không hiện tên IdP.

### 5.2 Quyền riêng tư & PII (`privacy`)

**FR-12b.70** Mức mặc định `privacy` khi tạo người còn sống: `members` | `public` | `private`.  
**FR-12b.71** Toggle **che ngày sinh (và trường PII liên quan) với khách** — map `maskLivingBirthDate` + `PersonPrivacyFilter`.  
**FR-12b.72** Ma trận hiển thị (bắt buộc tuân thủ):

| Người xem \ Trường | Khách | Thành viên | Biên tập/Quản trị |
|--------------------|-------|------------|-------------------|
| Tên, đời, mã (còn sống) | Có | Có | Có |
| Ngày sinh đầy đủ (còn sống) | Chỉ khi không mask / privacy=public | Theo policy | Có |
| Ghi chú / mộ / SĐT (còn sống) | Không | Theo policy | Có |
| Người đã mất | Công khai thờ phụng (trừ private) | Có | Có |

**FR-12b.73** Mọi export/PDF/API public phải qua cùng privacy filter.

### 5.3 Phân quyền vai trò (`roles`)

**FR-12b.80** Hiển thị bảng **vai trò → quyền** (đọc từ catalog IAM) bằng ngôn ngữ nghiệp vụ («Sửa phả hệ», «Duyệt tự khai»…).  
**FR-12b.81** Không hiện mã permission thô (`genealogy:tree:write`) trên UI.  
**FR-12b.82** (v1) Read-only; gán user↔role thực hiện ở quản trị thành viên / IdP.  
**FR-12b.83** Liên kết FR-12.10: ghi chú «Thư ký nhánh» sẽ giới hạn theo `lineage` ở giai đoạn sau — settings chỉ mô tả policy.

---

## 6. Nhóm Thông báo

### 6.1 Email (`smtp`) — FR-12.22

**FR-12b.90** Trường: máy chủ, cổng, TLS/SSL, tài khoản, mật khẩu, địa chỉ gửi (From), tên hiển thị.  
**FR-12b.91** Mật khẩu chỉ ghi dạng mã hóa cấu hình; UI không echo lại plaintext sau khi lưu (hiện «••••» + Đổi).  
**FR-12b.92** Nút **Gửi thử** → email tới địa chỉ admin đang đăng nhập; kết quả «Đã gửi / Không gửi được» (không stacktrace).  
**FR-12b.93** Dùng cho: kích hoạt TK, quên MK, nhắc giỗ, thông báo liên hệ / duyệt (khi bật).

### 6.2 Zalo OA (`zalo`)

**FR-12b.100** Trường: định danh ứng dụng OA, mã truy cập (secret `ENC`).  
**FR-12b.101** Chế độ: Tắt | Chạy thử (ghi log) | Gửi thật.  
**FR-12b.102** Nếu Tắt: portal không đề xuất kênh Zalo; BE từ chối enqueue Zalo.  
**FR-12b.103** Không hiện token trên UI sau khi lưu.

### 6.3 Nhắc nhở & giỗ (`notify`)

**FR-12b.110** `remindDaysBefore` mặc định (1…30).  
**FR-12b.111** Bật kênh Email / Zalo (phải phụ thuộc SMTP/Zalo đã cấu hình).  
**FR-12b.112** Khi tạo đăng ký nhắc mới: mặc định ngày/kênh theo settings; lọc kênh không được phép.

---

## 7. Nhóm Hệ thống

### 7.1 Sao lưu & khôi phục (`backup`) — FR-12.20

**FR-12b.120** Bật lịch sao lưu (hằng ngày/tuần); giờ chạy (TZ settings).  
**FR-12b.121** Phạm vi: CSDL + object storage (MinIO bucket media).  
**FR-12b.122** Danh sách bản gần đây: thời điểm, kích thước, trạng thái; nút tải (nếu được phép).  
**FR-12b.123** Khôi phục: hướng dẫn nghiệp vụ + xác nhận 2 bước; thao tác nguy hiểm chỉ role quản trị tối cao.  
**FR-12b.124** (v1) Có thể kích hoạt script/job hiện có; UI không bắt buộc self-service restore đầy đủ nếu runbook rõ.

### 7.2 Tích hợp & webhook (`webhook`)

**FR-12b.130** Đăng ký URL nhận sự kiện + secret ký.  
**FR-12b.131** Sự kiện tối thiểu: thay đổi người, duyệt tự khai, đóng góp quỹ, sắp tới ngày giỗ (tuỳ chọn).  
**FR-12b.132** Gửi lại (retry) có giới hạn; nhật ký lần gửi gần nhất.

### 7.3 Nhật ký audit (`audit`) — FR-12.2

**FR-12b.140** Lọc: thời gian, người thao tác, module (phả hệ / cấu hình / duyệt / quỹ…), loại hành động.  
**FR-12b.141** Mỗi dòng: ai · lúc nào · làm gì · đối tượng (mã người / id yêu cầu) · tóm tắt diff.  
**FR-12b.142** Deep-link sang màn CRM liên quan khi còn tồn tại.  
**FR-12b.143** Bắt buộc ghi audit khi: PUT settings, CRUD người/union, duyệt/từ chối tự khai, xóa honeymoon, đổi SMTP/Zalo.

---

## 8. Lưu trữ & API

**FR-12b.150** Phần **không mật** (identity, brand URLs, tree, calendar, code, privacy flags, notify defaults, webhook URL không secret): `FamilyTree.metaJson` qua `TreeSettingsDTO`.  
**FR-12b.151** Phần **mật** (SMTP password, Zalo token, webhook secret): bảng/cấu hình mã hóa Jasypt hoặc secret store — **không** ghi plaintext vào metaJson commit-able.  
**FR-12b.152**

| Hành động | Method | Ghi chú |
|-----------|--------|---------|
| Đọc settings công khai + flags | `GET …/trees/{slug}/settings` | Khách được đọc phần public |
| Cập nhật settings | `PUT …/trees/{slug}/settings` | `@RequiresPermission("genealogy:tree:write")` hoặc `settings:write` |
| Upload logo/favicon | `POST …/media/upload` + gắn URL | Quyền media |
| SMTP test | `POST …/settings/smtp/test` | Auth bắt buộc |
| Đọc audit | `GET …/audit` (phân trang) | Quyền audit:read |

**FR-12b.153** GET settings **không** trả secret; chỉ cờ `smtpConfigured: true/false`, `zaloConfigured: true/false`.

---

## 9. Usecase liên kết (bắt buộc khi nghiệm thu)

| # | Thay đổi ở Settings | Hệ thống phải… |
|---|---------------------|----------------|
| U1 | Đổi `displayName` | Portal header/footer + admin brand + metadata |
| U2 | Đổi `brandPalette` | `data-palette` portal/admin |
| U3 | `publicTree=false` | Khách không xem phả đồ/API persons |
| U4 | `allowSelfDeclare=false` | Portal tự khai khóa; BE reject |
| U5 | `allowTreeExport=true` | Portal hiện nút xuất |
| U6 | Đổi `codePrefix` | Người tạo mới nhận prefix mới |
| U7 | Bật SMTP + gửi thử | Nhận được mail |
| U8 | Tắt kênh Zalo | Form nhắc giỗ không còn Zalo |
| U9 | Bật mask PII | Khách không thấy ngày sinh người sống |
| U10 | Đổi footer/NH | Portal footer cập nhật |

---

## 10. Phân quyền & an toàn

**FR-12b.160** Chỉ role quản trị hệ thống / genealogy admin được PUT settings nhạy cảm (SMTP/Zalo/backup).  
**FR-12b.161** Diff settings secret → bắt buộc security-review + người duyệt 2 (CLAUDE.md).  
**FR-12b.162** Rate-limit SMTP test / webhook test.

---

## 11. Tiêu chí chấp nhận (RP.1)

1. Nav 13 mục + form đủ trường mục tiêu v1 (mục «Sắp có» chỉ khi ghi rõ trong checklist TK-13 còn mở).  
2. U1–U10 chạy trên staging.  
3. Không secret plaintext trong repo / response GET.  
4. Gate B tokens; UI không jargon kỹ thuật.
