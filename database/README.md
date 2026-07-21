# GiaPhaHub — Khởi tạo lại Database từ đầu

Thư mục này chứa mọi tài nguyên để **dựng lại PostgreSQL của GiaPhaHub từ số 0**:
schema đầy đủ, dữ liệu mẫu (họ Hoàng Trung Bình), và hướng dẫn theo **2 phương án** —
Docker và cài tay.

> Muốn dựng **toàn bộ hệ thống** (Postgres + Redis + MinIO + Elasticsearch + Keycloak +
> imgproxy + api/portal/admin) trên **Docker hoặc Kubernetes**, xem
> [`deploy/INSTALL.md`](../deploy/INSTALL.md).

> **Nguồn chân lý của schema là Liquibase** (`backend/src/main/resources/config/liquibase/master.xml`).
> File `postgres/01_schema.sql` được **sinh tự động** từ đó (xem [Sinh lại SQL](#sinh-lại-sql-khi-schema-đổi)).
> Đừng sửa tay file SQL — sửa JDL/changelog rồi generate lại.

---

## Cấu trúc thư mục

```
database/
├── README.md                        ← file này
├── postgres/
│   ├── 00_bootstrap.sql             role + database + extension unaccent (chạy bằng superuser)
│   └── 01_schema.sql                SCHEMA đầy đủ (26 bảng) — SINH TỰ ĐỘNG từ Liquibase
├── seed/
│   └── 10_seed_ho_hoang.sql         DATA THẬT: 126 người, 6 đời, họ Hoàng Trung Bình
├── docker/
│   ├── docker-compose.yml           Postgres độc lập, tự nạp schema+seed lần đầu
│   ├── .env.example                 biến môi trường mẫu
│   └── initdb/                       mount vào /docker-entrypoint-initdb.d
│       ├── 01_schema.sql
│       └── 10_seed_ho_hoang.sql
└── scripts/
    ├── reset-db.sh                  xoá & dựng lại DB trên Postgres có sẵn (cài tay)
    └── regenerate-sql.sh            sinh lại 01_schema.sql từ Liquibase
```

**Thứ tự nạp luôn là:** `01_schema.sql` (tạo bảng) → `10_seed_ho_hoang.sql` (đổ data).

---

## Có gì trong schema

`01_schema.sql` gồm (sinh từ Liquibase, đã kiểm chứng chạy sạch trên PostgreSQL 16):

- `CREATE EXTENSION unaccent` — tìm kiếm tên không dấu tiếng Việt.
- `sequence_generator` — sequence chung cấp ID cho các entity.
- **20 entity nghiệp vụ**: `family_tree`, `person`, `family_union`, `union_member`,
  `union_child`, `chapter`, `death_anniversary`, `cms_category`, `cms_post`,
  `cms_comment`, `media_album`, `media_photo`, `change_request`, `donation_campaign`,
  `donation_contribution`, `clan_event`, `event_rsvp`, `anniversary_subscription`,
  `notification_outbox`, `scholarship_entry` (+ `scholarship_award`, `scholarship_award_round`).
- **Hệ thống**: `module_registry`, `audit_log`.
- **Liquibase**: `databasechangelog`, `databasechangeloglock` (để app tiếp tục quản lý
  migration bình thường sau này).
- Seed CMS category cho portal (dữ liệu prod, không phải faker).

---

## Phương án A — Docker (khuyến nghị, nhanh nhất)

Cần: Docker + Docker Compose. Compose này dựng **riêng Postgres của app**
(không kèm Redis/ES/MinIO/Keycloak — muốn đủ hạ tầng DEV xem `deploy/remote/`).

### Bước 1 — Chuẩn bị biến môi trường
```bash
cd database/docker
cp .env.example .env
# Mở .env, đổi POSTGRES_PASSWORD. Nếu tunnel DEV :15432 đang chạy, đổi POSTGRES_PORT (vd 15433).
```

### Bước 2 — Khởi động (lần đầu tự nạp schema + seed)
```bash
docker compose up -d
```
Lần đầu container khởi động với data-dir rỗng, Postgres **tự chạy** mọi file trong
`initdb/` theo thứ tự tên: `01_schema.sql` rồi `10_seed_ho_hoang.sql`.

### Bước 3 — Kiểm tra
```bash
docker compose ps                       # postgres phải "healthy"
docker exec -it giapha-postgres \
  psql -U giapha -d giapha -c '\dt'      # liệt kê bảng
docker exec -it giapha-postgres \
  psql -U giapha -d giapha -c 'SELECT count(*) FROM person;'   # → 126
```

### Dựng lại từ đầu (xoá sạch data cũ)
`initdb/` **chỉ chạy khi data-dir rỗng**. Muốn nạp lại từ đầu phải xoá volume:
```bash
docker compose down -v      # -v xoá volume giapha_pgdata
docker compose up -d        # nạp lại schema + seed
```

### Chỉ muốn schema, không muốn data mẫu
Xoá (hoặc đổi tên) `initdb/10_seed_ho_hoang.sql` trước khi `up`, hoặc để trống thư mục
`initdb/` chỉ giữ `01_schema.sql`.

---

## Phương án B — Cài tay (Postgres cài sẵn trên máy / server)

Cần: PostgreSQL 16 đã cài, `psql` trong PATH. `unaccent` nằm sẵn trong
`postgresql-contrib` (Postgres official/Homebrew đã có).

### Cách nhanh — dùng script
```bash
# Xoá & dựng lại DB giapha (schema + seed họ Hoàng).
# Mặc định kết nối localhost:15432, user giapha, mật khẩu lấy từ .env.local.
database/scripts/reset-db.sh

# Chỉ schema, không seed:
database/scripts/reset-db.sh --no-seed

# Đổi host/port/user nếu Postgres của bạn ở nơi khác:
PGHOST=localhost PGPORT=5432 PGADMIN_USER=postgres database/scripts/reset-db.sh
```

### Cách thủ công — chạy từng lệnh `psql`

**Bước 1 — Tạo role + database + extension** (bằng superuser `postgres`):
```bash
psql -h localhost -p 5432 -U postgres -f database/postgres/00_bootstrap.sql
```
> Mở `00_bootstrap.sql` đổi `changeme-strong-db` thành mật khẩu thật trước khi chạy.

**Bước 2 — Nạp schema** (bằng user `giapha` vào DB `giapha`):
```bash
psql -h localhost -p 5432 -U giapha -d giapha -v ON_ERROR_STOP=1 \
  -f database/postgres/01_schema.sql
```

**Bước 3 — Nạp seed data thật (tuỳ chọn):**
```bash
psql -h localhost -p 5432 -U giapha -d giapha -v ON_ERROR_STOP=1 \
  -f database/seed/10_seed_ho_hoang.sql
```

**Bước 4 — Kiểm tra:**
```bash
psql -h localhost -p 5432 -U giapha -d giapha -c '\dt'
psql -h localhost -p 5432 -U giapha -d giapha -c 'SELECT count(*) FROM person;'   # → 126
```

---

## Sau khi có DB — chạy app

App đọc datasource từ `application-dev.yml` (mặc định `jdbc:postgresql://localhost:15432/giapha`).
Đặt mật khẩu qua `.env.local` (`DB_PASSWORD=...`) rồi:
```bash
cd backend && ./gradlew bootRun
```
App dùng chính Liquibase để quản lý migration tiếp theo. Vì `01_schema.sql` đã ghi
sẵn bảng `databasechangelog` với các changeset đã "EXECUTED", Liquibase sẽ **không chạy lại**
các changeset cũ — khớp trạng thái, không xung đột.

> Muốn để **Liquibase tự dựng toàn bộ** thay vì nạp `01_schema.sql`: tạo DB rỗng
> (chỉ Bước 1 bootstrap), rồi `./gradlew bootRun` — app tự tạo mọi bảng. Hai cách cho
> kết quả tương đương; `01_schema.sql` chỉ để dựng nhanh không cần build backend.

---

## Sinh lại SQL khi schema đổi

`01_schema.sql` là **artifact sinh tự động**. Khi bạn đổi schema (sửa JDL → `jhipster jdl`,
hoặc thêm changelog), sinh lại:

```bash
# Cần: Postgres đang chạy (mặc định tunnel DEV :15432) để tạo DB tạm serialize SQL.
database/scripts/regenerate-sql.sh
```
Script tạo DB rỗng tạm, chạy `gradlew liquibaseUpdateSql` để serialize toàn bộ changelog
ra SQL (không đụng DB thật), rồi xoá DB tạm. Sau đó thêm lại header docs ở đầu file (xem `git diff`).

> **Vì sao không có bản “schema + faker” dạng SQL?** Data faker của JHipster nạp bằng
> Liquibase `loadData` (prepared statements) — `liquibaseUpdateSql` không serialize ra
> INSERT chạy được. Muốn data để test, dùng seed thật ở `seed/`, hoặc để app chạy với
> `spring.liquibase.contexts=dev,faker` (tự nạp CSV lúc runtime).

---

## Lưu ý bảo mật

- File SQL/compose ở đây dùng mật khẩu placeholder `changeme-strong-db`. **Đổi trước khi
  dùng thật.** Không commit mật khẩu thật — dùng `.env` (đã gitignore) / `.env.local`.
- `seed/10_seed_ho_hoang.sql` chứa thông tin người trong dòng họ. Người còn sống = PII
  (NĐ 13/2023) — chỉ dùng cho DEV, không đẩy lên môi trường công khai không kiểm soát.
