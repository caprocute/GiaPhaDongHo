package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.ClanEvent;

/**
 * Spring Data JPA repository for the ClanEvent entity.
 */
@Repository
public interface ClanEventRepository extends JpaRepository<ClanEvent, Long> {
    default Optional<ClanEvent> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<ClanEvent> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<ClanEvent> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select clanEvent from ClanEvent clanEvent left join fetch clanEvent.tree",
        countQuery = "select count(clanEvent) from ClanEvent clanEvent"
    )
    Page<ClanEvent> findAllWithToOneRelationships(Pageable pageable);

    @Query("select clanEvent from ClanEvent clanEvent left join fetch clanEvent.tree")
    List<ClanEvent> findAllWithToOneRelationships();

    @Query("select clanEvent from ClanEvent clanEvent left join fetch clanEvent.tree where clanEvent.id =:id")
    Optional<ClanEvent> findOneWithToOneRelationships(@Param("id") Long id);

    @Query(
        """
        select e from ClanEvent e
        left join fetch e.tree t
        where t.id = :treeId
        order by e.startSolar desc nulls last, e.id desc
        """
    )
    List<ClanEvent> findByTreeIdOrderByStartSolarDesc(@Param("treeId") Long treeId);
}
