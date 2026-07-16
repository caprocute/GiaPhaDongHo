package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.ChangeRequest;

/**
 * Spring Data JPA repository for the ChangeRequest entity.
 */
@Repository
public interface ChangeRequestRepository extends JpaRepository<ChangeRequest, Long> {
    default Optional<ChangeRequest> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ChangeRequest> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ChangeRequest> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select changeRequest from ChangeRequest changeRequest left join fetch changeRequest.tree left join fetch changeRequest.person",
        countQuery = "select count(changeRequest) from ChangeRequest changeRequest"
    )
    Page<ChangeRequest> findAllWithToOneRelationships(Pageable pageable);

    @Query("select changeRequest from ChangeRequest changeRequest left join fetch changeRequest.tree left join fetch changeRequest.person")
    List<ChangeRequest> findAllWithToOneRelationships();

    @Query(
        "select changeRequest from ChangeRequest changeRequest left join fetch changeRequest.tree left join fetch changeRequest.person where changeRequest.id =:id"
    )
    Optional<ChangeRequest> findOneWithToOneRelationships(@Param("id") Long id);

    @Query(
        """
        select cr from ChangeRequest cr
        left join fetch cr.tree t
        left join fetch cr.person
        where t.slug = :slug
          and (:status is null or lower(cr.status) = lower(:status))
        order by cr.id desc
        """
    )
    List<ChangeRequest> findByTreeSlugAndOptionalStatus(
        @Param("slug") String slug,
        @Param("status") String status
    );
}
