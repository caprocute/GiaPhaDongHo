package vn.giapha.genealogy.api;

/**
 * Lọc PII người còn sống theo NĐ 13/2023 / TK-10 §3.
 */
public interface PersonPrivacyFilter {
    PersonPrivacyModel apply(PersonPrivacyModel source, ViewerContext viewer);
}
