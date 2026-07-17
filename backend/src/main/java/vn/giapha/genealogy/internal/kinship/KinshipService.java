package vn.giapha.genealogy.internal.kinship;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Queue;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.domain.Person;
import vn.giapha.domain.UnionChild;
import vn.giapha.domain.UnionMember;
import vn.giapha.repository.FamilyTreeRepository;
import vn.giapha.repository.PersonRepository;
import vn.giapha.repository.UnionChildRepository;
import vn.giapha.repository.UnionMemberRepository;
import vn.giapha.security.SecurityUtils;

/**
 * LCA + xưng hô trên đồ thị hôn phối/con (F2 / R2.5).
 * Ưu tiên {@code lineagePath} khi cả hai có path; fallback BFS tổ tiên qua union.
 */
@Service
@Transactional(readOnly = true)
public class KinshipService {

    private final FamilyTreeRepository familyTreeRepository;
    private final PersonRepository personRepository;
    private final UnionChildRepository unionChildRepository;
    private final UnionMemberRepository unionMemberRepository;

    public KinshipService(
        FamilyTreeRepository familyTreeRepository,
        PersonRepository personRepository,
        UnionChildRepository unionChildRepository,
        UnionMemberRepository unionMemberRepository
    ) {
        this.familyTreeRepository = familyTreeRepository;
        this.personRepository = personRepository;
        this.unionChildRepository = unionChildRepository;
        this.unionMemberRepository = unionMemberRepository;
    }

    public KinshipResult relate(String treeSlug, String fromCode, String toCode) {
        if (familyTreeRepository.findBySlug(treeSlug).isEmpty()) {
            throw new IllegalArgumentException("Không tìm thấy cây");
        }
        Person from = personRepository
            .findByTree_SlugAndCodeIgnoreCase(treeSlug, fromCode)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy " + fromCode));
        Person to = personRepository
            .findByTree_SlugAndCodeIgnoreCase(treeSlug, toCode)
            .orElseThrow(() -> new IllegalArgumentException("Không tìm thấy " + toCode));

        if (from.getId().equals(to.getId())) {
            return new KinshipResult(
                from.getCode(),
                from.getFullName(),
                to.getCode(),
                to.getFullName(),
                from.getCode(),
                "chính mình",
                "tôi",
                "tôi",
                List.of(from.getCode())
            );
        }

        Optional<KinshipResult> viaPath = relateByLineagePath(from, to);
        if (viaPath.isPresent()) {
            return viaPath.get();
        }
        return relateByGraph(treeSlug, from, to);
    }

    public KinshipResult relateToMe(String treeSlug, String toCode) {
        String login = SecurityUtils.getCurrentUserLogin().orElseThrow(() -> new IllegalArgumentException("Cần đăng nhập"));
        Person me = personRepository
            .findByTree_SlugAndLinkedUserId(treeSlug, login)
            .or(() -> personRepository.findByTree_SlugAndLinkedUserId(treeSlug, login.toLowerCase()))
            .orElseThrow(() -> new IllegalArgumentException("Tài khoản chưa liên kết hồ sơ trong cây (linkedUserId)"));
        return relate(treeSlug, me.getCode(), toCode);
    }

    private Optional<KinshipResult> relateByLineagePath(Person from, Person to) {
        List<String> a = splitPath(from.getLineagePath());
        List<String> b = splitPath(to.getLineagePath());
        if (a.isEmpty() || b.isEmpty()) {
            return Optional.empty();
        }
        int i = 0;
        while (i < a.size() && i < b.size() && a.get(i).equalsIgnoreCase(b.get(i))) {
            i++;
        }
        if (i == 0) {
            return Optional.empty();
        }
        String lca = a.get(i - 1);
        int genDiff = (b.size() - i) - (a.size() - i);
        List<String> path = new ArrayList<>();
        for (int x = a.size() - 1; x >= i - 1; x--) {
            path.add(a.get(x));
        }
        for (int x = i; x < b.size(); x++) {
            path.add(b.get(x));
        }
        String label = VietnameseHonorifics.relationLabel(genDiff, to.getGender());
        String addrTo = VietnameseHonorifics.addressFromTo(genDiff, to.getGender(), true);
        String addrFrom = VietnameseHonorifics.addressFromTo(-genDiff, from.getGender(), true);
        return Optional.of(
            new KinshipResult(
                from.getCode(),
                from.getFullName(),
                to.getCode(),
                to.getFullName(),
                lca,
                label,
                addrTo,
                addrFrom,
                path
            )
        );
    }

