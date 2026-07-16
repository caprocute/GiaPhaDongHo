package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.MediaPhoto;

/**
 * Spring Data JPA repository for the MediaPhoto entity.
 */
@Repository
public interface MediaPhotoRepository extends JpaRepository<MediaPhoto, Long> {
    default Optional<MediaPhoto> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<MediaPhoto> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<MediaPhoto> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(
        value = "select mediaPhoto from MediaPhoto mediaPhoto left join fetch mediaPhoto.album",
        countQuery = "select count(mediaPhoto) from MediaPhoto mediaPhoto"
    )
    Page<MediaPhoto> findAllWithToOneRelationships(Pageable pageable);

    @Query("select mediaPhoto from MediaPhoto mediaPhoto left join fetch mediaPhoto.album")
    List<MediaPhoto> findAllWithToOneRelationships();

    @Query("select mediaPhoto from MediaPhoto mediaPhoto left join fetch mediaPhoto.album where mediaPhoto.id =:id")
    Optional<MediaPhoto> findOneWithToOneRelationships(@Param("id") Long id);
}
