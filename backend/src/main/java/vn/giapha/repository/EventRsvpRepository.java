package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.EventRsvp;

/**
 * Spring Data JPA repository for the EventRsvp entity.
 */
@Repository
public interface EventRsvpRepository extends JpaRepository<EventRsvp, Long> {
    default Optional<EventRsvp> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<EventRsvp> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<EventRsvp> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select eventRsvp from EventRsvp eventRsvp left join fetch eventRsvp.event",
        countQuery = "select count(eventRsvp) from EventRsvp eventRsvp"
    )
    Page<EventRsvp> findAllWithToOneRelationships(Pageable pageable);

    @Query("select eventRsvp from EventRsvp eventRsvp left join fetch eventRsvp.event")
    List<EventRsvp> findAllWithToOneRelationships();

    @Query("select eventRsvp from EventRsvp eventRsvp left join fetch eventRsvp.event where eventRsvp.id =:id")
    Optional<EventRsvp> findOneWithToOneRelationships(@Param("id") Long id);

    List<EventRsvp> findByEventIdOrderByIdAsc(Long eventId);

    @Query(
        """
        select r from EventRsvp r
        where r.event.id = :eventId
          and lower(r.householdName) = lower(:householdName)
        """
    )
    Optional<EventRsvp> findByEventIdAndHouseholdNameIgnoreCase(
        @Param("eventId") Long eventId,
        @Param("householdName") String householdName
    );
}
