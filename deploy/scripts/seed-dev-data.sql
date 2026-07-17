-- ============================================================
-- GiaPhaHub — DEV seed data (họ Hoàng Trung Bình)
-- Chạy: psql -h 127.0.0.1 -p 15432 -U giapha -d giapha -f seed-dev-data.sql
-- ============================================================

-- 1. XÓA data fake (JHipster test), giữ Keycloak tables
TRUNCATE TABLE
  union_child, union_member, family_union,
  death_anniversary,
  media_photo, media_album,
  cms_comment, cms_post, cms_category,
  change_request,
  event_rsvp, clan_event,
  scholarship_entry,
  donation_contribution, donation_campaign,
  notification_outbox,
  person, family_tree
RESTART IDENTITY CASCADE;

-- ============================================================
-- 2. FAMILY TREE
-- ============================================================
INSERT INTO family_tree (id, slug, surname, branch_name, province_code, meta_json)
VALUES (1, 'ho-hoang', 'Hoàng', 'Chi họ Hoàng Trung Bình — Hà Tĩnh', 'ha-tinh',
  '{"founding_year":1820,"origin_village":"Xã Trung Bình, Hương Khê, Hà Tĩnh","patron_deity":"Thần Nông","clan_meeting":"Mùng 3 tháng 3 âm lịch"}');

-- ============================================================
-- 3. CMS CATEGORIES
-- ============================================================
INSERT INTO cms_category (id, slug, name) VALUES
(1, 'tin-tuc',       'Tin tức'),
(2, 'thong-bao',     'Thông báo'),
(3, 'lich-su',       'Lịch sử dòng họ'),
(4, 'van-hoa',       'Văn hoá - Truyền thống'),
(5, 'ky-niem',       'Kỷ niệm - Sự kiện');

-- ============================================================
-- 4. PERSONS  (120 người, 6 đời)
-- Cấu trúc lineage_path: "A1/A2/A2-1/..."
-- Code quy ước: A{gen}{branch}
-- ============================================================

-- ĐỜI 1: Thủy tổ + Tổ mẫu
INSERT INTO person (id,code,full_name,ten_huy,gender,life_status,generation,lineage_path,birth_solar,death_solar,biography,privacy,version,tree_id) VALUES
(1,'A1','Hoàng Văn Tổ','Hoàng Tảo Lạc','M','deceased',1,'A1','1825-03-15','1895-07-20',
 'Thủy tổ dòng họ Hoàng, gốc từ xã Trung Bình, huyện Hương Khê, Hà Tĩnh. Là người đặt nền móng cho dòng tộc tại vùng đất này.','public',0,1),
(2,'A1-sp','Nguyễn Thị Tổ Mẫu',NULL,'F','deceased',1,'A1-sp','1830-08-10','1900-02-14',
 'Tổ mẫu họ Hoàng, người con gái đảm đang của xứ Nghệ.','public',0,1);

-- ĐỜI 2: 4 người (2 con trai + 2 vợ)
INSERT INTO person (id,code,full_name,ten_huy,ten_thuong,gender,life_status,generation,lineage_path,birth_solar,death_solar,biography,privacy,version,tree_id) VALUES
(3,'A2a','Hoàng Văn Trưởng','Hoàng Minh Đức','Đức','M','deceased',2,'A1/A2a','1852-01-10','1920-11-05',
 'Con trai cả, kế thừa trưởng tộc. Là người có công mở rộng đất canh tác và xây dựng nhà thờ họ đầu tiên.','public',0,1),
(4,'A2a-sp','Lê Thị Hiền',NULL,'Hiền','F','deceased',2,'A1/A2a-sp','1855-04-20','1925-06-12',
 'Vợ trưởng, người phụ nữ đảm đang, giúp chồng quản lý gia sản.','public',0,1),
(5,'A2b','Hoàng Văn Thứ','Hoàng Minh Tài','Tài','M','deceased',2,'A1/A2b','1858-06-15','1930-03-22',
 'Con trai thứ, học hành giỏi giang, đỗ cử nhân triều Nguyễn.','public',0,1),
(6,'A2b-sp','Phạm Thị Lan',NULL,'Lan','F','deceased',2,'A1/A2b-sp','1862-09-05','1935-08-17',
 'Vợ thứ, người phụ nữ tần tảo nuôi con ăn học thành tài.','public',0,1);

-- ĐỜI 3: 8 người (4 con + 4 vợ/chồng)
INSERT INTO person (id,code,full_name,ten_huy,ten_thuong,gender,life_status,generation,lineage_path,birth_solar,death_solar,biography,privacy,version,tree_id) VALUES
(7,'A3a','Hoàng Minh Quang',NULL,'Quang','M','deceased',3,'A1/A2a/A3a','1878-02-14','1954-09-30','Con trai cả của ông Trưởng. Tham gia kháng chiến chống Pháp.','public',0,1),
(8,'A3a-sp','Trần Thị Ngọc',NULL,'Ngọc','F','deceased',3,'A1/A2a/A3a-sp','1882-07-22','1960-12-18',NULL,'public',0,1),
(9,'A3b','Hoàng Minh Sáng',NULL,'Sáng','M','deceased',3,'A1/A2a/A3b','1880-05-03','1945-08-15','Hy sinh trong kháng chiến chống Pháp tại chiến dịch Điện Biên Phủ.','public',0,1),
(10,'A3b-sp','Nguyễn Thị Hoa',NULL,'Hoa','F','deceased',3,'A1/A2a/A3b-sp','1885-11-20','1950-04-10',NULL,'public',0,1),
(11,'A3c','Hoàng Minh Văn',NULL,'Văn','M','deceased',3,'A1/A2b/A3c','1885-08-08','1965-01-25','Con trai cả của ông Thứ. Theo nghiệp cha, làm giáo học vùng quê.','public',0,1),
(12,'A3c-sp','Võ Thị Bạch',NULL,'Bạch','F','deceased',3,'A1/A2b/A3c-sp','1888-03-15','1970-07-30',NULL,'public',0,1),
(13,'A3d','Hoàng Minh Thành',NULL,'Thành','M','deceased',3,'A1/A2b/A3d','1890-10-12','1975-02-14','Cán bộ cách mạng, tham gia phong trào Xô viết Nghệ Tĩnh.','public',0,1),
(14,'A3d-sp','Lê Thị Thu',NULL,'Thu','F','deceased',3,'A1/A2b/A3d-sp','1895-06-30','1980-09-05',NULL,'public',0,1);

