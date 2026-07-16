package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.DeathAnniversary;

/**
 * Spring Data JPA repository for the DeathAnniversary entity.
 */
@Repository
public interface DeathAnniversaryRepository extends JpaRepository<DeathAnniversary, Long> {
    default Optional<DeathAnniversary> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<DeathAnniversary> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<DeathAnniversary> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select deathAnniversary from DeathAnniversary deathAnniversary left join fetch deathAnniversary.tree left join fetch deathAnniversary.person",
        countQuery = "select count(deathAnniversary) from DeathAnniversary deathAnniversary"
    )
    Page<DeathAnniversary> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select deathAnniversary from DeathAnniversary deathAnniversary left join fetch deathAnniversary.tree left join fetch deathAnniversary.person"
    )
    List<DeathAnniversary> findAllWithToOneRelationships();

    @Query(
        "select deathAnniversary from DeathAnniversary deathAnniversary left join fetch deathAnniversary.tree left join fetch deathAnniversary.person where deathAnniversary.id =:id"
    )
    Optional<DeathAnniversary> findOneWithToOneRelationships(@Param("id") Long id);

    @Query(
        """
        select da from DeathAnniversary da
        left join fetch da.tree t
        left join fetch da.person
        where t.slug = :slug
          and (:lunarMonth is null or da.lunarMonth = :lunarMonth)
        order by da.lunarDay asc, da.id asc
        """
    )
    List<DeathAnniversary> findByTreeSlugAndOptionalMonth(
        @Param("slug") String slug,
        @Param("lunarMonth") Integer lunarMonth
    );
}
