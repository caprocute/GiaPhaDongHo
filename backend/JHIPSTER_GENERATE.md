# Bằng chứng sinh mã JHipster CLI

| Mục | Giá trị |
|-----|---------|
| Công cụ | `npx generator-jhipster@9.2.0` |
| Lệnh | `jdl app.jdl --no-interactive --force` |
| Thư mục | `backend/` |
| Ngày | 2026-07-16 |
| Node | v22.18.0 (JHipster yêu cầu `^22.18.0 \|\| >=24.11.0`) |
| Kết quả | Spring Boot **4.0.7**, OAuth2/Keycloak, PostgreSQL, Gradle, `skipClient` |

**Không** copy từ sample bên ngoài; **không** scaffold tay thay CLI.

Entity/CRUD tiếp theo: sửa `*.jdl` → chạy lại `npx generator-jhipster@9.2.0 jdl <file>.jdl --no-interactive`.

### R2 (2026-07-17)
| Mục | Giá trị |
|-----|---------|
| Lệnh | `npx generator-jhipster@9.2.0 jdl jdl/r2-modules.jdl --no-interactive` (Node 22.18) |
| Entity | ChangeRequest, DonationCampaign, DonationContribution, ClanEvent, EventRsvp, AnniversarySubscription, NotificationOutbox, ScholarshipEntry |
| Ghi chú | `FamilyTree`/`Person` quan hệ `builtInEntity`; `master.xml` include changelog thủ công sau generate (CLI dừng ở conflict overwrite) |