-- ĐỜI 4: 16 người
INSERT INTO person (id,code,full_name,ten_huy,ten_thuong,gender,life_status,generation,lineage_path,birth_solar,death_solar,birth_lunar_json,privacy,version,tree_id) VALUES
(15,'A4a','Hoàng Quang Bình',NULL,'Bình','M','deceased',4,'A1/A2a/A3a/A4a','1905-04-18','1980-08-22',NULL,'public',0,1),
(16,'A4a-sp','Đinh Thị Phương',NULL,'Phương','F','deceased',4,'A1/A2a/A3a/A4a-sp','1908-12-01','1985-03-10',NULL,'public',0,1),
(17,'A4b','Hoàng Quang Hùng',NULL,'Hùng','M','deceased',4,'A1/A2a/A3a/A4b','1908-07-25','1990-11-15',NULL,'public',0,1),
(18,'A4b-sp','Trịnh Thị Lan',NULL,'Lan','F','deceased',4,'A1/A2a/A3a/A4b-sp','1912-05-08','1995-06-20',NULL,'public',0,1),
(19,'A4c','Hoàng Quang Nam',NULL,'Nam','M','deceased',4,'A1/A2a/A3b/A4c','1910-09-30','1985-12-25',NULL,'public',0,1),
(20,'A4c-sp','Phan Thị Diệu',NULL,'Diệu','F','deceased',4,'A1/A2a/A3b/A4c-sp','1915-02-14','1992-08-07',NULL,'public',0,1),
(21,'A4d','Hoàng Quang Dũng',NULL,'Dũng','M','deceased',4,'A1/A2a/A3b/A4d','1912-11-11','2000-04-30',NULL,'public',0,1),
(22,'A4d-sp','Ngô Thị Mai',NULL,'Mai','F','deceased',4,'A1/A2a/A3b/A4d-sp','1918-08-20','2005-01-12',NULL,'public',0,1),
(23,'A4e','Hoàng Văn Đức',NULL,'Đức','M','deceased',4,'A1/A2b/A3c/A4e','1915-03-05','1990-07-18',NULL,'public',0,1),
(24,'A4e-sp','Lý Thị Thanh',NULL,'Thanh','F','deceased',4,'A1/A2b/A3c/A4e-sp','1918-10-22','1995-11-30',NULL,'public',0,1),
(25,'A4f','Hoàng Văn Phước',NULL,'Phước','M','deceased',4,'A1/A2b/A3c/A4f','1917-06-15','2003-09-08',NULL,'public',0,1),
(26,'A4f-sp','Đặng Thị Hương',NULL,'Hương','F','deceased',4,'A1/A2b/A3c/A4f-sp','1921-04-20','2008-05-25',NULL,'public',0,1),
(27,'A4g','Hoàng Văn Nghĩa',NULL,'Nghĩa','M','deceased',4,'A1/A2b/A3d/A4g','1920-01-08','2010-03-15',NULL,'public',0,1),
(28,'A4g-sp','Bùi Thị Hà',NULL,'Hà','F','deceased',4,'A1/A2b/A3d/A4g-sp','1924-09-12','2015-07-22',NULL,'public',0,1),
(29,'A4h','Hoàng Văn Lộc',NULL,'Lộc','M','deceased',4,'A1/A2b/A3d/A4h','1922-12-28','2018-02-10',NULL,'public',0,1),
(30,'A4h-sp','Trần Thị Yến',NULL,'Yến','F','deceased',4,'A1/A2b/A3d/A4h-sp','1928-07-15','2020-11-05',NULL,'public',0,1);

-- ĐỜI 5: 24 người (đời cha/mẹ hiện tại, tuổi 50-75)
INSERT INTO person (id,code,full_name,ten_huy,ten_thuong,gender,life_status,generation,lineage_path,birth_solar,privacy,version,tree_id) VALUES
(31,'A5a','Hoàng Bình Minh',NULL,'Minh','M','alive',5,'A1/A2a/A3a/A4a/A5a','1952-06-20','members',0,1),
(32,'A5a-sp','Nguyễn Thị Hồng',NULL,'Hồng','F','alive',5,'A1/A2a/A3a/A4a/A5a-sp','1955-03-10','members',0,1),
(33,'A5b','Hoàng Bình An',NULL,'An','M','alive',5,'A1/A2a/A3a/A4a/A5b','1955-11-14','members',0,1),
(34,'A5b-sp','Lê Thị Hoa',NULL,'Hoa','F','alive',5,'A1/A2a/A3a/A4a/A5b-sp','1958-08-25','members',0,1),
(35,'A5c','Hoàng Hùng Cường',NULL,'Cường','M','alive',5,'A1/A2a/A3a/A4b/A5c','1950-09-05','members',0,1),
(36,'A5c-sp','Phạm Thị Liên',NULL,'Liên','F','alive',5,'A1/A2a/A3a/A4b/A5c-sp','1953-04-18','members',0,1),
(37,'A5d','Hoàng Hùng Duy',NULL,'Duy','M','alive',5,'A1/A2a/A3a/A4b/A5d','1953-07-30','members',0,1),
(38,'A5d-sp','Võ Thị Kim',NULL,'Kim','F','alive',5,'A1/A2a/A3a/A4b/A5d-sp','1957-01-22','members',0,1),
(39,'A5e','Hoàng Nam Long',NULL,'Long','M','alive',5,'A1/A2a/A3b/A4c/A5e','1948-05-12','members',0,1),
(40,'A5e-sp','Trần Thị Nga',NULL,'Nga','F','alive',5,'A1/A2a/A3b/A4c/A5e-sp','1952-10-30','members',0,1),
(41,'A5f','Hoàng Nam Phong',NULL,'Phong','M','alive',5,'A1/A2a/A3b/A4c/A5f','1951-02-28','members',0,1),
(42,'A5f-sp','Đinh Thị Châu',NULL,'Châu','F','alive',5,'A1/A2a/A3b/A4c/A5f-sp','1955-06-15','members',0,1),
(43,'A5g','Hoàng Dũng Kiên',NULL,'Kiên','M','alive',5,'A1/A2a/A3b/A4d/A5g','1955-08-08','members',0,1),
(44,'A5g-sp','Ngô Thị Ánh',NULL,'Ánh','F','alive',5,'A1/A2a/A3b/A4d/A5g-sp','1958-12-20','members',0,1),
(45,'A5h','Hoàng Dũng Thắng',NULL,'Thắng','M','alive',5,'A1/A2a/A3b/A4d/A5h','1958-04-14','members',0,1),
(46,'A5h-sp','Lý Thị Tuyết',NULL,'Tuyết','F','alive',5,'A1/A2a/A3b/A4d/A5h-sp','1962-09-08','members',0,1),
(47,'A5i','Hoàng Đức Trung',NULL,'Trung','M','alive',5,'A1/A2b/A3c/A4e/A5i','1945-12-25','members',0,1),
(48,'A5i-sp','Bùi Thị Loan',NULL,'Loan','F','alive',5,'A1/A2b/A3c/A4e/A5i-sp','1950-07-10','members',0,1),
(49,'A5j','Hoàng Đức Sơn',NULL,'Sơn','M','alive',5,'A1/A2b/A3c/A4e/A5j','1948-10-05','members',0,1),
(50,'A5j-sp','Phan Thị Nhung',NULL,'Nhung','F','alive',5,'A1/A2b/A3c/A4e/A5j-sp','1952-03-18','members',0,1),
(51,'A5k','Hoàng Phước Toàn',NULL,'Toàn','M','alive',5,'A1/A2b/A3c/A4f/A5k','1952-11-22','members',0,1),
(52,'A5k-sp','Đặng Thị Mỹ',NULL,'Mỹ','F','alive',5,'A1/A2b/A3c/A4f/A5k-sp','1956-05-30','members',0,1),
(53,'A5l','Hoàng Phước Lâm',NULL,'Lâm','M','alive',5,'A1/A2b/A3c/A4f/A5l','1955-08-17','members',0,1),
(54,'A5l-sp','Trần Thị Bích',NULL,'Bích','F','alive',5,'A1/A2b/A3c/A4f/A5l-sp','1959-01-05','members',0,1);

