package vn.giapha.genealogy.events;

/**
 * Ngày giỗ đã upsert từ hồ sơ người mất — TK-01 / TK-08 (GEN → NOTI).
 */
public record DeathAnniversaryUpserted(
    Long anniversaryId,
    Long personId,
    String treeSlug,
    int lunarDay,
    int lunarMonth,
    boolean leapMonth
) {}
