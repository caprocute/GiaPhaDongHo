package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.ScholarshipAwardRound;

@Repository
public interface ScholarshipAwardRoundRepository extends JpaRepository<ScholarshipAwardRound, Long> {
    @Query(
        """
        select r from ScholarshipAwardRound r
        left join fetch r.tree t
        left join fetch r.fundCampaign
        left join fetch r.honorEvent
        where t.slug = :slug
        order by r.createdAt desc nulls last, r.id desc
        """
    )
    List<ScholarshipAwardRound> findByTreeSlug(@Param("slug") String slug);

    @Query(
        """
        select r from ScholarshipAwardRound r
        left join fetch r.tree t
        left join fetch r.fundCampaign
        left join fetch r.honorEvent
        where t.slug = :slug
          and lower(r.status) = lower(:status)
        order by r.createdAt desc nulls last, r.id desc
        """
    )
    List<ScholarshipAwardRound> findByTreeSlugAndStatus(@Param("slug") String slug, @Param("status") String status);

    @Query(
        """
        select r from ScholarshipAwardRound r
        left join fetch r.tree t
        left join fetch r.fundCampaign
        left join fetch r.honorEvent
        where r.id = :id
        """
    )
    Optional<ScholarshipAwardRound> findOneWithRelations(@Param("id") Long id);
}
