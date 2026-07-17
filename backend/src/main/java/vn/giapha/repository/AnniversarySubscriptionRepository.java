package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.AnniversarySubscription;

/**
 * Spring Data JPA repository for the AnniversarySubscription entity.
 */
@Repository
public interface AnniversarySubscriptionRepository extends JpaRepository<AnniversarySubscription, Long> {
    default Optional<AnniversarySubscription> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<AnniversarySubscription> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<AnniversarySubscription> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select anniversarySubscription from AnniversarySubscription anniversarySubscription left join fetch anniversarySubscription.person person left join fetch person.tree",
        countQuery = "select count(anniversarySubscription) from AnniversarySubscription anniversarySubscription"
    )
    Page<AnniversarySubscription> findAllWithToOneRelationships(Pageable pageable);

    @Query(
        "select anniversarySubscription from AnniversarySubscription anniversarySubscription left join fetch anniversarySubscription.person person left join fetch person.tree"
    )
    List<AnniversarySubscription> findAllWithToOneRelationships();

    @Query(
        "select anniversarySubscription from AnniversarySubscription anniversarySubscription left join fetch anniversarySubscription.person person left join fetch person.tree where anniversarySubscription.id =:id"
    )
    Optional<AnniversarySubscription> findOneWithToOneRelationships(@Param("id") Long id);

    Optional<AnniversarySubscription> findByUserIdAndPerson_Id(String userId, Long personId);

    @Query(
        """
        select s from AnniversarySubscription s
        left join fetch s.person p
        left join fetch p.tree t
        where s.userId = :userId
          and t.slug = :slug
        order by s.id desc
        """
    )
    List<AnniversarySubscription> findByUserIdAndTreeSlug(@Param("userId") String userId, @Param("slug") String slug);
}
