package vn.giapha.repository;

import java.util.Optional;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.FamilyTree;

/**
 * Spring Data JPA repository for the FamilyTree entity.
 */
@SuppressWarnings("unused")
@Repository
public interface FamilyTreeRepository extends JpaRepository<FamilyTree, Long> {
    Optional<FamilyTree> findBySlug(String slug);
}
