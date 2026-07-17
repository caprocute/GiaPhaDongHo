package vn.giapha.notification.internal;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.AnniversarySubscription;
import vn.giapha.domain.DeathAnniversary;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.Person;
import vn.giapha.notification.api.NotifyChannels;
import vn.giapha.repository.AnniversarySubscriptionRepository;
import vn.giapha.repository.DeathAnniversaryRepository;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.repository.NotificationOutboxRepository;
import vn.giapha.repository.PersonRepository;
import vn.giapha.service.dto.AnniversarySubscriptionDTO;
import vn.giapha.service.dto.NotificationOutboxDTO;
import vn.giapha.service.dto.PersonDTO;
import vn.giapha.service.mapper.AnniversarySubscriptionMapper;
import vn.giapha.service.mapper.NotificationOutboxMapper;
import vn.giapha.service.mapper.PersonMapper;

@Service
@Transactional
public class NotificationService {

    private final AnniversarySubscriptionRepository subscriptionRepository;
    private final NotificationOutboxRepository outboxRepository;
    private final PersonRepository personRepository;
    private final FamilyTreeRepository familyTreeRepository;
    private final DeathAnniversaryRepository deathAnniversaryRepository;
    private final AnniversarySubscriptionMapper subscriptionMapper;
    private final NotificationOutboxMapper outboxMapper;
    private final PersonMapper personMapper;
    private final OutboxDispatcher outboxDispatcher;
    private final ReminderPlanner reminderPlanner;
    private final ICalBuilder iCalBuilder;

    public NotificationService(
        AnniversarySubscriptionRepository subscriptionRepository,
        NotificationOutboxRepository outboxRepository,
        PersonRepository personRepository,
        FamilyTreeRepository familyTreeRepository,
        DeathAnniversaryRepository deathAnniversaryRepository,
        AnniversarySubscriptionMapper subscriptionMapper,
        NotificationOutboxMapper outboxMapper,
        PersonMapper personMapper,
        OutboxDispatcher outboxDispatcher,
        ReminderPlanner reminderPlanner,
        ICalBuilder iCalBuilder
    ) {
        this.subscriptionRepository = subscriptionRepository;
        this.outboxRepository = outboxRepository;
        this.personRepository = personRepository;
        this.familyTreeRepository = familyTreeRepository;
        this.deathAnniversaryRepository = deathAnniversaryRepository;
        this.subscriptionMapper = subscriptionMapper;
        this.outboxMapper = outboxMapper;
        this.personMapper = personMapper;
        this.outboxDispatcher = outboxDispatcher;
        this.reminderPlanner = reminderPlanner;
        this.iCalBuilder = iCalBuilder;
    }

    public AnniversarySubscriptionDTO subscribe(String treeSlug, String userId, AnniversarySubscriptionDTO dto) {
        requireTree(treeSlug);
        if (dto.getPerson() == null || dto.getPerson().getId() == null) {
            throw new IllegalArgumentException("person.id bắt buộc");
        }
        Person person = personRepository
            .findById(dto.getPerson().getId())
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy người"));
        person = personRepository
            .findByTree_SlugAndCodeIgnoreCase(treeSlug, person.getCode())
            .orElseThrow(() -> new IllegalArgumentException("Người không thuộc cây " + treeSlug));
        String channels = normalizeChannels(dto.getChannels());
        AnniversarySubscription existing = subscriptionRepository
            .findByUserIdAndPerson_Id(userId, person.getId())
            .orElse(null);
        AnniversarySubscription entity;
        if (existing != null) {
            entity = existing;
            entity.setDaysBefore(dto.getDaysBefore() == null ? 3 : dto.getDaysBefore());
            entity.setChannels(channels);
        } else {
            entity = new AnniversarySubscription();
            entity.setUserId(userId);
            entity.setPerson(person);
            entity.setDaysBefore(dto.getDaysBefore() == null ? 3 : dto.getDaysBefore());
            entity.setChannels(channels);
        }
        return subscriptionMapper.toDto(subscriptionRepository.save(entity));
    }

    @Transactional(readOnly = true)
    public List<AnniversarySubscriptionDTO> mySubscriptions(String treeSlug, String userId) {
        requireTree(treeSlug);
        return subscriptionRepository
            .findByUserIdAndTreeSlug(userId, treeSlug)
            .stream()
            .map(subscriptionMapper::toDto)
            .toList();
    }

    public void unsubscribe(String treeSlug, String userId, Long id) {
        AnniversarySubscription sub = subscriptionRepository
            .findOneWithEagerRelationships(id)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy đăng ký"));
        if (!userId.equals(sub.getUserId())) {
            throw new IllegalArgumentException("Không phải đăng ký của bạn");
        }
        if (sub.getPerson() == null || sub.getPerson().getCode() == null) {
            throw new IllegalArgumentException("Đăng ký thiếu người");
        }
        personRepository
            .findByTree_SlugAndCodeIgnoreCase(treeSlug, sub.getPerson().getCode())
            .orElseThrow(() -> new IllegalArgumentException("Đăng ký không thuộc cây"));
        subscriptionRepository.delete(sub);
    }

    @Transactional(readOnly = true)
    public List<NotificationOutboxDTO> listOutbox(String status) {
        if (status == null || status.isBlank()) {
            return outboxRepository.findTop100ByOrderByCreatedAtDesc().stream().map(outboxMapper::toDto).toList();
        }
        return outboxRepository
            .findTop100ByStatusOrderByCreatedAtDesc(status.trim().toLowerCase(Locale.ROOT))
            .stream()
            .map(outboxMapper::toDto)
            .toList();
    }

    public int runPlannerAndDispatch() {
        int q = reminderPlanner.planForToday();
        int d = outboxDispatcher.dispatchPending(50);
        return q + d;
    }

    public int dispatchOnly() {
        return outboxDispatcher.dispatchPending(50);
    }

    @Transactional(readOnly = true)
    public String treeIcal(String treeSlug, int year) {
        FamilyTree tree = requireTree(treeSlug);
        List<DeathAnniversary> ann = deathAnniversaryRepository.findByTreeSlugAndOptionalMonth(treeSlug, null);
        String calName = tree.getBranchName() != null
            ? tree.getBranchName()
            : (tree.getSurname() != null ? "Họ " + tree.getSurname() : treeSlug);
        return iCalBuilder.buildTreeCalendar(calName, treeSlug, ann, year);
    }

    @Transactional(readOnly = true)
    public String myIcal(String treeSlug, String userId, int year) {
        requireTree(treeSlug);
        List<AnniversarySubscription> subs = subscriptionRepository.findByUserIdAndTreeSlug(userId, treeSlug);
        List<DeathAnniversary> ann = subs
            .stream()
            .map(s -> s.getPerson() == null ? null : deathAnniversaryRepository.findByPerson_Id(s.getPerson().getId()).orElse(null))
            .filter(a -> a != null)
            .collect(Collectors.toList());
        return iCalBuilder.buildTreeCalendar("Nhắc giỗ của tôi", treeSlug, ann, year);
    }

    /** Resolve person by code for portal convenience. */
    @Transactional(readOnly = true)
    public PersonDTO resolvePerson(String treeSlug, String code) {
        return personRepository
            .findByTree_SlugAndCodeIgnoreCase(treeSlug, code)
            .map(personMapper::toDto)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy mã " + code));
    }

    private FamilyTree requireTree(String slug) {
        return familyTreeRepository
            .findBySlug(slug)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy cây slug=" + slug));
    }

    private static String normalizeChannels(String raw) {
        return String.join(",", ReminderPlanner.parseChannels(raw));
    }
}
