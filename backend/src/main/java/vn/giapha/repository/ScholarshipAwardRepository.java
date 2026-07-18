package vn.giapha.repository;

import java.math.BigDecimal;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.ScholarshipAward;

@Repository
public interface ScholarshipAwardRepository extends JpaRepository<ScholarshipAward, Long> {
    boolean existsByEntry_Id(Long entryId);

    boolean existsByRound_IdAndEntry_Id(Long roundId, Long entryId);

    Optional<ScholarshipAward> findByRound_IdAndEntry_Id(Long roundId, Long entryId);

    @Query(
        """
        select coalesce(sum(a.amount), 0) from ScholarshipAward a
        join a.round r
        join r.tree t
        where t.slug = :slug
        """
    )
    BigDecimal sumAmountByTreeSlug(@Param("slug") String slug);

    @Query(
        """
        select coalesce(sum(a.amount), 0) from ScholarshipAward a
        join a.round r
        where r.fundCampaign.id = :campaignId
        """
    )
    BigDecimal sumAmountByFundCampaignId(@Param("campaignId") Long campaignId);

    @Query(
        """
        select count(a) from ScholarshipAward a
        where a.round.id = :roundId
        """
    )
    long countByRoundId(@Param("roundId") Long roundId);
}
