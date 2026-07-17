package vn.giapha.genealogy.internal;

import java.util.Optional;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.genealogy.api.TreeSettingsDTO;
import vn.giapha.genealogy.api.TreeSettingsQuery;
import vn.giapha.repository.FamilyTreeRepository;

@Service
@Transactional(readOnly = true)
public class TreeSettingsQueryService implements TreeSettingsQuery {

    private final FamilyTreeRepository familyTreeRepository;
    private final TreeSettingsCodec treeSettingsCodec;

    public TreeSettingsQueryService(FamilyTreeRepository familyTreeRepository, TreeSettingsCodec treeSettingsCodec) {
        this.familyTreeRepository = familyTreeRepository;
        this.treeSettingsCodec = treeSettingsCodec;
    }

    @Override
    public Optional<TreeSettingsDTO> findBySlug(String slug) {
        return familyTreeRepository.findBySlug(slug).map(treeSettingsCodec::read);
    }
}
