package vn.giapha.repository;

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
}
