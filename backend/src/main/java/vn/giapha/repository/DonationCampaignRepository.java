package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.DonationCampaign;

/**
 * Spring Data JPA repository for the DonationCampaign entity.
 */
@Repository
public interface DonationCampaignRepository extends JpaRepository<DonationCampaign, Long> {
    default Optional<DonationCampaign> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<DonationCampaign> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<DonationCampaign> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select donationCampaign from DonationCampaign donationCampaign left join fetch donationCampaign.tree",
        countQuery = "select count(donationCampaign) from DonationCampaign donationCampaign"
    )
    Page<DonationCampaign> findAllWithToOneRelationships(Pageable pageable);

    @Query("select donationCampaign from DonationCampaign donationCampaign left join fetch donationCampaign.tree")
    List<DonationCampaign> findAllWithToOneRelationships();

    @Query(
        "select donationCampaign from DonationCampaign donationCampaign left join fetch donationCampaign.tree where donationCampaign.id =:id"
    )
    Optional<DonationCampaign> findOneWithToOneRelationships(@Param("id") Long id);

    @Query(
        """
        select c from DonationCampaign c
        left join fetch c.tree t
        where t.id = :treeId
        order by c.id desc
        """
    )
    List<DonationCampaign> findByTreeId(@Param("treeId") Long treeId);

    @Query(
        """
        select c from DonationCampaign c
        left join fetch c.tree t
        where t.id = :treeId
          and lower(c.status) = lower(:status)
        order by c.id desc
        """
    )
    List<DonationCampaign> findByTreeIdAndStatus(@Param("treeId") Long treeId, @Param("status") String status);

    /** Tránh bind null vào lower(:status) (Postgres: lower(bytea)). */
    default List<DonationCampaign> findByTreeIdAndOptionalStatus(Long treeId, String status) {
        if (status == null || status.isBlank()) {
            return findByTreeId(treeId);
        }
        return findByTreeIdAndStatus(treeId, status.trim());
    }
}
