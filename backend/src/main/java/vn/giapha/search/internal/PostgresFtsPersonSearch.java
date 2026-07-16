package vn.giapha.search.internal;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.Query;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;
import vn.giapha.domain.Person;
import vn.giapha.repository.PersonRepository;
import vn.giapha.search.api.PersonSuggestHit;

/**
 * Fallback suggest — PG {@code unaccent} khi có; không thì fold Java trên tập ứng viên.
 */
@Component
public class PostgresFtsPersonSearch {

    @PersistenceContext
    private EntityManager entityManager;

    private final PersonRepository personRepository;

    public PostgresFtsPersonSearch(PersonRepository personRepository) {
        this.personRepository = personRepository;
    }

    public List<PersonSuggestHit> suggest(String treeSlug, String rawQuery, String foldedQuery, int limit) {
        if (foldedQuery.isBlank()) {
            return List.of();
        }
        try {
            return suggestNative(treeSlug, foldedQuery, limit);
        } catch (Exception e) {
            return suggestJavaFold(treeSlug, foldedQuery, limit);
        }
    }

    @SuppressWarnings("unchecked")
    private List<PersonSuggestHit> suggestNative(String treeSlug, String foldedQuery, int limit) {
        String sql =
            """
            select p.id, p.code, p.full_name, t.slug, p.generation, p.life_status
            from person p
            join family_tree t on p.tree_id = t.id
            where t.slug = :slug
              and (
                unaccent(lower(coalesce(p.full_name, ''))) like '%' || :q || '%'
                or unaccent(lower(coalesce(p.code, ''))) like '%' || :q || '%'
                or unaccent(lower(coalesce(p.ten_huy, ''))) like '%' || :q || '%'
                or unaccent(lower(coalesce(p.ten_thuong, ''))) like '%' || :q || '%'
              )
            order by p.full_name
            limit :lim
            """;
        Query q = entityManager.createNativeQuery(sql);
        q.setParameter("slug", treeSlug);
        q.setParameter("q", foldedQuery);
        q.setParameter("lim", limit);
        List<Object[]> rows = q.getResultList();
        List<PersonSuggestHit> out = new ArrayList<>();
        for (Object[] row : rows) {
            out.add(
                new PersonSuggestHit(
                    ((Number) row[0]).longValue(),
                    (String) row[1],
                    (String) row[2],
                    (String) row[3],
                    row[4] == null ? null : ((Number) row[4]).intValue(),
                    (String) row[5]
                )
            );
        }
        return out;
    }

    private List<PersonSuggestHit> suggestJavaFold(String treeSlug, String foldedQuery, int limit) {
        return personRepository
            .searchInTree(treeSlug, null, null, org.springframework.data.domain.PageRequest.of(0, 200))
            .stream()
            .filter(p -> matchesFold(p, foldedQuery))
            .limit(limit)
            .map(this::toHit)
            .toList();
    }

    private static boolean matchesFold(Person p, String foldedQuery) {
        String blob = VietnameseTextNormalizer.fold(
            String.join(
                " ",
                nullToEmpty(p.getCode()),
                nullToEmpty(p.getFullName()),
                nullToEmpty(p.getTenHuy()),
                nullToEmpty(p.getTenThuong())
            )
        );
        return blob.contains(foldedQuery);
    }

    private PersonSuggestHit toHit(Person p) {
        String slug = p.getTree() != null ? p.getTree().getSlug() : null;
        return new PersonSuggestHit(p.getId(), p.getCode(), p.getFullName(), slug, p.getGeneration(), p.getLifeStatus());
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