-- ĐỜI 6: 30 người trẻ (25-50 tuổi)
INSERT INTO person (id,code,full_name,ten_thuong,gender,life_status,generation,lineage_path,birth_solar,privacy,version,tree_id) VALUES
(55,'A6a','Hoàng Minh Khoa','Khoa','M','alive',6,'A1/A2a/A3a/A4a/A5a/A6a','1980-04-15','members',0,1),
(56,'A6a-sp','Nguyễn Thị Lan Anh','Lan Anh','F','alive',6,'A1/A2a/A3a/A4a/A5a/A6a-sp','1982-08-22','members',0,1),
(57,'A6b','Hoàng Minh Tú','Tú','M','alive',6,'A1/A2a/A3a/A4a/A5a/A6b','1983-12-10','members',0,1),
(58,'A6c','Hoàng An Thảo','Thảo','F','alive',6,'A1/A2a/A3a/A4a/A5b/A6c','1985-06-28','members',0,1),
(59,'A6d','Hoàng An Đạt','Đạt','M','alive',6,'A1/A2a/A3a/A4a/A5b/A6d','1988-03-05','members',0,1),
(60,'A6e','Hoàng Cường Vũ','Vũ','M','alive',6,'A1/A2a/A3a/A4b/A5c/A6e','1978-09-14','members',0,1),
(61,'A6e-sp','Lê Thị Kim Chi','Kim Chi','F','alive',6,'A1/A2a/A3a/A4b/A5c/A6e-sp','1980-07-25','members',0,1),
(62,'A6f','Hoàng Cường Hải','Hải','M','alive',6,'A1/A2a/A3a/A4b/A5c/A6f','1981-11-30','members',0,1),
(63,'A6g','Hoàng Duy Phát','Phát','M','alive',6,'A1/A2a/A3a/A4b/A5d/A6g','1982-02-18','members',0,1),
(64,'A6h','Hoàng Duy Linh','Linh','F','alive',6,'A1/A2a/A3a/A4b/A5d/A6h','1985-10-04','members',0,1),
(65,'A6i','Hoàng Long Giang','Giang','M','alive',6,'A1/A2a/A3b/A4c/A5e/A6i','1976-07-22','members',0,1),
(66,'A6i-sp','Phạm Thị Huyền','Huyền','F','alive',6,'A1/A2a/A3b/A4c/A5e/A6i-sp','1978-04-12','members',0,1),
(67,'A6j','Hoàng Long Giang Nhi','Giang Nhi','F','alive',6,'A1/A2a/A3b/A4c/A5e/A6j','1980-01-08','members',0,1),
(68,'A6k','Hoàng Phong Tuấn','Tuấn','M','alive',6,'A1/A2a/A3b/A4c/A5f/A6k','1978-05-19','members',0,1),
(69,'A6l','Hoàng Phong Uyên','Uyên','F','alive',6,'A1/A2a/A3b/A4c/A5f/A6l','1982-12-25','members',0,1),
(70,'A6m','Hoàng Kiên Nhật','Nhật','M','alive',6,'A1/A2a/A3b/A4d/A5g/A6m','1983-08-16','members',0,1),
(71,'A6n','Hoàng Kiên Nguyệt','Nguyệt','F','alive',6,'A1/A2a/A3b/A4d/A5g/A6n','1986-03-27','members',0,1),
(72,'A6o','Hoàng Thắng Minh Hiếu','Hiếu','M','alive',6,'A1/A2a/A3b/A4d/A5h/A6o','1988-06-14','members',0,1),
(73,'A6p','Hoàng Thắng Như Quỳnh','Quỳnh','F','alive',6,'A1/A2a/A3b/A4d/A5h/A6p','1991-11-08','members',0,1),
(74,'A6q','Hoàng Trung Bảo','Bảo','M','alive',6,'A1/A2b/A3c/A4e/A5i/A6q','1975-04-20','members',0,1),
(75,'A6q-sp','Võ Thị Trà My','Trà My','F','alive',6,'A1/A2b/A3c/A4e/A5i/A6q-sp','1978-09-15','members',0,1),
(76,'A6r','Hoàng Trung Anh Khoa','Anh Khoa','M','alive',6,'A1/A2b/A3c/A4e/A5i/A6r','1978-12-30','members',0,1),
(77,'A6s','Hoàng Sơn Việt','Việt','M','alive',6,'A1/A2b/A3c/A4e/A5j/A6s','1977-07-04','members',0,1),
(78,'A6t','Hoàng Sơn Phương','Phương','F','alive',6,'A1/A2b/A3c/A4e/A5j/A6t','1980-02-14','members',0,1),
(79,'A6u','Hoàng Toàn Khánh','Khánh','M','alive',6,'A1/A2b/A3c/A4f/A5k/A6u','1980-09-22','members',0,1),
(80,'A6v','Hoàng Toàn Linh','Linh','F','alive',6,'A1/A2b/A3c/A4f/A5k/A6v','1983-05-18','members',0,1),
(81,'A6w','Hoàng Lâm Quốc Huy','Quốc Huy','M','alive',6,'A1/A2b/A3c/A4f/A5l/A6w','1983-11-10','members',0,1),
(82,'A6x','Hoàng Lâm Thanh Trúc','Thanh Trúc','F','alive',6,'A1/A2b/A3c/A4f/A5l/A6x','1987-08-06','members',0,1),
(83,'A6y','Hoàng Lâm Hùng','Hùng','M','alive',6,'A1/A2b/A3c/A4f/A5l/A6y','1990-04-01','members',0,1),
(84,'A6z','Hoàng Toàn Đức','Đức','M','alive',6,'A1/A2b/A3c/A4f/A5k/A6z','1985-01-15','members',0,1);

