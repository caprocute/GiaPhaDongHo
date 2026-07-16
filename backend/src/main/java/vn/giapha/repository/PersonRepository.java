package vn.giapha.repository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.*;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import vn.giapha.domain.Person;

/**
 * Spring Data JPA repository for the Person entity.
 */
@Repository
public interface PersonRepository extends JpaRepository<Person, Long> {
    default Optional<Person> findOneWithEagerRelationships(Long id) {
        return this.findOneWithToOneRelationships(id);
    }

    default List<Person> findAllWithEagerRelationships() {
        return this.findAllWithToOneRelationships();
    }

    default Page<Person> findAllWithEagerRelationships(Pageable pageable) {
        return this.findAllWithToOneRelationships(pageable);
    }

    @Query(value = "select person from Person person left join fetch person.tree", countQuery = "select count(person) from Person person")
    Page<Person> findAllWithToOneRelationships(Pageable pageable);

    @Query("select person from Person person left join fetch person.tree")
    List<Person> findAllWithToOneRelationships();

    @Query("select person from Person person left join fetch person.tree where person.id =:id")
    Optional<Person> findOneWithToOneRelationships(@Param("id") Long id);
}
