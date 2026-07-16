package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.CmsComment;

/**
 * Spring Data JPA repository for the CmsComment entity.
 */
@Repository
public interface CmsCommentRepository extends JpaRepository<CmsComment, Long> {
    default Optional<CmsComment> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<CmsComment> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<CmsComment> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select cmsComment from CmsComment cmsComment left join fetch cmsComment.post",
        countQuery = "select count(cmsComment) from CmsComment cmsComment"
    )
    Page<CmsComment> findAllWithToOneRelationships(Pageable pageable);

    @Query("select cmsComment from CmsComment cmsComment left join fetch cmsComment.post")
    List<CmsComment> findAllWithToOneRelationships();

    @Query("select cmsComment from CmsComment cmsComment left join fetch cmsComment.post where cmsComment.id =:id")
    Optional<CmsComment> findOneWithToOneRelationships(@Param("id") Long id);

    @Query(
        value = """
            select c from CmsComment c left join fetch c.post p
            where p.slug = :postSlug and lower(c.status) = lower(:status)
            order by c.createdAt desc nulls last, c.id desc
            """,
        countQuery = """
            select count(c) from CmsComment c join c.post p
            where p.slug = :postSlug and lower(c.status) = lower(:status)
            """
    )
    Page<CmsComment> findApprovedByPostSlug(
        @Param("postSlug") String postSlug,
        @Param("status") String status,
        Pageable pageable
    );
}
