package vn.giapha.repository;

import java.util.List;
import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.NotificationOutbox;

/**
 * Spring Data JPA repository for the NotificationOutbox entity.
 */
@Repository
public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, Long> {
    List<NotificationOutbox> findTop50ByStatusOrderByCreatedAtAsc(String status);

    List<NotificationOutbox> findTop100ByOrderByCreatedAtDesc();

    List<NotificationOutbox> findTop100ByStatusOrderByCreatedAtDesc(String status);

    boolean existsByPayloadJsonContaining(String fragment);
}
