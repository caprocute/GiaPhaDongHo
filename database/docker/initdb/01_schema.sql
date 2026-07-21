-- ============================================================================
-- GiaPhaHub — PostgreSQL schema (KHÔNG data mẫu)
-- ============================================================================
-- SINH TỰ ĐỘNG từ Liquibase master.xml (nguồn chân lý duy nhất).
--   Lệnh: ./gradlew liquibaseUpdateSql (contexts=prod)  —  xem database/scripts/regenerate-sql.sh
-- ⚠  KHÔNG sửa tay file này. Đổi schema => sửa JDL/changelog rồi generate lại.
--
-- Bao gồm: extension unaccent, sequence_generator, 20 entity + module_registry,
--          audit_log, bảng Liquibase (databasechangelog[lock]) và seed CMS category prod.
-- Idempotent-ish: chạy trên DB TRỐNG. Chạy lại trên DB đã có sẽ lỗi 'already exists'.
-- ============================================================================

-- Create Database Lock Table
CREATE TABLE public.databasechangeloglock (ID INTEGER NOT NULL, LOCKED BOOLEAN NOT NULL, LOCKGRANTED TIMESTAMP WITHOUT TIME ZONE, LOCKEDBY VARCHAR(255), CONSTRAINT databasechangeloglock_pkey PRIMARY KEY (ID));

-- Initialize Database Lock Table
DELETE FROM public.databasechangeloglock;

INSERT INTO public.databasechangeloglock (ID, LOCKED) VALUES (1, FALSE);

-- Lock Database
UPDATE public.databasechangeloglock SET LOCKED = TRUE, LOCKEDBY = 'init-script', LOCKGRANTED = NOW() WHERE ID = 1 AND LOCKED = FALSE;

-- Create Database Change Log Table
CREATE TABLE public.databasechangelog (ID VARCHAR(255) NOT NULL, AUTHOR VARCHAR(255) NOT NULL, FILENAME VARCHAR(255) NOT NULL, DATEEXECUTED TIMESTAMP WITHOUT TIME ZONE NOT NULL, ORDEREXECUTED INTEGER NOT NULL, EXECTYPE VARCHAR(10) NOT NULL, MD5SUM VARCHAR(35), DESCRIPTION VARCHAR(255), COMMENTS VARCHAR(255), TAG VARCHAR(255), LIQUIBASE VARCHAR(20), CONTEXTS VARCHAR(255), LABELS VARCHAR(255), DEPLOYMENT_ID VARCHAR(10));

-- *********************************************************************
-- Update Database Script
-- *********************************************************************
-- Change Log: config/liquibase/master.xml
-- Ran at: 17:06 21/7/26
-- Against: giapha@jdbc:postgresql://localhost:15432/giapha_sqlgen2
-- Liquibase version: 5.0.3
-- *********************************************************************

