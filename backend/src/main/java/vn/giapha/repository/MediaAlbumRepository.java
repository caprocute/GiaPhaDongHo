package vn.giapha.repository;

import org.springframework.data.jpa.repository.*;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.MediaAlbum;

/**
 * Spring Data JPA repository for the MediaAlbum entity.
 */
@SuppressWarnings("unused")
@Repository
public interface MediaAlbumRepository extends JpaRepository<MediaAlbum, Long> {}