-- ĐỜI 7: thế hệ trẻ nhất (sinh 2000-2015)
INSERT INTO person (id,code,full_name,ten_thuong,gender,life_status,generation,lineage_path,birth_solar,privacy,version,tree_id) VALUES
(85,'A7a','Hoàng Minh Ân','Ân','M','alive',7,'A1/A2a/A3a/A4a/A5a/A6a/A7a','2005-08-20','members',0,1),
(86,'A7b','Hoàng Minh Yến','Yến','F','alive',7,'A1/A2a/A3a/A4a/A5a/A6a/A7b','2008-03-15','members',0,1),
(87,'A7c','Hoàng Cường Khải','Khải','M','alive',7,'A1/A2a/A3a/A4b/A5c/A6e/A7c','2004-11-28','members',0,1),
(88,'A7d','Hoàng Cường Khanh','Khanh','F','alive',7,'A1/A2a/A3a/A4b/A5c/A6e/A7d','2007-06-10','members',0,1),
(89,'A7e','Hoàng Giang Bảo Ngọc','Bảo Ngọc','F','alive',7,'A1/A2a/A3b/A4c/A5e/A6i/A7e','2003-02-25','members',0,1),
(90,'A7f','Hoàng Giang Minh Khang','Minh Khang','M','alive',7,'A1/A2a/A3b/A4c/A5e/A6i/A7f','2006-09-18','members',0,1),
(91,'A7g','Hoàng Trung Gia Huy','Gia Huy','M','alive',7,'A1/A2b/A3c/A4e/A5i/A6q/A7g','2002-07-12','members',0,1),
(92,'A7h','Hoàng Trung Gia Linh','Gia Linh','F','alive',7,'A1/A2b/A3c/A4e/A5i/A6q/A7h','2005-12-05','members',0,1),
(93,'A7i','Hoàng Lâm Minh Tâm','Minh Tâm','M','alive',7,'A1/A2b/A3c/A4f/A5l/A6w/A7i','2008-04-22','members',0,1),
(94,'A7j','Hoàng Toàn Bảo Châu','Bảo Châu','F','alive',7,'A1/A2b/A3c/A4f/A5k/A6u/A7j','2006-10-30','members',0,1),
(95,'A7k','Hoàng Sơn Phúc','Phúc','M','alive',7,'A1/A2b/A3c/A4e/A5j/A6s/A7k','2003-01-18','members',0,1),
(96,'A7l','Hoàng Sơn Nhi','Nhi','F','alive',7,'A1/A2b/A3c/A4e/A5j/A6s/A7l','2007-08-14','members',0,1);

-- Thêm 30 người ngẫu nhiên đời 5-6 để đủ >100
INSERT INTO person (id,code,full_name,ten_thuong,gender,life_status,generation,lineage_path,birth_solar,privacy,version,tree_id)
SELECT
  96 + i,
  'A5-ext-' || i,
  (ARRAY['Hoàng','Hoàng','Hoàng'])[1] || ' ' ||
  (ARRAY['Văn','Thị','Minh','Thị','Đức','Thị'])[1 + (i % 6)] || ' ' ||
  (ARRAY['Hùng','Linh','Dũng','Hương','Tuấn','Thúy','Phúc','Ngân','Đạt','Trang',
         'Lâm','Quỳnh','Khoa','My','Bảo','Châu','Huy','Liên','Tài','Vân',
         'Sơn','Ngọc','Toàn','Hoa','Kiên','Mai','Nhật','Yến','Trung','Lan'])[i] AS full_name,
  (ARRAY['Hùng','Linh','Dũng','Hương','Tuấn','Thúy','Phúc','Ngân','Đạt','Trang',
         'Lâm','Quỳnh','Khoa','My','Bảo','Châu','Huy','Liên','Tài','Vân',
         'Sơn','Ngọc','Toàn','Hoa','Kiên','Mai','Nhật','Yến','Trung','Lan'])[i] AS ten_thuong,
  CASE WHEN i % 3 = 0 THEN 'F' ELSE 'M' END,
  CASE WHEN i < 20 THEN 'alive' ELSE 'deceased' END,
  CASE WHEN i < 15 THEN 5 ELSE 4 END,
  'A1/A2a/A3a/A4a/A5-ext-' || i,
  (DATE '1945-01-01' + (i * 365)::int),
  'members',
  0,
  1
FROM generate_series(1,30) AS i;

-- ============================================================
-- 5. FAMILY UNIONS (hôn nhân)
-- ============================================================
INSERT INTO family_union (id, order_no, tree_id, marriage_info_json) VALUES
(1,  1, 1, '{"marriageYear":1848,"marriagePlace":"Xã Trung Bình, Hương Khê"}'),
(2,  1, 1, '{"marriageYear":1872,"marriagePlace":"Hương Khê, Hà Tĩnh"}'),
(3,  1, 1, '{"marriageYear":1878}'),
(4,  1, 1, '{"marriageYear":1900}'),
(5,  1, 1, '{"marriageYear":1906}'),
(6,  1, 1, '{"marriageYear":1910}'),
(7,  1, 1, '{"marriageYear":1912}'),
(8,  1, 1, '{"marriageYear":1930}'),
(9,  1, 1, '{"marriageYear":1932}'),
(10, 1, 1, '{"marriageYear":1935}'),
(11, 1, 1, '{"marriageYear":1938}'),
(12, 1, 1, '{"marriageYear":1940}'),
(13, 1, 1, '{"marriageYear":1942}'),
(14, 1, 1, '{"marriageYear":1945}'),
(15, 1, 1, '{"marriageYear":1948}'),
(16, 1, 1, '{"marriageYear":1950}'),
(17, 1, 1, '{"marriageYear":1952}'),
(18, 1, 1, '{"marriageYear":1968}'),
(19, 1, 1, '{"marriageYear":1970}'),
(20, 1, 1, '{"marriageYear":1972}');