    private KinshipResult relateByGraph(String treeSlug, Person from, Person to) {
        Map<Long, Set<Long>> parentsOf = new HashMap<>();
        Map<Long, String> idToCode = new HashMap<>();
        Map<Long, Person> byId = new HashMap<>();

        List<Person> people = personRepository.findByTree_Slug(treeSlug);
        for (Person p : people) {
            idToCode.put(p.getId(), p.getCode());
            byId.put(p.getId(), p);
        }

        List<UnionChild> children = unionChildRepository.findByTreeSlug(treeSlug);
        List<UnionMember> members = unionMemberRepository.findByTreeSlug(treeSlug);
        Map<Long, List<Long>> unionParents = new HashMap<>();
        for (UnionMember m : members) {
            if (m.getUnion() == null || m.getPerson() == null) {
                continue;
            }
            unionParents.computeIfAbsent(m.getUnion().getId(), k -> new ArrayList<>()).add(m.getPerson().getId());
        }
        for (UnionChild uc : children) {
            if (uc.getChild() == null || uc.getUnion() == null) {
                continue;
            }
            Long childId = uc.getChild().getId();
            for (Long parentId : unionParents.getOrDefault(uc.getUnion().getId(), List.of())) {
                parentsOf.computeIfAbsent(childId, k -> new HashSet<>()).add(parentId);
            }
        }

        Map<Long, Integer> depthFrom = ancestorDepths(from.getId(), parentsOf);
        Map<Long, Integer> depthTo = ancestorDepths(to.getId(), parentsOf);
        Long lcaId = null;
        int best = Integer.MAX_VALUE;
        for (Map.Entry<Long, Integer> e : depthFrom.entrySet()) {
            if (!depthTo.containsKey(e.getKey())) {
                continue;
            }
            int score = e.getValue() + depthTo.get(e.getKey());
            if (score < best) {
                best = score;
                lcaId = e.getKey();
            }
        }
        if (lcaId == null) {
            return new KinshipResult(
                from.getCode(),
                from.getFullName(),
                to.getCode(),
                to.getFullName(),
                null,
                "chưa xác định quan hệ trong cây",
                "họ hàng",
                "họ hàng",
                List.of(from.getCode(), to.getCode())
            );
        }
        // relative > 0 → `to` sâu hơn LCA hơn `from` (đời dưới)
        int relative = depthTo.get(lcaId) - depthFrom.get(lcaId);
        List<String> path = new ArrayList<>();
        path.addAll(pathUp(from.getId(), lcaId, parentsOf, idToCode));
        List<String> down = pathUp(to.getId(), lcaId, parentsOf, idToCode);
        Collections.reverse(down);
        if (!down.isEmpty()) {
            down = down.subList(1, down.size());
        }
        path.addAll(down);

        return new KinshipResult(
            from.getCode(),
            from.getFullName(),
            to.getCode(),
            to.getFullName(),
            idToCode.get(lcaId),
            VietnameseHonorifics.relationLabel(relative, to.getGender()),
            VietnameseHonorifics.addressFromTo(relative, to.getGender(), true),
            VietnameseHonorifics.addressFromTo(-relative, from.getGender(), true),
            path
        );
    }

    private static Map<Long, Integer> ancestorDepths(Long start, Map<Long, Set<Long>> parentsOf) {
        Map<Long, Integer> depth = new HashMap<>();
        Queue<Long> q = new ArrayDeque<>();
        q.add(start);
        depth.put(start, 0);
        while (!q.isEmpty()) {
            Long cur = q.poll();
            for (Long p : parentsOf.getOrDefault(cur, Set.of())) {
                if (!depth.containsKey(p)) {
                    depth.put(p, depth.get(cur) + 1);
                    q.add(p);
                }
            }
        }
        return depth;
    }

    private static List<String> pathUp(Long start, Long lca, Map<Long, Set<Long>> parentsOf, Map<Long, String> idToCode) {
        List<String> path = new ArrayList<>();
        Long cur = start;
        Set<Long> seen = new HashSet<>();
        while (cur != null && seen.add(cur)) {
            path.add(idToCode.getOrDefault(cur, String.valueOf(cur)));
            if (cur.equals(lca)) {
                break;
            }
            Set<Long> parents = parentsOf.getOrDefault(cur, Set.of());
            cur = parents.isEmpty() ? null : parents.iterator().next();
        }
        return path;
    }

    private static List<String> splitPath(String lineagePath) {
        if (lineagePath == null || lineagePath.isBlank()) {
            return List.of();
        }
        String norm = lineagePath.trim().replace('/', '.');
        List<String> out = new ArrayList<>();
        for (String p : norm.split("\\.")) {
            if (!p.isBlank()) {
                out.add(p.trim());
            }
        }
        return out;
    }
}
