package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.UnionChild;

/**
 * Spring Data JPA repository for the UnionChild entity.
 */
@Repository
public interface UnionChildRepository extends JpaRepository<UnionChild, Long> {
    default Optional<UnionChild> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<UnionChild> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<UnionChild> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select unionChild from UnionChild unionChild left join fetch unionChild.child",
        countQuery = "select count(unionChild) from UnionChild unionChild"
    )
    Page<UnionChild> findAllWithToOneRelationships(Pageable pageable);

    @Query("select unionChild from UnionChild unionChild left join fetch unionChild.child")
    List<UnionChild> findAllWithToOneRelationships();

    @Query("select unionChild from UnionChild unionChild left join fetch unionChild.child where unionChild.id =:id")
    Optional<UnionChild> findOneWithToOneRelationships(@Param("id") Long id);

    @Query(
        """
        select uc from UnionChild uc
        left join fetch uc.child c
        left join fetch uc.union u
        left join c.tree t
        where t.slug = :slug
        """
    )
    List<UnionChild> findByTreeSlug(@Param("slug") String slug);
}