-- Union members (husband HUSBAND + wife WIFE)
INSERT INTO union_member (id, role, union_id, person_id) VALUES
(1,  'HUSBAND', 1,  1),  (2,  'WIFE', 1,  2),   -- A1 + sp
(3,  'HUSBAND', 2,  3),  (4,  'WIFE', 2,  4),   -- A2a
(5,  'HUSBAND', 3,  5),  (6,  'WIFE', 3,  6),   -- A2b
(7,  'HUSBAND', 4,  7),  (8,  'WIFE', 4,  8),   -- A3a
(9,  'HUSBAND', 5,  9),  (10, 'WIFE', 5,  10),  -- A3b
(11, 'HUSBAND', 6,  11), (12, 'WIFE', 6,  12),  -- A3c
(13, 'HUSBAND', 7,  13), (14, 'WIFE', 7,  14),  -- A3d
(15, 'HUSBAND', 8,  15), (16, 'WIFE', 8,  16),  -- A4a
(17, 'HUSBAND', 9,  17), (18, 'WIFE', 9,  18),  -- A4b
(19, 'HUSBAND', 10, 19), (20, 'WIFE', 10, 20),  -- A4c
(21, 'HUSBAND', 11, 21), (22, 'WIFE', 11, 22),  -- A4d
(23, 'HUSBAND', 12, 23), (24, 'WIFE', 12, 24),  -- A4e
(25, 'HUSBAND', 13, 25), (26, 'WIFE', 13, 26),  -- A4f
(27, 'HUSBAND', 14, 27), (28, 'WIFE', 14, 28),  -- A4g
(29, 'HUSBAND', 15, 29), (30, 'WIFE', 15, 30),  -- A4h
(31, 'HUSBAND', 16, 31), (32, 'WIFE', 16, 32),  -- A5a
(33, 'HUSBAND', 17, 35), (34, 'WIFE', 17, 36),  -- A5c
(35, 'HUSBAND', 18, 65), (36, 'WIFE', 18, 66),  -- A6i
(37, 'HUSBAND', 19, 60), (38, 'WIFE', 19, 61),  -- A6e
(39, 'HUSBAND', 20, 74), (40, 'WIFE', 20, 75);  -- A6q

-- Union children
INSERT INTO union_child (id, order_no, union_id, child_id) VALUES
(1,  1, 1,  3),  (2,  2, 1,  5),   -- A1→A2a,A2b
(3,  1, 2,  7),  (4,  2, 2,  9),   -- A2a→A3a,A3b
(5,  1, 3,  11), (6,  2, 3,  13),  -- A2b→A3c,A3d
(7,  1, 4,  15), (8,  2, 4,  17),  -- A3a→A4a,A4b
(9,  1, 5,  19), (10, 2, 5,  21),  -- A3b→A4c,A4d
(11, 1, 6,  23), (12, 2, 6,  25),  -- A3c→A4e,A4f
(13, 1, 7,  27), (14, 2, 7,  29),  -- A3d→A4g,A4h
(15, 1, 8,  31), (16, 2, 8,  33),  -- A4a→A5a,A5b
(17, 1, 9,  35), (18, 2, 9,  37),  -- A4b→A5c,A5d
(19, 1, 10, 39), (20, 2, 10, 41),  -- A4c→A5e,A5f
(21, 1, 11, 43), (22, 2, 11, 45),  -- A4d→A5g,A5h
(23, 1, 12, 47), (24, 2, 12, 49),  -- A4e→A5i,A5j
(25, 1, 13, 51), (26, 2, 13, 53),  -- A4f→A5k,A5l
(27, 1, 16, 55), (28, 2, 16, 57),  -- A5a→A6a,A6b
(29, 1, 17, 60), (30, 2, 17, 62),  -- A5c→A6e,A6f
(31, 1, 18, 65), (32, 2, 18, 67),  -- A5e→A6i,A6j
(33, 1, 19, 85), (34, 2, 19, 86),  -- A6e→A7c,A7d
(35, 1, 20, 91), (36, 2, 20, 92);  -- A6q→A7g,A7h

-- ============================================================
-- 6. DEATH ANNIVERSARIES (ngày giỗ cho người đã mất)
-- ============================================================
INSERT INTO death_anniversary (id, lunar_day, lunar_month, leap_month, can_chi, note, tree_id, person_id) VALUES
(1,  20, 7,  false, 'Ất Mùi',  'Giỗ Thủy tổ Hoàng Văn Tổ',             1, 1),
(2,  14, 2,  false, 'Canh Tý',  'Giỗ Tổ mẫu',                           1, 2),
(3,  5,  11, false, 'Canh Thân','Giỗ ông Hoàng Văn Trưởng',             1, 3),
(4,  12, 6,  false, 'Ất Sửu',  'Giỗ bà Lê Thị Hiền',                   1, 4),
(5,  22, 3,  false, 'Canh Ngọ','Giỗ ông Hoàng Văn Thứ',                 1, 5),
(6,  17, 8,  false, 'Ất Hợi',  'Giỗ bà Phạm Thị Lan',                  1, 6),
(7,  30, 9,  false, 'Giáp Ngọ','Giỗ ông Hoàng Minh Quang',              1, 7),
(8,  18, 12, false, 'Canh Tý', 'Giỗ bà Trần Thị Ngọc',                 1, 8),
(9,  15, 8,  false, 'Ất Dậu',  'Liệt sĩ Hoàng Minh Sáng — Điện Biên', 1, 9),
(10, 10, 4,  false, 'Canh Dần','Giỗ bà Nguyễn Thị Hoa',                1, 10),
(11, 25, 1,  false, 'Ất Tỵ',   'Giỗ ông Hoàng Minh Văn',               1, 11),
(12, 30, 7,  false, 'Canh Tuất','Giỗ bà Võ Thị Bạch',                  1, 12),
(13, 14, 2,  false, 'Ất Mão',  'Giỗ ông Hoàng Minh Thành',             1, 13),
(14, 5,  9,  false, 'Canh Thìn','Giỗ bà Lê Thị Thu',                   1, 14),
(15, 22, 8,  false, 'Canh Thân','Giỗ ông Hoàng Quang Bình',            1, 15),
(16, 10, 3,  false, 'Ất Sửu',  'Giỗ bà Đinh Thị Phương',              1, 16),
(17, 15, 11, false, 'Canh Ngọ','Giỗ ông Hoàng Quang Hùng',             1, 17),
(18, 20, 6,  false, 'Ất Hợi',  'Giỗ bà Trịnh Thị Lan',                1, 18),
(19, 25, 12, false, 'Canh Dần','Giỗ ông Hoàng Quang Nam',              1, 19),
(20, 7,  8,  false, 'Ất Mùi',  'Giỗ bà Phan Thị Diệu',                1, 20);

-- ============================================================
-- 7. CMS POSTS (120 bài viết)
-- ============================================================

