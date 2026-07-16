package vn.giapha.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.NotificationOutbox;

/**
 * Spring Data JPA repository for the NotificationOutbox entity.
 */
@SuppressWarnings("unused")
@Repository
public interface NotificationOutboxRepository extends JpaRepository<NotificationOutbox, Long> {}
