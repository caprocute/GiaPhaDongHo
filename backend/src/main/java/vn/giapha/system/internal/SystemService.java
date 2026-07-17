package vn.giapha.system.internal;

import java.time.Instant;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.FamilyTree;
import vn.giapha.repository.ClanEventRepository;
import vn.giapha.repository.DonationCampaignRepository;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.repository.PersonRepository;
import vn.giapha.repository.ScholarshipEntryRepository;
import vn.giapha.security.SecurityUtils;
import vn.giapha.system.api.ModuleCodes;

@Service
@Transactional
public class SystemService {

    private final ModuleRegistryRepository moduleRegistryRepository;
    private final AuditLogRepository auditLogRepository;
    private final FamilyTreeRepository familyTreeRepository;
    private final PersonRepository personRepository;
    private final DonationCampaignRepository donationCampaignRepository;
    private final ClanEventRepository clanEventRepository;
    private final ScholarshipEntryRepository scholarshipEntryRepository;

    public SystemService(
        ModuleRegistryRepository moduleRegistryRepository,
        AuditLogRepository auditLogRepository,
        FamilyTreeRepository familyTreeRepository,
        PersonRepository personRepository,
        DonationCampaignRepository donationCampaignRepository,
        ClanEventRepository clanEventRepository,
        ScholarshipEntryRepository scholarshipEntryRepository
    ) {
        this.moduleRegistryRepository = moduleRegistryRepository;
        this.auditLogRepository = auditLogRepository;
        this.familyTreeRepository = familyTreeRepository;
        this.personRepository = personRepository;
        this.donationCampaignRepository = donationCampaignRepository;
        this.clanEventRepository = clanEventRepository;
        this.scholarshipEntryRepository = scholarshipEntryRepository;
    }

    @Transactional(readOnly = true)
    public List<ModuleRegistry> listModules() {
        ensureDefaults();
        return moduleRegistryRepository.findAll();
    }

    public ModuleRegistry setEnabled(String code, boolean enabled) {
        ensureDefaults();
        ModuleRegistry m = moduleRegistryRepository
            .findById(code)
            .orElseThrow(() -> new IllegalArgumentException("Module không tồn tại"));
        m.setEnabled(enabled);
        ModuleRegistry saved = moduleRegistryRepository.save(m);
        audit("module.toggle", "module_registry", code, "{\"enabled\":" + enabled + "}");
        return saved;
    }

    public void audit(String action, String entityType, String entityId, String detailJson) {
        AuditLog log = new AuditLog();
        log.setActor(SecurityUtils.getCurrentUserLogin().orElse("anonymous"));
        log.setAction(action);
        log.setEntityType(entityType);
        log.setEntityId(entityId);
        log.setDetailJson(detailJson);
        log.setCreatedAt(Instant.now());
        auditLogRepository.save(log);
    }

    @Transactional(readOnly = true)
    public List<AuditLog> recentAudit() {
        return auditLogRepository.findTop100ByOrderByCreatedAtDesc();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dashboardStats(String treeSlug) {
        FamilyTree tree = familyTreeRepository
            .findBySlug(treeSlug)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cây"));
        Map<String, Object> m = new HashMap<>();
        m.put("persons", personRepository.findByTree_Slug(treeSlug).size());
        m.put("donationCampaigns", donationCampaignRepository.findByTreeIdAndOptionalStatus(tree.getId(), null).size());
        m.put("events", clanEventRepository.findByTreeIdOrderByStartSolarDesc(tree.getId()).size());
        m.put("scholarshipApproved", scholarshipEntryRepository.findByTreeSlugAndStatus(treeSlug, "approved").size());
        m.put("modulesEnabled", listModules().stream().filter(ModuleRegistry::isEnabled).count());
        return m;
    }

    private void ensureDefaults() {
        for (String code : List.of(
            ModuleCodes.DONATION,
            ModuleCodes.EVENT,
            ModuleCodes.MODERATION,
            ModuleCodes.NOTIFICATION,
            ModuleCodes.SCHOLARSHIP,
            ModuleCodes.BOOK
        )) {
            if (!moduleRegistryRepository.existsById(code)) {
                ModuleRegistry m = new ModuleRegistry();
                m.setCode(code);
                m.setEnabled(true);
                m.setConfigJson("{}");
                moduleRegistryRepository.save(m);
            }
        }
    }
}
