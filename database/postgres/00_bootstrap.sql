-- ============================================================================
-- GiaPhaHub — Bootstrap PostgreSQL (role + database + extension)
-- ============================================================================
-- Chạy bằng superuser (postgres) TRƯỚC 01_schema.sql khi cài TAY (không Docker).
-- Với Docker, entrypoint tự tạo role/db từ biến môi trường nên có thể bỏ qua file này.
--
--   psql -h localhost -p 5432 -U postgres -f 00_bootstrap.sql
--
-- Sửa mật khẩu bên dưới trước khi chạy ở môi trường thật (đừng để 'changeme').
-- ============================================================================

-- 1. Role ứng dụng
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'giapha') THEN
    CREATE ROLE giapha LOGIN PASSWORD 'changeme-strong-db';
  END IF;
END
$$;

-- 2. Database (CREATE DATABASE không chạy trong DO/transaction — dùng \gexec)
SELECT 'CREATE DATABASE giapha OWNER giapha'
WHERE NOT EXISTS (SELECT 1 FROM pg_database WHERE datname = 'giapha')\gexec

-- 3. Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE giapha TO giapha;

-- 4. Extension cần trong DB giapha (unaccent cho tìm kiếm không dấu tiếng Việt).
--    Kết nối lại vào DB giapha rồi tạo extension:
\connect giapha
CREATE EXTENSION IF NOT EXISTS unaccent;
GRANT ALL ON SCHEMA public TO giapha;
