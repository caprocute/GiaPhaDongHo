package vn.giapha.genealogy.api;

import vn.giapha.domain.Person;

/**
 * Đồng bộ DeathAnniversary khi ghi Person (R1.9 / FR-05.3).
 */
public interface DeathAnniversarySync {
    /**
     * Upsert giỗ nếu người đã mất và có ngày mất; xóa giỗ nếu còn sống.
     */
    void syncFromPerson(Person person);

    /** Xóa bản ghi giỗ gắn person (trước khi xóa Person). */
    void removeForPerson(Long personId);
}
