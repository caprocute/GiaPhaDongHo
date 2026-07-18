# GiaPhaHub — Luật làm việc cho AI agent

Dự án: nền tảng gia phả số dòng họ Việt Nam. Spring Boot 4.x/Java 21 (JHipster 9 + Spring Modulith 2) + React 19
(Next.js portal + Vite admin) + PostgreSQL 16 + Elasticsearch + Redis + MinIO + Keycloak.

## Tài liệu nguồn (đọc trước khi code)
- `instruction/00-tong-quan.md` — chỉ mục thiết kế TK-00…TK-11; **không code khi task chưa trace về TK/FR cụ thể**.
- `SRS/00-tong-hop.md` — đặc tả tính năng kế thừa từ bản cũ (FR-xx).
- Mô hình phát triển UI: `instruction/11-quy-trinh-phat-trien-voi-ai.md` (grounded generation + gates).

## UI generation rules
- CHỈ dùng component từ `packages/ui` cho pattern đã có; cấm styled-div trần cho pattern tồn tại.
- CẤM hardcode màu/spacing/font — chỉ dùng design token (`var(--color-…)`, Tailwind theme từ `packages/tokens`).
- Mọi form: `FormField` + Zod schema. **Mọi bảng: `ProTable` (từ `@giapha/ui`) — cấm dùng `DataTable` cũ; cấm `<table>` trần.**  Mọi ngày tháng: `DualDatePicker` (dương/âm).
- `ProTable` bắt buộc khai báo `rowKey`; dùng `ProTableColumn<T>[]` cho kiểu cột; tích hợp `pagination`, `loading`, `emptyState`, `exportable` trực tiếp vào component — không wrap thêm `<Pagination>` ngoài.
- Sau khi sinh màn hình: chạy `pnpm lint:tokens && pnpm test:a11y` rồi mới báo kết quả (kèm output thật).

## Backend rules — JHipster CLI bắt buộc (siết chặt)
- **Core BE chỉ do JHipster CLI sinh tại chỗ trong repo** (`npx generator-jhipster@9` / `jhipster` / `jhipster jdl`). Không được:
  - AI (hoặc người) viết tay giả Entity/Repository/Service/Resource/DTO/MapStruct/Liquibase CRUD “kiểu JHipster”;
  - copy source từ sample/repo JHipster khác rồi dán vào `backend/`;
  - scaffold Spring Initializr / Gradle tay thay cho bước bootstrap `jhipster`.
- **Quy trình bắt buộc:** (1) viết/sửa JDL hoặc trả lời wizard CLI → (2) chạy CLI generate → (3) commit artifact do CLI tạo → (4) AI chỉ viết phần **ngoài** generate: Modulith package, `core.lunar`, privacy filter, `@RequiresPermission`, adapter MinIO/ES/Zalo, domain service.
- Bằng chứng: PR có lệnh CLI trong mô tả (hoặc log generate) + diff chứa file do generator tạo (`.yo-rc.json`, `*.jdl`, liquibase changelog JHipster). Thiếu bằng chứng → từ chối merge phần core.
- Bootstrap: **JHipster 9** + **Spring Boot 4.x**, `--skip-client`, OAuth2/Keycloak, Gradle 9, Java 21. Cấm JHipster 8 / Boot 3. FE không dùng client JHipster.
- Endpoint mới bắt buộc `@RequiresPermission(...)` + test authz. Controller admin đặt trong package `…/admin/`.
- Chỉ JPA/parameterized query; cấm nối chuỗi SQL. Cấm tự viết crypto/auth — dùng `core.security` (sau khi JHipster đã sinh lớp security gốc).
- Âm–dương lịch CHỈ qua `core.lunar` (Java) / `packages/lunar` (TS); hai bản chung golden test vectors.
- Module chỉ import `api/` + `events/` của module khác; `ApplicationModules.verify()` phải xanh.
- Đổi schema entity: sửa JDL → `jhipster jdl` lại; changelog Liquibase do CLI; expand→migrate→contract + người duyệt.

## Bảo mật & riêng tư (bắt buộc)
- Người còn sống = PII (NĐ 13/2023): mọi serializer/export phải qua privacy filter; không lộ ngày sinh đầy đủ/SĐT cho khách.
- Diff chạm auth / donation / privacy / upload → chạy `/security-review` và yêu cầu người duyệt thứ hai.
- Không bao giờ ghi secret vào repo; dùng `.env.local` / `.env.tunnel.local` (đã gitignore).

## Jasypt — mã hóa cấu hình (bắt buộc)
- Mọi **bí mật trong cấu hình ứng dụng** (mật khẩu DB, Redis, MinIO, SMTP, Zalo OA, JWT/client secret phụ, khóa imgproxy…) phải tích hợp **Jasypt** (`jasypt-spring-boot-starter`): giá trị dạng `ENC(...)` trong `application-*.yml` / env được decrypt lúc runtime.
- CẤM lưu plaintext secret trong file YAML commit được; CẤM tự viết crypto/AES tùy hứng thay Jasypt.
- Master password Jasypt chỉ qua env/secret manager: `JASYPT_ENCRYPTOR_PASSWORD` (không commit). Sinh ciphertext bằng CLI Jasypt của dự án / skill khi có.
- Diff chạm secret/encrypt → `/security-review` + người duyệt thứ hai.

## Hạ tầng DEV remote + tunnel
- Postgres / Redis / Elasticsearch / MinIO / Keycloak **DEV** chạy trên server riêng (`deploy/remote/`), không chiếm port dịch vụ sẵn có.
- Máy local: skill `/infra-tunnel` (hoặc `deploy/scripts/tunnel-infra.sh`) — SSH tunnel port cố định; nếu port local bị chiếm thì **kill** tiến trình chiếm rồi mở tunnel lại.
- Thông tin SSH chỉ trong `.env.tunnel.local` — không commit.

## Definition of Done
- Component mới: đủ 4 mảnh — spec + code (states/responsive/keyboard) + Storybook story + usage doc/mapping.
- Màn hình/tính năng: qua gate A (build/test), B (token lint), C (visual diff), D (axe), S (security scan).
- Không claim "done" khi chưa dán bằng chứng gate/test. Sau thay đổi có runtime: dùng skill `/verify`.

## Quy ước khác
- Giao tiếp và commit message tiếng Việt; format commit: `[module] hành động — tham chiếu TK/FR`.
- **Không ghi kỹ thuật xử lý lên UI** (OIDC, Keycloak, client id, path API, JSON…). Chi tiết: `.cursor/rules/no-tech-jargon-on-ui.mdc`.
- **Xong đơn vị việc → commit + push ngay** (không chờ nhắc, không dồn nhiều milestone). Chi tiết: `.cursor/rules/commit-push-when-done.mdc`. Cấm commit secret (`.env.local`, `.env.tunnel.local`…).
- Thêm dependency mới: ghi vào `instruction/02-lua-chon-cong-nghe.md` + kiểm tra license.
- Learn loop: nếu người dùng sửa tay output của bạn, đề xuất cập nhật rule/token/story tương ứng.
