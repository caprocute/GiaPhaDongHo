package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.FamilyUnion;

/**
 * Spring Data JPA repository for the FamilyUnion entity.
 */
@Repository
public interface FamilyUnionRepository extends JpaRepository<FamilyUnion, Long> {
    default Optional<FamilyUnion> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<FamilyUnion> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<FamilyUnion> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select familyUnion from FamilyUnion familyUnion left join fetch familyUnion.tree",
        countQuery = "select count(familyUnion) from FamilyUnion familyUnion"
    )
    Page<FamilyUnion> findAllWithToOneRelationships(Pageable pageable);

    @Query("select familyUnion from FamilyUnion familyUnion left join fetch familyUnion.tree")
    List<FamilyUnion> findAllWithToOneRelationships();

    @Query("select familyUnion from FamilyUnion familyUnion left join fetch familyUnion.tree where familyUnion.id =:id")
    Optional<FamilyUnion> findOneWithToOneRelationships(@Param("id") Long id);
}
