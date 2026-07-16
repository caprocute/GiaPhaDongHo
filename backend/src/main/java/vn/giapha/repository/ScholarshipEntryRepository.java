package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.ScholarshipEntry;

/**
 * Spring Data JPA repository for the ScholarshipEntry entity.
 */
@Repository
public interface ScholarshipEntryRepository extends JpaRepository<ScholarshipEntry, Long> {
    default Optional<ScholarshipEntry> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ScholarshipEntry> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ScholarshipEntry> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select scholarshipEntry from ScholarshipEntry scholarshipEntry left join fetch scholarshipEntry.tree",
        countQuery = "select count(scholarshipEntry) from ScholarshipEntry scholarshipEntry"
    )
    Page<ScholarshipEntry> findAllWithToOneRelationships(Pageable pageable);

    @Query("select scholarshipEntry from ScholarshipEntry scholarshipEntry left join fetch scholarshipEntry.tree")
    List<ScholarshipEntry> findAllWithToOneRelationships();

    @Query(
        "select scholarshipEntry from ScholarshipEntry scholarshipEntry left join fetch scholarshipEntry.tree where scholarshipEntry.id =:id"
    )
    Optional<ScholarshipEntry> findOneWithToOneRelationships(@Param("id") Long id);
}
