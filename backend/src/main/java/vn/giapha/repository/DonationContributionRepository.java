package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.DonationContribution;

/**
 * Spring Data JPA repository for the DonationContribution entity.
 */
@Repository
public interface DonationContributionRepository extends JpaRepository<DonationContribution, Long> {
    default Optional<DonationContribution> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<DonationContribution> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<DonationContribution> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select donationContribution from DonationContribution donationContribution left join fetch donationContribution.campaign",
        countQuery = "select count(donationContribution) from DonationContribution donationContribution"
    )
    Page<DonationContribution> findAllWithToOneRelationships(Pageable pageable);

    @Query("select donationContribution from DonationContribution donationContribution left join fetch donationContribution.campaign")
    List<DonationContribution> findAllWithToOneRelationships();

    @Query(
        "select donationContribution from DonationContribution donationContribution left join fetch donationContribution.campaign where donationContribution.id =:id"
    )
    Optional<DonationContribution> findOneWithToOneRelationships(@Param("id") Long id);
}
