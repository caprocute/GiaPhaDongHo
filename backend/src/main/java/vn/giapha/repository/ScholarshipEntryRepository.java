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
        value = "select scholarshipEntry from ScholarshipEntry scholarshipEntry left join fetch scholarshipEntry.tree left join fetch scholarshipEntry.person",
        countQuery = "select count(scholarshipEntry) from ScholarshipEntry scholarshipEntry"
    )
    Page<ScholarshipEntry> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select scholarshipEntry from ScholarshipEntry scholarshipEntry left join fetch scholarshipEntry.tree left join fetch scholarshipEntry.person"
    )
    List<ScholarshipEntry> findAllWithToOneRelationships();

    @Query(
        "select scholarshipEntry from ScholarshipEntry scholarshipEntry left join fetch scholarshipEntry.tree left join fetch scholarshipEntry.person where scholarshipEntry.id =:id"
    )
    Optional<ScholarshipEntry> findOneWithToOneRelationships(@Param("id") Long id);

    @Query(
        """
        select s from ScholarshipEntry s
        left join fetch s.tree t
        left join fetch s.person
        where t.slug = :slug
          and lower(s.status) = lower(:status)
        order by s.year desc nulls last, s.id desc
        """
    )
    List<ScholarshipEntry> findByTreeSlugAndStatus(@Param("slug") String slug, @Param("status") String status);

    @Query(
        """
        select s from ScholarshipEntry s
        left join fetch s.tree t
        left join fetch s.person
        where t.slug = :slug
        order by s.id desc
        """
    )
    List<ScholarshipEntry> findByTreeSlug(@Param("slug") String slug);
}
