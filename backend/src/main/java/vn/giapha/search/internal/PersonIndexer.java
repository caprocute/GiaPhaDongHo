package vn.giapha.search.internal;

import java.util.Optional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.Person;
import vn.giapha.repository.PersonRepository;

@Service
public class PersonIndexer {

    private static final Logger LOG = LoggerFactory.getLogger(PersonIndexer.class);

    private final PersonRepository personRepository;
    private final ElasticsearchPersonIndex elasticsearchPersonIndex;

    public PersonIndexer(PersonRepository personRepository, ElasticsearchPersonIndex elasticsearchPersonIndex) {
        this.personRepository = personRepository;
        this.elasticsearchPersonIndex = elasticsearchPersonIndex;
    }

    @Transactional(readOnly = true)
    public void reindex(Long personId) {
        if (personId == null) {
            return;
        }
        Optional<Person> opt = personRepository.findOneWithEagerRelationships(personId);
        if (opt.isEmpty()) {
            elasticsearchPersonIndex.delete(personId);
            LOG.debug("Person {} không còn — xóa khỏi ES", personId);
            return;
        }
        Person p = opt.get();
        String fold = VietnameseTextNormalizer.fold(
            String.join(
                " ",
                nullToEmpty(p.getCode()),
                nullToEmpty(p.getFullName()),
                nullToEmpty(p.getTenHuy()),
                nullToEmpty(p.getTenThuong())
            )
        );
        String treeSlug = p.getTree() != null ? p.getTree().getSlug() : "";
        elasticsearchPersonIndex.index(
            new PersonIndexDocument(
                p.getId(),
                p.getCode(),
                p.getFullName(),
                p.getTenHuy(),
                p.getTenThuong(),
                fold,
                treeSlug,
                p.getGeneration(),
                p.getLifeStatus()
            )
        );
    }

    private static String nullToEmpty(String s) {
        return s == null ? "" : s;
    }
}