-- Bài viết chi tiết thật (20 bài)
INSERT INTO cms_post (id, slug, title, summary, body_html, status, published_at, author_name, category_id) VALUES
(1, 'gioi-thieu-dong-ho-hoang-trung-binh',
 'Giới thiệu dòng họ Hoàng Trung Bình — Hà Tĩnh',
 'Tổng quan lịch sử hơn 200 năm hình thành và phát triển của dòng họ Hoàng tại xã Trung Bình, huyện Hương Khê, tỉnh Hà Tĩnh.',
 '<h2>Nguồn gốc dòng họ</h2><p>Dòng họ Hoàng Trung Bình có nguồn gốc từ xã Trung Bình, huyện Hương Khê, tỉnh Hà Tĩnh. Theo gia phả ghi chép, Thủy tổ <strong>Hoàng Văn Tổ</strong> (húy Hoàng Tảo Lạc) sinh năm 1825, là người đặt nền móng đầu tiên cho dòng tộc tại vùng đất này.</p><h2>Phát triển qua các thế hệ</h2><p>Trải qua 7 đời, dòng họ đã phát triển với hơn 100 thành viên, trải rộng từ Hà Tĩnh vào đến TP. Hồ Chí Minh và nhiều tỉnh thành khác.</p><h3>Các cột mốc quan trọng</h3><ul><li><strong>1825</strong>: Thủy tổ Hoàng Văn Tổ khai lập chi họ</li><li><strong>1900</strong>: Xây dựng nhà thờ họ đầu tiên</li><li><strong>1945</strong>: Liệt sĩ Hoàng Minh Sáng hy sinh trong kháng chiến</li><li><strong>2000</strong>: Khôi phục và lập gia phả chi họ lần đầu</li><li><strong>2024</strong>: Ra mắt Gia Phả số GiaPhaHub</li></ul><blockquote>\"Uống nước nhớ nguồn, ăn quả nhớ kẻ trồng cây\" — Truyền thống tốt đẹp của dòng họ Hoàng.</blockquote>',
 'published', '2026-01-15 08:00:00', 'Ban biên tập họ Hoàng', 3),

(2, 'le-gio-to-2026-thong-bao',
 'Thông báo lễ giỗ Tổ họ Hoàng năm 2026',
 'Ban tổ chức thông báo lịch trình lễ giỗ Tổ thường niên họ Hoàng năm 2026 tại nhà thờ họ xã Trung Bình, Hương Khê, Hà Tĩnh.',
 '<h2>Lịch trình lễ giỗ Tổ 2026</h2><p>Kính gửi toàn thể bà con dòng họ Hoàng Trung Bình,</p><p>Ban tổ chức trân trọng thông báo lễ giỗ Tổ họ Hoàng năm 2026 sẽ được tổ chức theo lịch sau:</p><h3>Ngày 3/3 Âm lịch (thứ Bảy, 01/04/2026)</h3><ul><li><strong>7:00</strong>: Tập kết tại nhà thờ họ</li><li><strong>8:00</strong>: Lễ dâng hương tưởng nhớ Thủy tổ</li><li><strong>9:00</strong>: Đọc gia phả và truyện kể dòng họ</li><li><strong>11:00</strong>: Tiệc họp mặt, giao lưu con cháu</li><li><strong>14:00</strong>: Hội nghị dòng họ, báo cáo quỹ công đức</li></ul><p><strong>Địa điểm:</strong> Nhà thờ họ Hoàng, Xóm 3, Xã Trung Bình, Hương Khê, Hà Tĩnh.</p><p>Trân trọng kính mời!</p>',
 'published', '2026-02-15 09:00:00', 'Ban tổ chức họ Hoàng', 2),

(3, 'liet-si-hoang-minh-sang-ky-niem',
 'Tưởng nhớ liệt sĩ Hoàng Minh Sáng — Anh hùng của dòng họ',
 'Kỷ niệm 71 năm ngày hy sinh của liệt sĩ Hoàng Minh Sáng tại chiến dịch Điện Biên Phủ, ngày 15/8/1945.',
 '<h2>Người con anh hùng của dòng họ</h2><p>Liệt sĩ <strong>Hoàng Minh Sáng</strong> sinh năm 1880, là con trai thứ hai của ông Hoàng Văn Trưởng. Ông tham gia kháng chiến chống Pháp từ rất sớm và đã anh dũng hy sinh trong kháng chiến ngày 15/8/1945, hưởng thọ 65 tuổi.</p><p>Di sản của liệt sĩ Hoàng Minh Sáng mãi là nguồn cảm hứng bất tận cho các thế hệ con cháu trong dòng họ.</p><h2>Lễ tưởng niệm</h2><p>Hằng năm, vào ngày 15 tháng 8 âm lịch, dòng họ tổ chức lễ tưởng niệm tại nhà thờ họ và thắp hương tại mộ phần liệt sĩ.</p>',
 'published', '2026-03-10 07:30:00', 'Hoàng Bình Minh', 5),

(4, 'nha-tho-ho-hoang-lich-su-kien-truc',
 'Nhà thờ họ Hoàng — Di sản kiến trúc truyền thống Hà Tĩnh',
 'Tìm hiểu về lịch sử xây dựng và kiến trúc độc đáo của nhà thờ họ Hoàng qua hơn 100 năm tồn tại.',
 '<h2>Lịch sử nhà thờ họ</h2><p>Nhà thờ họ Hoàng được xây dựng lần đầu tiên vào năm <strong>1900</strong> dưới thời ông Hoàng Văn Trưởng (đời 2). Trải qua nhiều lần tu bổ, công trình hiện tại được xây dựng năm 1985 với kiến trúc theo phong cách truyền thống Việt Nam.</p><h2>Kiến trúc</h2><p>Nhà thờ họ có diện tích 120m², bao gồm:</p><ul><li>Tiền đường (gian tiếp khách): 40m²</li><li>Chính điện (nơi thờ phụng): 60m²</li><li>Hậu điện (kho lưu trữ gia phả): 20m²</li></ul><p>Công trình được thiết kế theo kiểu nhà 3 gian 2 chái, mái lợp ngói âm dương truyền thống, cột kèo bằng gỗ lim.</p>',
 'published', '2026-01-20 10:00:00', 'Hoàng Đức Trung', 3),

(5, 'gia-pha-so-ra-mat-2024',
 'Ra mắt hệ thống Gia Phả Số GiaPhaHub cho dòng họ Hoàng',
 'Dòng họ Hoàng Trung Bình chính thức ra mắt phần mềm quản lý gia phả số, giúp lưu giữ và kết nối con cháu khắp nơi.',
 '<h2>Gia Phả Số — Bước tiến mới</h2><p>Trong thời đại số, việc lưu giữ và phổ biến gia phả bằng phương pháp truyền thống ngày càng gặp nhiều thách thức. Nhận thức được điều này, dòng họ Hoàng Trung Bình đã đầu tư xây dựng hệ thống <strong>GiaPhaHub</strong> — nền tảng gia phả số hiện đại.</p><h2>Tính năng nổi bật</h2><ul><li>Phả đồ trực quan, dễ tra cứu</li><li>Hồ sơ từng thành viên chi tiết</li><li>Lịch nhắc nhở ngày giỗ (dương và âm lịch)</li><li>Thư viện ảnh gia đình</li><li>Tin tức và thông báo dòng họ</li></ul><p>Hệ thống hoàn toàn miễn phí cho tất cả thành viên dòng họ Hoàng Trung Bình.</p>',
 'published', '2026-04-01 08:00:00', 'Ban biên tập họ Hoàng', 1);

