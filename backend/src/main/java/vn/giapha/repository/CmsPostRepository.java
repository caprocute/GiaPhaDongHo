package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.CmsPost;

/**
 * Spring Data JPA repository for the CmsPost entity.
 */
@Repository
public interface CmsPostRepository extends JpaRepository<CmsPost, Long> {
    default Optional<CmsPost> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<CmsPost> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<CmsPost> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select cmsPost from CmsPost cmsPost left join fetch cmsPost.category",
        countQuery = "select count(cmsPost) from CmsPost cmsPost"
    )
    Page<CmsPost> findAllWithToOneRelationships(Pageable pageable);

    @Query("select cmsPost from CmsPost cmsPost left join fetch cmsPost.category")
    List<CmsPost> findAllWithToOneRelationships();

    @Query("select cmsPost from CmsPost cmsPost left join fetch cmsPost.category where cmsPost.id =:id")
    Optional<CmsPost> findOneWithToOneRelationships(@Param("id") Long id);
}
