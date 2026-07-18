package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.CmsCategory;

/**
 * Spring Data JPA repository for the CmsCategory entity.
 */
@SuppressWarnings("unused")
@Repository
public interface CmsCategoryRepository extends JpaRepository<CmsCategory, Long> {
    Optional<CmsCategory> findBySlug(String slug);

    @Query(
        """
        select c from CmsCategory c
        where c.visibleOnNav is null or c.visibleOnNav = true
        order by coalesce(c.sortOrder, 999) asc, c.name asc
        """
    )
    List<CmsCategory> findVisibleOnNavOrdered();

    @Query("select c from CmsCategory c order by coalesce(c.sortOrder, 999) asc, c.name asc")
    List<CmsCategory> findAllOrdered();
}