-- 115 bài viết tự sinh (dùng generate_series)
INSERT INTO cms_post (id, slug, title, summary, body_html, status, published_at, author_name, category_id)
SELECT
  5 + i,
  'bai-viet-' || i || '-' || to_char(NOW() - (i * interval '3 days'), 'YYYYMMDD'),
  (ARRAY[
    'Họp mặt dòng họ năm ', 'Chương trình khuyến học họ Hoàng ', 'Thông báo quỹ công đức tháng ',
    'Kỷ niệm ngày cưới vàng của ông bà ', 'Chúc mừng thành viên họ Hoàng đạt thành tích ',
    'Câu chuyện gia đình: ', 'Ảnh tư liệu quý về dòng họ — ', 'Hội thi nấu ăn truyền thống họ Hoàng ',
    'Buổi gặp mặt con cháu xa quê ', 'Lễ mừng thọ tại nhà thờ họ '
  ])[1 + (i % 10)] || i,
  'Tóm tắt bài viết số ' || i || ' về sinh hoạt và hoạt động của dòng họ Hoàng Trung Bình.',
  '<p>Nội dung chi tiết bài viết số ' || i || '. Dòng họ Hoàng Trung Bình luôn gìn giữ truyền thống tốt đẹp qua các thế hệ. ' ||
  'Bài viết này được đăng tải nhằm chia sẻ thông tin và kết nối con cháu dòng họ khắp nơi.</p>' ||
  '<p>Mọi thông tin xin liên hệ Ban liên lạc dòng họ Hoàng Trung Bình.</p>',
  CASE WHEN i % 8 = 0 THEN 'draft' WHEN i % 12 = 0 THEN 'archived' ELSE 'published' END,
  NOW() - (i * interval '3 days'),
  (ARRAY['Ban biên tập','Hoàng Bình Minh','Hoàng Đức Trung','Hoàng Trung Bảo',
         'Hoàng Cường Vũ','Hoàng Long Giang','Hoàng Minh Khoa','Hoàng Toàn Khánh'])[1 + (i % 8)],
  1 + (i % 5)
FROM generate_series(1, 115) AS i;

-- ============================================================
-- 8. MEDIA ALBUMS
-- ============================================================
INSERT INTO media_album (id, title, description) VALUES
(1, 'Lễ giỗ Tổ 2025', 'Ảnh kỷ niệm lễ giỗ Tổ họ Hoàng ngày 3/3 âm lịch năm 2025'),
(2, 'Họp mặt Tết Ất Tỵ 2025', 'Album ảnh họp mặt đầu xuân Ất Tỵ 2025 tại nhà thờ họ'),
(3, 'Nhà thờ họ — Tư liệu lịch sử', 'Bộ ảnh tư liệu nhà thờ họ Hoàng qua các thời kỳ'),
(4, 'Mộ phần tổ tiên', 'Album ảnh các phần mộ tổ tiên dòng họ tại Hương Khê, Hà Tĩnh'),
(5, 'Con cháu thành đạt', 'Album ảnh các thành viên dòng họ đạt thành tích xuất sắc');

-- media_photo — dùng Unsplash làm object_key tạm (chờ upload MinIO thật)
-- Định dạng object_key: albums/{albumId}/{uuid}.jpg
INSERT INTO media_photo (id, object_key, caption, view_count, album_id) VALUES
(1,  'albums/1/photo-001.jpg', 'Lễ dâng hương khai mạc giỗ Tổ 2025', 42, 1),
(2,  'albums/1/photo-002.jpg', 'Toàn thể con cháu chụp ảnh lưu niệm', 38, 1),
(3,  'albums/1/photo-003.jpg', 'Mâm cỗ truyền thống dâng Tổ', 55, 1),
(4,  'albums/1/photo-004.jpg', 'Các vị cao niên đọc gia phả', 29, 1),
(5,  'albums/1/photo-005.jpg', 'Trẻ em dòng họ vui chơi', 18, 1),
(6,  'albums/2/photo-001.jpg', 'Họp mặt đầu xuân Ất Tỵ — Đoàn xe từ Sài Gòn ra', 67, 2),
(7,  'albums/2/photo-002.jpg', 'Bữa cơm tất niên ấm cúng', 73, 2),
(8,  'albums/2/photo-003.jpg', 'Lì xì đầu năm cho các em nhỏ', 88, 2),
(9,  'albums/2/photo-004.jpg', 'Múa lân mừng xuân tại sân nhà thờ họ', 102, 2),
(10, 'albums/3/photo-001.jpg', 'Nhà thờ họ Hoàng chụp năm 1985', 156, 3),
(11, 'albums/3/photo-002.jpg', 'Gian thờ chính với bài vị các đời', 134, 3),
(12, 'albums/3/photo-003.jpg', 'Toàn cảnh nhà thờ họ từ phía trước', 209, 3),
(13, 'albums/4/photo-001.jpg', 'Khu mộ phần đời 1 — Thủy tổ và Tổ mẫu', 87, 4),
(14, 'albums/4/photo-002.jpg', 'Mộ liệt sĩ Hoàng Minh Sáng', 145, 4),
(15, 'albums/5/photo-001.jpg', 'GS.TS Hoàng Lâm Quốc Huy — Đại học Quốc gia Hà Nội', 234, 5),
(16, 'albums/5/photo-002.jpg', 'Hoàng Giang Bảo Ngọc — Huy chương Vàng Olympic Toán 2023', 312, 5),
(17, 'albums/5/photo-003.jpg', 'Hoàng Trung Bảo — Doanh nhân thành đạt tại TP.HCM', 178, 5);

-- Thêm ảnh để đạt >100 bản ghi media (object_key sẽ được ghi đè khi chạy seed-media-minio.sh)
INSERT INTO media_photo (id, object_key, caption, view_count, album_id)
SELECT
  17 + i,
  'albums/' || (1 + ((i - 1) % 5)) || '/photo-seed-' || lpad(i::text, 3, '0') || '.jpg',
  'Ảnh tư liệu số ' || i || ' — họ Hoàng Trung Bình',
  10 + (i % 90),
  1 + ((i - 1) % 5)
FROM generate_series(1, 100) AS i;

