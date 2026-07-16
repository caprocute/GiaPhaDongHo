package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.UnionMember;

/**
 * Spring Data JPA repository for the UnionMember entity.
 */
@Repository
public interface UnionMemberRepository extends JpaRepository<UnionMember, Long> {
    default Optional<UnionMember> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<UnionMember> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<UnionMember> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select unionMember from UnionMember unionMember left join fetch unionMember.person",
        countQuery = "select count(unionMember) from UnionMember unionMember"
    )
    Page<UnionMember> findAllWithToOneRelationships(Pageable pageable);

    @Query("select unionMember from UnionMember unionMember left join fetch unionMember.person")
    List<UnionMember> findAllWithToOneRelationships();

    @Query("select unionMember from UnionMember unionMember left join fetch unionMember.person where unionMember.id =:id")
    Optional<UnionMember> findOneWithToOneRelationships(@Param("id") Long id);
}