-- Changeset config/liquibase/changelog/00000000000000_initial_schema.xml::00000000000000::jhipster
CREATE SEQUENCE  IF NOT EXISTS public.sequence_generator START WITH 1050 INCREMENT BY 50;

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('00000000000000', 'jhipster', 'config/liquibase/changelog/00000000000000_initial_schema.xml', NOW(), 1, '9:b6b4a3e0d2a6d7f1e5139675af65d7b0', 'createSequence sequenceName=sequence_generator', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/00000000000000_initial_schema.xml::00000000000001::jhipster
INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('00000000000001', 'jhipster', 'config/liquibase/changelog/00000000000000_initial_schema.xml', NOW(), 2, '9:d41d8cd98f00b204e9800998ecf8427e', 'empty', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104004_added_entity_FamilyTree.xml::20260716104004-1::jhipster
CREATE TABLE public.family_tree (id BIGINT NOT NULL, slug VARCHAR(255) NOT NULL, surname VARCHAR(255) NOT NULL, branch_name VARCHAR(255), province_code VARCHAR(255), meta_json TEXT, stats_cache_json TEXT, CONSTRAINT family_tree_pkey PRIMARY KEY (id), CONSTRAINT ux_family_tree__slug UNIQUE (slug));

COMMENT ON TABLE public.family_tree IS 'Entity lõi phả hệ — sinh bằng: npx generator-jhipster@9.2.0 jdl jdl/genealogy.jdl --no-interactive';

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104004-1', 'jhipster', 'config/liquibase/changelog/20260716104004_added_entity_FamilyTree.xml', NOW(), 3, '9:7ff0e1c81c9f6db2fdf3ad0d0602f143', 'createTable tableName=family_tree', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104005_added_entity_Person.xml::20260716104005-1::jhipster
CREATE TABLE public.person (id BIGINT NOT NULL, code VARCHAR(255) NOT NULL, full_name VARCHAR(255) NOT NULL, ten_huy VARCHAR(255), ten_thuong VARCHAR(255), gender VARCHAR(255) NOT NULL, life_status VARCHAR(255) NOT NULL, generation INTEGER, lineage_path VARCHAR(255), birth_solar date, birth_lunar_json TEXT, death_solar date, death_lunar_json TEXT, grave_info TEXT, grave_lat DOUBLE PRECISION, grave_lng DOUBLE PRECISION, biography TEXT, notes TEXT, privacy VARCHAR(255), linked_user_id VARCHAR(255), version INTEGER, tree_id BIGINT, CONSTRAINT person_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104005-1', 'jhipster', 'config/liquibase/changelog/20260716104005_added_entity_Person.xml', NOW(), 4, '9:3a94d044c886fe5b443e0d42d7c07f65', 'createTable tableName=person', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104006_added_entity_FamilyUnion.xml::20260716104006-1::jhipster
CREATE TABLE public.family_union (id BIGINT NOT NULL, order_no INTEGER, marriage_info_json TEXT, tree_id BIGINT, CONSTRAINT family_union_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104006-1', 'jhipster', 'config/liquibase/changelog/20260716104006_added_entity_FamilyUnion.xml', NOW(), 5, '9:3b1a28a853159db9b3ef34bcad8d10ec', 'createTable tableName=family_union', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104007_added_entity_UnionMember.xml::20260716104007-1::jhipster
CREATE TABLE public.union_member (id BIGINT NOT NULL, role VARCHAR(255) NOT NULL, union_id BIGINT, person_id BIGINT, CONSTRAINT union_member_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104007-1', 'jhipster', 'config/liquibase/changelog/20260716104007_added_entity_UnionMember.xml', NOW(), 6, '9:086cb214c48d98a9522b12b56e203c50', 'createTable tableName=union_member', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104008_added_entity_UnionChild.xml::20260716104008-1::jhipster
CREATE TABLE public.union_child (id BIGINT NOT NULL, order_no INTEGER, union_id BIGINT, child_id BIGINT, CONSTRAINT union_child_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104008-1', 'jhipster', 'config/liquibase/changelog/20260716104008_added_entity_UnionChild.xml', NOW(), 7, '9:832fd69279ae639dac1defb4482a133d', 'createTable tableName=union_child', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104009_added_entity_Chapter.xml::20260716104009-1::jhipster
CREATE TABLE public.chapter (id BIGINT NOT NULL, kind VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, body_html TEXT, version INTEGER, tree_id BIGINT, CONSTRAINT chapter_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104009-1', 'jhipster', 'config/liquibase/changelog/20260716104009_added_entity_Chapter.xml', NOW(), 8, '9:f35957865d42e3678eae0b1195d04ea9', 'createTable tableName=chapter', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104010_added_entity_DeathAnniversary.xml::20260716104010-1::jhipster
CREATE TABLE public.death_anniversary (id BIGINT NOT NULL, lunar_day INTEGER NOT NULL, lunar_month INTEGER NOT NULL, leap_month BOOLEAN, can_chi VARCHAR(255), note VARCHAR(255), tree_id BIGINT, person_id BIGINT, CONSTRAINT death_anniversary_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104010-1', 'jhipster', 'config/liquibase/changelog/20260716104010_added_entity_DeathAnniversary.xml', NOW(), 9, '9:f08608100976daffc7217aeee15eb751', 'createTable tableName=death_anniversary', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104027_added_entity_CmsCategory.xml::20260716104027-1::jhipster
CREATE TABLE public.cms_category (id BIGINT NOT NULL, slug VARCHAR(255) NOT NULL, name VARCHAR(255) NOT NULL, layout VARCHAR(255), CONSTRAINT cms_category_pkey PRIMARY KEY (id), CONSTRAINT ux_cms_category__slug UNIQUE (slug));

COMMENT ON TABLE public.cms_category IS 'CMS + Media — npx generator-jhipster@9.2.0 jdl jdl/cms-media.jdl --no-interactive';

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104027-1', 'jhipster', 'config/liquibase/changelog/20260716104027_added_entity_CmsCategory.xml', NOW(), 10, '9:91398a3514e78f0f906c936b0548ae95', 'createTable tableName=cms_category', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104028_added_entity_CmsPost.xml::20260716104028-1::jhipster
CREATE TABLE public.cms_post (id BIGINT NOT NULL, slug VARCHAR(255) NOT NULL, title VARCHAR(255) NOT NULL, summary TEXT, body_html TEXT, status VARCHAR(255), published_at TIMESTAMP WITHOUT TIME ZONE, view_count BIGINT, author_name VARCHAR(255), category_id BIGINT, CONSTRAINT cms_post_pkey PRIMARY KEY (id), CONSTRAINT ux_cms_post__slug UNIQUE (slug));

ALTER TABLE public.cms_post ALTER COLUMN published_at DROP DEFAULT;

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104028-1', 'jhipster', 'config/liquibase/changelog/20260716104028_added_entity_CmsPost.xml', NOW(), 11, '9:d8e76c2a34a9a2811a0ce91824aad869', 'createTable tableName=cms_post; dropDefaultValue columnName=published_at, tableName=cms_post', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104029_added_entity_CmsComment.xml::20260716104029-1::jhipster
CREATE TABLE public.cms_comment (id BIGINT NOT NULL, author_name VARCHAR(255), body TEXT NOT NULL, status VARCHAR(255), created_at TIMESTAMP WITHOUT TIME ZONE, post_id BIGINT, CONSTRAINT cms_comment_pkey PRIMARY KEY (id));

ALTER TABLE public.cms_comment ALTER COLUMN created_at DROP DEFAULT;

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104029-1', 'jhipster', 'config/liquibase/changelog/20260716104029_added_entity_CmsComment.xml', NOW(), 12, '9:cd4f5bf2ea4a16c65c5742c1c235f927', 'createTable tableName=cms_comment; dropDefaultValue columnName=created_at, tableName=cms_comment', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104030_added_entity_MediaAlbum.xml::20260716104030-1::jhipster
CREATE TABLE public.media_album (id BIGINT NOT NULL, title VARCHAR(255) NOT NULL, description TEXT, cover_object_key VARCHAR(255), CONSTRAINT media_album_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104030-1', 'jhipster', 'config/liquibase/changelog/20260716104030_added_entity_MediaAlbum.xml', NOW(), 13, '9:e8fd32bc975b46b7dd705d338ecb8afa', 'createTable tableName=media_album', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104031_added_entity_MediaPhoto.xml::20260716104031-1::jhipster
CREATE TABLE public.media_photo (id BIGINT NOT NULL, object_key VARCHAR(255) NOT NULL, caption VARCHAR(255), blurhash VARCHAR(255), view_count BIGINT, album_id BIGINT, CONSTRAINT media_photo_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104031-1', 'jhipster', 'config/liquibase/changelog/20260716104031_added_entity_MediaPhoto.xml', NOW(), 14, '9:2e4afee1210727de2f0ec6321f065db9', 'createTable tableName=media_photo', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172018_added_entity_ChangeRequest.xml::20260716172018-1::jhipster
CREATE TABLE public.change_request (id BIGINT NOT NULL, requester_user_id VARCHAR(255) NOT NULL, entity_type VARCHAR(255) NOT NULL, summary VARCHAR(255), diff_json TEXT NOT NULL, status VARCHAR(255), reviewer_note TEXT, created_at TIMESTAMP WITHOUT TIME ZONE, reviewed_at TIMESTAMP WITHOUT TIME ZONE, tree_id BIGINT, person_id BIGINT, CONSTRAINT change_request_pkey PRIMARY KEY (id));

COMMENT ON TABLE public.change_request IS 'R2 modules — npx generator-jhipster@9.2.0 jdl jdl/r2-modules.jdl --no-interactive\nFamilyTree / Person đã generate ở genealogy.jdl → builtInEntity.';

ALTER TABLE public.change_request ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.change_request ALTER COLUMN reviewed_at DROP DEFAULT;

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172018-1', 'jhipster', 'config/liquibase/changelog/20260716172018_added_entity_ChangeRequest.xml', NOW(), 15, '9:48dca4aab7fe0e11c70befc36e4aa803', 'createTable tableName=change_request; dropDefaultValue columnName=created_at, tableName=change_request; dropDefaultValue columnName=reviewed_at, tableName=change_request', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172019_added_entity_DonationCampaign.xml::20260716172019-1::jhipster
CREATE TABLE public.donation_campaign (id BIGINT NOT NULL, title VARCHAR(255) NOT NULL, goal_amount DECIMAL(21, 2), raised_amount DECIMAL(21, 2), vietqr_payload TEXT, status VARCHAR(255), tree_id BIGINT, CONSTRAINT donation_campaign_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172019-1', 'jhipster', 'config/liquibase/changelog/20260716172019_added_entity_DonationCampaign.xml', NOW(), 16, '9:3df62f0e2b6f2175d328442ab08f81dc', 'createTable tableName=donation_campaign', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172020_added_entity_DonationContribution.xml::20260716172020-1::jhipster
CREATE TABLE public.donation_contribution (id BIGINT NOT NULL, donor_name VARCHAR(255) NOT NULL, amount DECIMAL(21, 2), kind VARCHAR(255), note TEXT, created_at TIMESTAMP WITHOUT TIME ZONE, campaign_id BIGINT, CONSTRAINT donation_contribution_pkey PRIMARY KEY (id));

ALTER TABLE public.donation_contribution ALTER COLUMN created_at DROP DEFAULT;

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172020-1', 'jhipster', 'config/liquibase/changelog/20260716172020_added_entity_DonationContribution.xml', NOW(), 17, '9:b21f0d1ff41dbda597f9be704af3d166', 'createTable tableName=donation_contribution; dropDefaultValue columnName=created_at, tableName=donation_contribution', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172021_added_entity_ClanEvent.xml::20260716172021-1::jhipster
CREATE TABLE public.clan_event (id BIGINT NOT NULL, title VARCHAR(255) NOT NULL, start_solar TIMESTAMP WITHOUT TIME ZONE, lunar_json TEXT, location VARCHAR(255), checklist_json TEXT, tree_id BIGINT, CONSTRAINT clan_event_pkey PRIMARY KEY (id));

ALTER TABLE public.clan_event ALTER COLUMN start_solar DROP DEFAULT;

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172021-1', 'jhipster', 'config/liquibase/changelog/20260716172021_added_entity_ClanEvent.xml', NOW(), 18, '9:3b9dc1b5823922e767fe3cbc3bd531b4', 'createTable tableName=clan_event; dropDefaultValue columnName=start_solar, tableName=clan_event', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172022_added_entity_EventRsvp.xml::20260716172022-1::jhipster
CREATE TABLE public.event_rsvp (id BIGINT NOT NULL, household_name VARCHAR(255) NOT NULL, headcount INTEGER, vehicles INTEGER, assignment VARCHAR(255), event_id BIGINT, CONSTRAINT event_rsvp_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172022-1', 'jhipster', 'config/liquibase/changelog/20260716172022_added_entity_EventRsvp.xml', NOW(), 19, '9:ab71da262ddee78c6b43151d361f6dd8', 'createTable tableName=event_rsvp', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172023_added_entity_AnniversarySubscription.xml::20260716172023-1::jhipster
CREATE TABLE public.anniversary_subscription (id BIGINT NOT NULL, user_id VARCHAR(255) NOT NULL, days_before INTEGER, channels VARCHAR(255), person_id BIGINT, CONSTRAINT anniversary_subscription_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172023-1', 'jhipster', 'config/liquibase/changelog/20260716172023_added_entity_AnniversarySubscription.xml', NOW(), 20, '9:597b772411bb3cb97eafb87661e9a953', 'createTable tableName=anniversary_subscription', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172024_added_entity_NotificationOutbox.xml::20260716172024-1::jhipster
CREATE TABLE public.notification_outbox (id BIGINT NOT NULL, channel VARCHAR(255) NOT NULL, payload_json TEXT NOT NULL, status VARCHAR(255), created_at TIMESTAMP WITHOUT TIME ZONE, sent_at TIMESTAMP WITHOUT TIME ZONE, CONSTRAINT notification_outbox_pkey PRIMARY KEY (id));

ALTER TABLE public.notification_outbox ALTER COLUMN created_at DROP DEFAULT;

ALTER TABLE public.notification_outbox ALTER COLUMN sent_at DROP DEFAULT;

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172024-1', 'jhipster', 'config/liquibase/changelog/20260716172024_added_entity_NotificationOutbox.xml', NOW(), 21, '9:ead978c460fada7c795b964fe7af5012', 'createTable tableName=notification_outbox; dropDefaultValue columnName=created_at, tableName=notification_outbox; dropDefaultValue columnName=sent_at, tableName=notification_outbox', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172025_added_entity_ScholarshipEntry.xml::20260716172025-1::jhipster
CREATE TABLE public.scholarship_entry (id BIGINT NOT NULL, person_name VARCHAR(255) NOT NULL, achievement VARCHAR(255) NOT NULL, year INTEGER, status VARCHAR(255), tree_id BIGINT, CONSTRAINT scholarship_entry_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172025-1', 'jhipster', 'config/liquibase/changelog/20260716172025_added_entity_ScholarshipEntry.xml', NOW(), 22, '9:f204fc0ef3bbb7b00073164d1f31e997', 'createTable tableName=scholarship_entry', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104005_added_entity_constraints_Person.xml::20260716104005-2::jhipster
ALTER TABLE public.person ADD CONSTRAINT fk_person__tree_id FOREIGN KEY (tree_id) REFERENCES public.family_tree (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104005-2', 'jhipster', 'config/liquibase/changelog/20260716104005_added_entity_constraints_Person.xml', NOW(), 23, '9:dfab7d581e4d2028f06d9c9b73538638', 'addForeignKeyConstraint baseTableName=person, constraintName=fk_person__tree_id, referencedTableName=family_tree', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104006_added_entity_constraints_FamilyUnion.xml::20260716104006-2::jhipster
ALTER TABLE public.family_union ADD CONSTRAINT fk_family_union__tree_id FOREIGN KEY (tree_id) REFERENCES public.family_tree (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104006-2', 'jhipster', 'config/liquibase/changelog/20260716104006_added_entity_constraints_FamilyUnion.xml', NOW(), 24, '9:dddb36a61dd973e6e1c0a1767f31c6fa', 'addForeignKeyConstraint baseTableName=family_union, constraintName=fk_family_union__tree_id, referencedTableName=family_tree', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104007_added_entity_constraints_UnionMember.xml::20260716104007-2::jhipster
ALTER TABLE public.union_member ADD CONSTRAINT fk_union_member__union_id FOREIGN KEY (union_id) REFERENCES public.family_union (id);

ALTER TABLE public.union_member ADD CONSTRAINT fk_union_member__person_id FOREIGN KEY (person_id) REFERENCES public.person (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104007-2', 'jhipster', 'config/liquibase/changelog/20260716104007_added_entity_constraints_UnionMember.xml', NOW(), 25, '9:0cbb9a05c820b6175e5052b72aed51fc', 'addForeignKeyConstraint baseTableName=union_member, constraintName=fk_union_member__union_id, referencedTableName=family_union; addForeignKeyConstraint baseTableName=union_member, constraintName=fk_union_member__person_id, referencedTableName=person', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104008_added_entity_constraints_UnionChild.xml::20260716104008-2::jhipster
ALTER TABLE public.union_child ADD CONSTRAINT fk_union_child__union_id FOREIGN KEY (union_id) REFERENCES public.family_union (id);

ALTER TABLE public.union_child ADD CONSTRAINT fk_union_child__child_id FOREIGN KEY (child_id) REFERENCES public.person (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104008-2', 'jhipster', 'config/liquibase/changelog/20260716104008_added_entity_constraints_UnionChild.xml', NOW(), 26, '9:ea119e0287b8eb679e98f3112c0af6a0', 'addForeignKeyConstraint baseTableName=union_child, constraintName=fk_union_child__union_id, referencedTableName=family_union; addForeignKeyConstraint baseTableName=union_child, constraintName=fk_union_child__child_id, referencedTableName=person', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104009_added_entity_constraints_Chapter.xml::20260716104009-2::jhipster
ALTER TABLE public.chapter ADD CONSTRAINT fk_chapter__tree_id FOREIGN KEY (tree_id) REFERENCES public.family_tree (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104009-2', 'jhipster', 'config/liquibase/changelog/20260716104009_added_entity_constraints_Chapter.xml', NOW(), 27, '9:b334376cf3c74a508c842cae31490b74', 'addForeignKeyConstraint baseTableName=chapter, constraintName=fk_chapter__tree_id, referencedTableName=family_tree', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104010_added_entity_constraints_DeathAnniversary.xml::20260716104010-2::jhipster
ALTER TABLE public.death_anniversary ADD CONSTRAINT fk_death_anniversary__tree_id FOREIGN KEY (tree_id) REFERENCES public.family_tree (id);

ALTER TABLE public.death_anniversary ADD CONSTRAINT fk_death_anniversary__person_id FOREIGN KEY (person_id) REFERENCES public.person (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104010-2', 'jhipster', 'config/liquibase/changelog/20260716104010_added_entity_constraints_DeathAnniversary.xml', NOW(), 28, '9:336ef1d0d6bcc1c15a897948785b83e4', 'addForeignKeyConstraint baseTableName=death_anniversary, constraintName=fk_death_anniversary__tree_id, referencedTableName=family_tree; addForeignKeyConstraint baseTableName=death_anniversary, constraintName=fk_death_anniversary__person_id, refere...', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104028_added_entity_constraints_CmsPost.xml::20260716104028-2::jhipster
ALTER TABLE public.cms_post ADD CONSTRAINT fk_cms_post__category_id FOREIGN KEY (category_id) REFERENCES public.cms_category (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104028-2', 'jhipster', 'config/liquibase/changelog/20260716104028_added_entity_constraints_CmsPost.xml', NOW(), 29, '9:7086bb4440a1c6208a01b92c6a084786', 'addForeignKeyConstraint baseTableName=cms_post, constraintName=fk_cms_post__category_id, referencedTableName=cms_category', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104029_added_entity_constraints_CmsComment.xml::20260716104029-2::jhipster
ALTER TABLE public.cms_comment ADD CONSTRAINT fk_cms_comment__post_id FOREIGN KEY (post_id) REFERENCES public.cms_post (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104029-2', 'jhipster', 'config/liquibase/changelog/20260716104029_added_entity_constraints_CmsComment.xml', NOW(), 30, '9:07f84e21b666f13925ce37fdfb5aad50', 'addForeignKeyConstraint baseTableName=cms_comment, constraintName=fk_cms_comment__post_id, referencedTableName=cms_post', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716104031_added_entity_constraints_MediaPhoto.xml::20260716104031-2::jhipster
ALTER TABLE public.media_photo ADD CONSTRAINT fk_media_photo__album_id FOREIGN KEY (album_id) REFERENCES public.media_album (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716104031-2', 'jhipster', 'config/liquibase/changelog/20260716104031_added_entity_constraints_MediaPhoto.xml', NOW(), 31, '9:360853f728e5a03f4ea1d128c1a6a516', 'addForeignKeyConstraint baseTableName=media_photo, constraintName=fk_media_photo__album_id, referencedTableName=media_album', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172018_added_entity_constraints_ChangeRequest.xml::20260716172018-2::jhipster
ALTER TABLE public.change_request ADD CONSTRAINT fk_change_request__tree_id FOREIGN KEY (tree_id) REFERENCES public.family_tree (id);

ALTER TABLE public.change_request ADD CONSTRAINT fk_change_request__person_id FOREIGN KEY (person_id) REFERENCES public.person (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172018-2', 'jhipster', 'config/liquibase/changelog/20260716172018_added_entity_constraints_ChangeRequest.xml', NOW(), 32, '9:45b5404786d0461d238316d218616490', 'addForeignKeyConstraint baseTableName=change_request, constraintName=fk_change_request__tree_id, referencedTableName=family_tree; addForeignKeyConstraint baseTableName=change_request, constraintName=fk_change_request__person_id, referencedTableNam...', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172019_added_entity_constraints_DonationCampaign.xml::20260716172019-2::jhipster
ALTER TABLE public.donation_campaign ADD CONSTRAINT fk_donation_campaign__tree_id FOREIGN KEY (tree_id) REFERENCES public.family_tree (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172019-2', 'jhipster', 'config/liquibase/changelog/20260716172019_added_entity_constraints_DonationCampaign.xml', NOW(), 33, '9:958deda478d1dac703c05643ccc072fe', 'addForeignKeyConstraint baseTableName=donation_campaign, constraintName=fk_donation_campaign__tree_id, referencedTableName=family_tree', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172020_added_entity_constraints_DonationContribution.xml::20260716172020-2::jhipster
ALTER TABLE public.donation_contribution ADD CONSTRAINT fk_donation_contribution__campaign_id FOREIGN KEY (campaign_id) REFERENCES public.donation_campaign (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172020-2', 'jhipster', 'config/liquibase/changelog/20260716172020_added_entity_constraints_DonationContribution.xml', NOW(), 34, '9:fe4db9ea50c308382154591764a103bd', 'addForeignKeyConstraint baseTableName=donation_contribution, constraintName=fk_donation_contribution__campaign_id, referencedTableName=donation_campaign', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172021_added_entity_constraints_ClanEvent.xml::20260716172021-2::jhipster
ALTER TABLE public.clan_event ADD CONSTRAINT fk_clan_event__tree_id FOREIGN KEY (tree_id) REFERENCES public.family_tree (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172021-2', 'jhipster', 'config/liquibase/changelog/20260716172021_added_entity_constraints_ClanEvent.xml', NOW(), 35, '9:6bd07d9daede24accbbc624e4659e1c1', 'addForeignKeyConstraint baseTableName=clan_event, constraintName=fk_clan_event__tree_id, referencedTableName=family_tree', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172022_added_entity_constraints_EventRsvp.xml::20260716172022-2::jhipster
ALTER TABLE public.event_rsvp ADD CONSTRAINT fk_event_rsvp__event_id FOREIGN KEY (event_id) REFERENCES public.clan_event (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172022-2', 'jhipster', 'config/liquibase/changelog/20260716172022_added_entity_constraints_EventRsvp.xml', NOW(), 36, '9:1d55901c6d25483e33b35ec47a93e898', 'addForeignKeyConstraint baseTableName=event_rsvp, constraintName=fk_event_rsvp__event_id, referencedTableName=clan_event', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172023_added_entity_constraints_AnniversarySubscription.xml::20260716172023-2::jhipster
ALTER TABLE public.anniversary_subscription ADD CONSTRAINT fk_anniversary_subscription__person_id FOREIGN KEY (person_id) REFERENCES public.person (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172023-2', 'jhipster', 'config/liquibase/changelog/20260716172023_added_entity_constraints_AnniversarySubscription.xml', NOW(), 37, '9:6f1a1dbe9dece58ae8efaa5dd6badbf7', 'addForeignKeyConstraint baseTableName=anniversary_subscription, constraintName=fk_anniversary_subscription__person_id, referencedTableName=person', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716172025_added_entity_constraints_ScholarshipEntry.xml::20260716172025-2::jhipster
ALTER TABLE public.scholarship_entry ADD CONSTRAINT fk_scholarship_entry__tree_id FOREIGN KEY (tree_id) REFERENCES public.family_tree (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716172025-2', 'jhipster', 'config/liquibase/changelog/20260716172025_added_entity_constraints_ScholarshipEntry.xml', NOW(), 38, '9:8a6ad51be7c4e71da9969619a84bbd63', 'addForeignKeyConstraint baseTableName=scholarship_entry, constraintName=fk_scholarship_entry__tree_id, referencedTableName=family_tree', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260716224500_person_search_unaccent.xml::20260716224500-1::giapha
-- Enable unaccent for Vietnamese accent-insensitive person suggest
CREATE EXTENSION IF NOT EXISTS unaccent;

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260716224500-1', 'giapha', 'config/liquibase/changelog/20260716224500_person_search_unaccent.xml', NOW(), 39, '9:be538402f77f6d8d646fc2ca6f569e46', 'sql', 'Enable unaccent for Vietnamese accent-insensitive person suggest', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260717010000_death_anniversary_person_unique.xml::20260717010000-1::giapha
DELETE FROM death_anniversary a
            USING death_anniversary b
            WHERE a.person_id IS NOT NULL
              AND a.person_id = b.person_id
              AND a.id < b.id;

ALTER TABLE public.death_anniversary ADD CONSTRAINT ux_death_anniversary__person_id UNIQUE (person_id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260717010000-1', 'giapha', 'config/liquibase/changelog/20260717010000_death_anniversary_person_unique.xml', NOW(), 40, '9:d754dcdc022d250b68979681fab03343', 'sql; sql; addUniqueConstraint constraintName=ux_death_anniversary__person_id, tableName=death_anniversary', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260717100000_system_module_audit.xml::20260717100000-1::giapha
CREATE TABLE public.module_registry (code VARCHAR(64) NOT NULL, enabled BOOLEAN DEFAULT TRUE NOT NULL, config_json TEXT, CONSTRAINT module_registry_pkey PRIMARY KEY (code));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260717100000-1', 'giapha', 'config/liquibase/changelog/20260717100000_system_module_audit.xml', NOW(), 41, '9:f7de8afd3619f07995619028961384c5', 'createTable tableName=module_registry', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260717100000_system_module_audit.xml::20260717100000-2::giapha
CREATE TABLE public.audit_log (id BIGINT NOT NULL, actor VARCHAR(128), action VARCHAR(64) NOT NULL, entity_type VARCHAR(64), entity_id VARCHAR(64), detail_json TEXT, created_at TIMESTAMP WITHOUT TIME ZONE, CONSTRAINT audit_log_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260717100000-2', 'giapha', 'config/liquibase/changelog/20260717100000_system_module_audit.xml', NOW(), 42, '9:93e5473ae6bdd8a83553336e269a1df6', 'createTable tableName=audit_log', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260718100000_expand_scholarship_entry.xml::20260718100000-1::giapha
ALTER TABLE public.scholarship_entry ADD person_code VARCHAR(255);

ALTER TABLE public.scholarship_entry ADD level VARCHAR(64);

ALTER TABLE public.scholarship_entry ADD school_or_field VARCHAR(255);

ALTER TABLE public.scholarship_entry ADD medal_note VARCHAR(512);

ALTER TABLE public.scholarship_entry ADD lineage_note VARCHAR(512);

ALTER TABLE public.scholarship_entry ADD review_note VARCHAR(1024);

ALTER TABLE public.scholarship_entry ADD award_amount DECIMAL(21, 2);

ALTER TABLE public.scholarship_entry ADD awarded_at TIMESTAMP WITHOUT TIME ZONE;

ALTER TABLE public.scholarship_entry ADD person_id BIGINT;

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260718100000-1', 'giapha', 'config/liquibase/changelog/20260718100000_expand_scholarship_entry.xml', NOW(), 43, '9:d4ad4c975d3702b0c972f8a15cb317e0', 'addColumn tableName=scholarship_entry', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260718100000_expand_scholarship_entry.xml::20260718100000-2::giapha
ALTER TABLE public.scholarship_entry ADD CONSTRAINT fk_scholarship_entry__person_id FOREIGN KEY (person_id) REFERENCES public.person (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260718100000-2', 'giapha', 'config/liquibase/changelog/20260718100000_expand_scholarship_entry.xml', NOW(), 44, '9:3ea895e907de4ee6b2b14aff903eb680', 'addForeignKeyConstraint baseTableName=scholarship_entry, constraintName=fk_scholarship_entry__person_id, referencedTableName=person', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260718120000_donation_campaign_purpose.xml::20260718120000-1::giapha
ALTER TABLE public.donation_campaign ADD purpose VARCHAR(64) DEFAULT 'general';

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260718120000-1', 'giapha', 'config/liquibase/changelog/20260718120000_donation_campaign_purpose.xml', NOW(), 45, '9:6328384c300fa8384808cc9b8a2d80a4', 'addColumn tableName=donation_campaign', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260718120000_donation_campaign_purpose.xml::20260718120000-2::giapha
UPDATE public.donation_campaign SET purpose = 'general' WHERE purpose IS NULL OR purpose = '';

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260718120000-2', 'giapha', 'config/liquibase/changelog/20260718120000_donation_campaign_purpose.xml', NOW(), 46, '9:089be51c3addb55b1f743ec4dc854a88', 'update tableName=donation_campaign', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260719010000_scholarship_award_round.xml::20260719010000-1::giapha
CREATE TABLE public.scholarship_award_round (id BIGINT NOT NULL, title VARCHAR(255) NOT NULL, code VARCHAR(64), open_from TIMESTAMP WITHOUT TIME ZONE, open_to TIMESTAMP WITHOUT TIME ZONE, default_amount DECIMAL(21, 2), status VARCHAR(32), note VARCHAR(1024), created_at TIMESTAMP WITHOUT TIME ZONE, closed_at TIMESTAMP WITHOUT TIME ZONE, created_by VARCHAR(255), closed_by VARCHAR(255), tree_id BIGINT, fund_campaign_id BIGINT, honor_event_id BIGINT, CONSTRAINT scholarship_award_round_pkey PRIMARY KEY (id));

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260719010000-1', 'giapha', 'config/liquibase/changelog/20260719010000_scholarship_award_round.xml', NOW(), 47, '9:05c4e985db5c83cdb2ecd095729dd4b9', 'createTable tableName=scholarship_award_round', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260719010000_scholarship_award_round.xml::20260719010000-2::giapha
ALTER TABLE public.scholarship_award_round ADD CONSTRAINT fk_sch_award_round__tree FOREIGN KEY (tree_id) REFERENCES public.family_tree (id);

ALTER TABLE public.scholarship_award_round ADD CONSTRAINT fk_sch_award_round__fund FOREIGN KEY (fund_campaign_id) REFERENCES public.donation_campaign (id);

ALTER TABLE public.scholarship_award_round ADD CONSTRAINT fk_sch_award_round__event FOREIGN KEY (honor_event_id) REFERENCES public.clan_event (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260719010000-2', 'giapha', 'config/liquibase/changelog/20260719010000_scholarship_award_round.xml', NOW(), 48, '9:19077c4cded669931115ae2de0c87f2a', 'addForeignKeyConstraint baseTableName=scholarship_award_round, constraintName=fk_sch_award_round__tree, referencedTableName=family_tree; addForeignKeyConstraint baseTableName=scholarship_award_round, constraintName=fk_sch_award_round__fund, refere...', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260719010000_scholarship_award_round.xml::20260719010000-3::giapha
CREATE TABLE public.scholarship_award (id BIGINT NOT NULL, amount DECIMAL(21, 2) NOT NULL, awarded_at TIMESTAMP WITHOUT TIME ZONE, awarded_by VARCHAR(255), note VARCHAR(1024), round_id BIGINT, entry_id BIGINT, CONSTRAINT scholarship_award_pkey PRIMARY KEY (id));

ALTER TABLE public.scholarship_award ADD CONSTRAINT ux_sch_award__round_entry UNIQUE (round_id, entry_id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260719010000-3', 'giapha', 'config/liquibase/changelog/20260719010000_scholarship_award_round.xml', NOW(), 49, '9:dc93228a2d3d7667668fee66a068960a', 'createTable tableName=scholarship_award; addUniqueConstraint constraintName=ux_sch_award__round_entry, tableName=scholarship_award', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260719010000_scholarship_award_round.xml::20260719010000-4::giapha
ALTER TABLE public.scholarship_award ADD CONSTRAINT fk_sch_award__round FOREIGN KEY (round_id) REFERENCES public.scholarship_award_round (id);

ALTER TABLE public.scholarship_award ADD CONSTRAINT fk_sch_award__entry FOREIGN KEY (entry_id) REFERENCES public.scholarship_entry (id);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260719010000-4', 'giapha', 'config/liquibase/changelog/20260719010000_scholarship_award_round.xml', NOW(), 50, '9:7e6794c7cc4d8b50d1f0f261ca25d9ce', 'addForeignKeyConstraint baseTableName=scholarship_award, constraintName=fk_sch_award__round, referencedTableName=scholarship_award_round; addForeignKeyConstraint baseTableName=scholarship_award, constraintName=fk_sch_award__entry, referencedTableN...', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260719020000_cms_category_portal_link.xml::20260719020000-1::giapha
ALTER TABLE public.cms_category ADD sort_order INTEGER DEFAULT 100;

ALTER TABLE public.cms_category ADD visible_on_nav BOOLEAN DEFAULT TRUE;

ALTER TABLE public.cms_category ADD description VARCHAR(1024);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260719020000-1', 'giapha', 'config/liquibase/changelog/20260719020000_cms_category_portal_link.xml', NOW(), 51, '9:f5fea37d5f83de15575d5d0ba683b45a', 'addColumn tableName=cms_category', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260719020000_cms_category_portal_link.xml::20260719020000-2::giapha
ALTER TABLE public.cms_post ADD cover_object_key VARCHAR(512);

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260719020000-2', 'giapha', 'config/liquibase/changelog/20260719020000_cms_category_portal_link.xml', NOW(), 52, '9:0dccba431f9074e3202f3b3e72f10708', 'addColumn tableName=cms_post', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Changeset config/liquibase/changelog/20260719020000_cms_category_portal_link.xml::20260719020000-3::giapha
INSERT INTO cms_category (id, slug, name, layout, sort_order, visible_on_nav, description)
            SELECT nextval('sequence_generator'), 'thong-tin-dong-ho', 'Thông tin dòng họ', 'article', 10, true,
                   'Từ đường, lăng mộ, lễ nghi và hội đồng gia tộc'
            WHERE NOT EXISTS (SELECT 1 FROM cms_category WHERE slug = 'thong-tin-dong-ho');

INSERT INTO cms_category (id, slug, name, layout, sort_order, visible_on_nav, description)
            SELECT nextval('sequence_generator'), 'hoat-dong-dong-ho', 'Hoạt động dòng họ', 'article', 20, true,
                   'Sự kiện tôn tạo, họp họ và sinh hoạt cộng đồng'
            WHERE NOT EXISTS (SELECT 1 FROM cms_category WHERE slug = 'hoat-dong-dong-ho');

INSERT INTO cms_category (id, slug, name, layout, sort_order, visible_on_nav, description)
            SELECT nextval('sequence_generator'), 'thong-bao', 'Thông báo', 'notice', 30, true,
                   'Văn bản thông báo chính thức của hội đồng gia tộc'
            WHERE NOT EXISTS (SELECT 1 FROM cms_category WHERE slug = 'thong-bao');

INSERT INTO cms_category (id, slug, name, layout, sort_order, visible_on_nav, description)
            SELECT nextval('sequence_generator'), 'ho-hoang-bon-phuong', 'Họ Hoàng bốn phương', 'article', 40, true,
                   'Tin các chi / vùng họ Hoàng – Huỳnh'
            WHERE NOT EXISTS (SELECT 1 FROM cms_category WHERE slug = 'ho-hoang-bon-phuong');

INSERT INTO cms_category (id, slug, name, layout, sort_order, visible_on_nav, description)
            SELECT nextval('sequence_generator'), 'danh-nhan-guong-sang-dong-ho', 'Danh nhân – Gương sáng', 'portrait', 50, true,
                   'Chân dung nhân vật tiêu biểu của dòng họ'
            WHERE NOT EXISTS (SELECT 1 FROM cms_category WHERE slug = 'danh-nhan-guong-sang-dong-ho');

INSERT INTO cms_category (id, slug, name, layout, sort_order, visible_on_nav, description)
            SELECT nextval('sequence_generator'), 'thu-vien-tu-lieu', 'Thư viện – Tư liệu', 'document', 60, true,
                   'Bài sớ, tư liệu lịch sử và văn hóa'
            WHERE NOT EXISTS (SELECT 1 FROM cms_category WHERE slug = 'thu-vien-tu-lieu');

UPDATE cms_category SET
              name = 'Thông tin dòng họ',
              layout = COALESCE(layout, 'article'),
              sort_order = COALESCE(sort_order, 10),
              visible_on_nav = COALESCE(visible_on_nav, true),
              description = COALESCE(description, 'Từ đường, lăng mộ, lễ nghi và hội đồng gia tộc')
            WHERE slug = 'thong-tin-dong-ho';

UPDATE cms_category SET
              name = 'Hoạt động dòng họ',
              layout = COALESCE(layout, 'article'),
              sort_order = COALESCE(sort_order, 20),
              visible_on_nav = COALESCE(visible_on_nav, true),
              description = COALESCE(description, 'Sự kiện tôn tạo, họp họ và sinh hoạt cộng đồng')
            WHERE slug = 'hoat-dong-dong-ho';

UPDATE cms_category SET
              name = 'Thông báo',
              layout = COALESCE(layout, 'notice'),
              sort_order = COALESCE(sort_order, 30),
              visible_on_nav = COALESCE(visible_on_nav, true),
              description = COALESCE(description, 'Văn bản thông báo chính thức của hội đồng gia tộc')
            WHERE slug = 'thong-bao';

UPDATE cms_category SET
              name = 'Họ Hoàng bốn phương',
              layout = COALESCE(layout, 'article'),
              sort_order = COALESCE(sort_order, 40),
              visible_on_nav = COALESCE(visible_on_nav, true),
              description = COALESCE(description, 'Tin các chi / vùng họ Hoàng – Huỳnh')
            WHERE slug = 'ho-hoang-bon-phuong';

UPDATE cms_category SET
              name = 'Danh nhân – Gương sáng',
              layout = COALESCE(layout, 'portrait'),
              sort_order = COALESCE(sort_order, 50),
              visible_on_nav = COALESCE(visible_on_nav, true),
              description = COALESCE(description, 'Chân dung nhân vật tiêu biểu của dòng họ')
            WHERE slug = 'danh-nhan-guong-sang-dong-ho';

UPDATE cms_category SET
              name = 'Thư viện – Tư liệu',
              layout = COALESCE(layout, 'document'),
              sort_order = COALESCE(sort_order, 60),
              visible_on_nav = COALESCE(visible_on_nav, true),
              description = COALESCE(description, 'Bài sớ, tư liệu lịch sử và văn hóa')
            WHERE slug = 'thu-vien-tu-lieu';

INSERT INTO public.databasechangelog (ID, AUTHOR, FILENAME, DATEEXECUTED, ORDEREXECUTED, MD5SUM, DESCRIPTION, COMMENTS, EXECTYPE, CONTEXTS, LABELS, LIQUIBASE, DEPLOYMENT_ID) VALUES ('20260719020000-3', 'giapha', 'config/liquibase/changelog/20260719020000_cms_category_portal_link.xml', NOW(), 53, '9:c1a7668b5850f15e8f7e6df14a6c39e1', 'sql', '', 'EXECUTED', NULL, NULL, '5.0.3', '4628408026');

-- Release Database Lock
UPDATE public.databasechangeloglock SET LOCKED = FALSE, LOCKEDBY = NULL, LOCKGRANTED = NULL WHERE ID = 1;