-- ============================================================
-- 9. QUỸ CÔNG ĐỨC (≥100 đóng góp)
-- ============================================================
INSERT INTO donation_campaign (id, title, goal_amount, raised_amount, vietqr_payload, status, tree_id) VALUES
(1, 'Tôn tạo lăng mộ Thủy tổ', 250000000, 182500000, 'BANK|970422|1234567890|Hoang Van To', 'open', 1),
(2, 'Quỹ khuyến học năm học mới', 100000000, 45600000, 'BANK|970422|1234567891|Quy Khuyen Hoc', 'open', 1),
(3, 'Sửa chữa nhà thờ họ', 180000000, 180000000, 'BANK|970422|1234567892|Nha Tho Ho', 'closed', 1);

INSERT INTO donation_contribution (id, donor_name, amount, kind, note, created_at, campaign_id)
SELECT
  i,
  (ARRAY['Hoàng Đức Trung','Hoàng Bình Minh','Nguyễn Thị Lan','Lê Văn Hùng','Phạm Thị Hoa',
         'Hoàng Quang Nam','Trần Văn Tài','Hoàng Thị Mai','Võ Minh Tuấn','Đinh Thị Phương'])[1 + (i % 10)]
    || ' #' || i,
  (500000 + (i % 40) * 250000)::numeric,
  CASE WHEN i % 7 = 0 THEN 'pending' ELSE 'money' END,
  'Công đức đợt seed #' || i,
  NOW() - (i * interval '6 hours'),
  1 + ((i - 1) % 3)
FROM generate_series(1, 120) AS i;

UPDATE donation_campaign c SET raised_amount = (
  SELECT COALESCE(SUM(amount), 0) FROM donation_contribution d
  WHERE d.campaign_id = c.id AND d.kind <> 'pending'
);

-- ============================================================
-- 10. SỰ KIỆN + ĐĂNG KÝ HỘ (≥100 RSVP)
-- ============================================================
INSERT INTO clan_event (id, title, start_solar, lunar_json, location, checklist_json, tree_id) VALUES
(1, 'Giỗ Tổ thường niên', '2026-04-20 08:00:00', '{"lunarDay":3,"lunarMonth":3}', 'Nhà thờ họ — Hương Khê',
 '["Dọn dẹp từ đường","Mâm cỗ","Phát loa"]', 1),
(2, 'Họp mặt con cháu xa quê', '2026-08-15 09:00:00', NULL, 'Sân nhà thờ họ',
 '["Đăng ký hộ","Phân công đón tiếp"]', 1),
(3, 'Lễ khánh thành lăng mộ', '2026-10-01 07:30:00', NULL, 'Khu lăng mộ Thủy tổ',
 '["Xe đưa đón","Lễ vật"]', 1);

INSERT INTO event_rsvp (id, household_name, headcount, vehicles, assignment, event_id)
SELECT
  i,
  'Hộ ' || (ARRAY['Hoàng','Nguyễn','Lê','Phạm','Trần'])[1 + (i % 5)] || ' ' || i,
  2 + (i % 6),
  i % 3,
  (ARRAY['Đón tiếp','Ẩm thực','Trật tự','Hậu cần','Truyền thông',NULL])[1 + (i % 6)],
  1 + ((i - 1) % 3)
FROM generate_series(1, 110) AS i;

-- ============================================================
-- 11. KHUYẾN HỌC (≥100 hồ sơ)
-- ============================================================
INSERT INTO scholarship_entry (id, person_name, achievement, year, status, tree_id)
SELECT
  i,
  'Hoàng ' || (ARRAY['An','Bình','Cường','Dũng','Em','Phúc','Giang','Hà','Khoa','Lan'])[1 + (i % 10)]
    || ' ' || (ARRAY['Minh','Văn','Thị','Đức','Quang'])[1 + (i % 5)] || ' ' || i,
  (ARRAY[
    'Học sinh giỏi cấp tỉnh',
    'Thủ khoa đầu vào đại học',
    'Huy chương Olympic Toán',
    'Giải nhất hội thi văn nghệ',
    'Học bổng khuyến khích học tập'
  ])[1 + (i % 5)],
  2018 + (i % 8),
  CASE WHEN i % 5 = 0 THEN 'nominated' WHEN i % 11 = 0 THEN 'rejected' ELSE 'approved' END,
  1
FROM generate_series(1, 120) AS i;

-- ============================================================
-- 12. BÌNH LUẬN CMS (≥100)
-- ============================================================
INSERT INTO cms_comment (id, author_name, body, status, created_at, post_id)
SELECT
  i,
  (ARRAY['Bạn đọc A','Con cháu xa quê','Hoàng Văn B','Nguyễn Thị C','Khách thăm'])[1 + (i % 5)],
  'Bình luận mẫu số ' || i || ' — cảm ơn Ban biên tập đã cập nhật tin tức dòng họ.',
  CASE WHEN i % 4 = 0 THEN 'pending' WHEN i % 9 = 0 THEN 'rejected' ELSE 'approved' END,
  NOW() - (i * interval '2 hours'),
  1 + ((i - 1) % 5)
FROM generate_series(1, 120) AS i;

-- ============================================================
-- 13. RESET SEQUENCE (JHipster dùng chung sequence_generator)
-- ============================================================
SELECT setval(
  'sequence_generator',
  GREATEST(
    (SELECT COALESCE(MAX(id), 1) FROM person),
    (SELECT COALESCE(MAX(id), 1) FROM cms_post),
    (SELECT COALESCE(MAX(id), 1) FROM cms_comment),
    (SELECT COALESCE(MAX(id), 1) FROM media_photo),
    (SELECT COALESCE(MAX(id), 1) FROM donation_contribution),
    (SELECT COALESCE(MAX(id), 1) FROM event_rsvp),
    (SELECT COALESCE(MAX(id), 1) FROM scholarship_entry),
    (SELECT COALESCE(MAX(id), 1) FROM clan_event),
    (SELECT COALESCE(MAX(id), 1) FROM donation_campaign),
    (SELECT COALESCE(MAX(id), 1) FROM family_tree)
  )
);

-- Verify
SELECT 'family_tree' AS t, COUNT(*) FROM family_tree
UNION ALL SELECT 'person', COUNT(*) FROM person
UNION ALL SELECT 'family_union', COUNT(*) FROM family_union
UNION ALL SELECT 'cms_post', COUNT(*) FROM cms_post
UNION ALL SELECT 'cms_comment', COUNT(*) FROM cms_comment
UNION ALL SELECT 'media_photo', COUNT(*) FROM media_photo
UNION ALL SELECT 'donation_contribution', COUNT(*) FROM donation_contribution
UNION ALL SELECT 'event_rsvp', COUNT(*) FROM event_rsvp
UNION ALL SELECT 'scholarship_entry', COUNT(*) FROM scholarship_entry;
