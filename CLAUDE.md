# GiaPhaHub — Luật làm việc cho AI agent

Dự án: nền tảng gia phả số dòng họ Việt Nam. Spring Boot 3.5/Java 21 (JHipster + Spring Modulith) + React 19
(Next.js portal + Vite admin) + PostgreSQL 16 + Elasticsearch + Redis + MinIO + Keycloak.

## Tài liệu nguồn (đọc trước khi code)
- `instruction/00-tong-quan.md` — chỉ mục thiết kế TK-00…TK-11; **không code khi task chưa trace về TK/FR cụ thể**.
- `SRS/00-tong-hop.md` — đặc tả tính năng kế thừa từ bản cũ (FR-xx).
- Mô hình phát triển UI: `instruction/11-quy-trinh-phat-trien-voi-ai.md` (grounded generation + gates).

## UI generation rules
- CHỈ dùng component từ `packages/ui` cho pattern đã có; cấm styled-div trần cho pattern tồn tại.
- CẤM hardcode màu/spacing/font — chỉ dùng design token (`var(--color-…)`, Tailwind theme từ `packages/tokens`).
- Mọi form: `FormField` + Zod schema. Mọi bảng: `DataTable`. Mọi ngày tháng: `DualDatePicker` (dương/âm).
- Sau khi sinh màn hình: chạy `pnpm lint:tokens && pnpm test:a11y` rồi mới báo kết quả (kèm output thật).

## Backend rules
- **JHipster trước, AI sau (TK-01 §3.1):** entity/CRUD mới = viết/sửa `backend/*.jdl` rồi `jhipster jdl`; CẤM AI tự sinh hàng loạt Entity/Repository/Resource/DTO/MapStruct boilerplate.
- Bootstrap BE: JHipster monolith, `--skip-client`, OAuth2/Keycloak, Gradle, Java 21. FE Portal/Admin không dùng client JHipster.
- Endpoint mới bắt buộc `@RequiresPermission(...)` + test authz. Controller admin đặt trong package `…/admin/`.
- Chỉ JPA/parameterized query; cấm nối chuỗi SQL. Cấm tự viết crypto/auth — dùng `core.security`.
- Âm–dương lịch CHỈ qua `core.lunar` (Java) / `packages/lunar` (TS); hai bản chung golden test vectors.
- Module chỉ import `api/` + `events/` của module khác; `ApplicationModules.verify()` phải xanh.
- Đổi schema DB: Liquibase (chuẩn JHipster) backward-compatible (expand→migrate→contract) và cần người duyệt.

## Bảo mật & riêng tư (bắt buộc)
- Người còn sống = PII (NĐ 13/2023): mọi serializer/export phải qua privacy filter; không lộ ngày sinh đầy đủ/SĐT cho khách.
- Diff chạm auth / donation / privacy / upload → chạy `/security-review` và yêu cầu người duyệt thứ hai.
- Không bao giờ ghi secret vào repo; dùng `.env.local`.

## Definition of Done
- Component mới: đủ 4 mảnh — spec + code (states/responsive/keyboard) + Storybook story + usage doc/mapping.
- Màn hình/tính năng: qua gate A (build/test), B (token lint), C (visual diff), D (axe), S (security scan).
- Không claim "done" khi chưa dán bằng chứng gate/test. Sau thay đổi có runtime: dùng skill `/verify`.

## Quy ước khác
- Giao tiếp và commit message tiếng Việt; format commit: `[module] hành động — tham chiếu TK/FR`.
- Thêm dependency mới: ghi vào `instruction/02-lua-chon-cong-nghe.md` + kiểm tra license.
- Learn loop: nếu người dùng sửa tay output của bạn, đề xuất cập nhật rule/token/story tương ứng.
