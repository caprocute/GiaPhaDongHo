package vn.giapha.genealogy.internal.web;

import jakarta.validation.Valid;
import java.net.URI;
import java.net.URISyntaxException;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import vn.giapha.core.security.RequiresPermission;
import vn.giapha.genealogy.api.TreeSettingsDTO;
import vn.giapha.genealogy.internal.TreeGenealogyService;
import vn.giapha.genealogy.internal.TreeGenealogyService.DuplicatePersonCodeException;
import vn.giapha.genealogy.internal.TreeGenealogyService.PersonCodeNotFoundException;
import vn.giapha.genealogy.internal.TreeGenealogyService.TreeNotFoundException;
import vn.giapha.genealogy.internal.kinship.KinshipResult;
import vn.giapha.genealogy.internal.kinship.KinshipService;
import vn.giapha.service.dto.DeathAnniversaryDTO;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.dto.FamilyUnionDTO;
import vn.giapha.service.dto.PersonDTO;
import vn.giapha.web.rest.errors.BadRequestAlertException;

/**
 * REST công khai theo slug cây — TK-08 {@code /api/v1/trees/{slug}/…}.
 */
@RestController
@RequestMapping("/api/v1/trees/{slug}")
public class TreeGenealogyResource {

    private static final Logger LOG = LoggerFactory.getLogger(TreeGenealogyResource.class);

    private final TreeGenealogyService treeGenealogyService;
    private final KinshipService kinshipService;

    public TreeGenealogyResource(TreeGenealogyService treeGenealogyService, KinshipService kinshipService) {
        this.treeGenealogyService = treeGenealogyService;
        this.kinshipService = kinshipService;
    }

    @GetMapping("")
    public ResponseEntity<FamilyTreeDTO> getTree(@PathVariable String slug) {
        LOG.debug("GET tree slug={}", slug);
        return ResponseUtil.wrapOrNotFound(treeGenealogyService.findTree(slug));
    }

    @GetMapping("/settings")
    public ResponseEntity<TreeSettingsDTO> getSettings(@PathVariable String slug) {
        LOG.debug("GET tree settings slug={}", slug);
        return ResponseUtil.wrapOrNotFound(treeGenealogyService.getSettings(slug));
    }

    @PutMapping("/settings")
    @RequiresPermission("genealogy:tree:write")
    public ResponseEntity<TreeSettingsDTO> updateSettings(
        @PathVariable String slug,
        @Valid @RequestBody TreeSettingsDTO body
    ) {
        LOG.debug("PUT tree settings slug={}", slug);
        try {
            return ResponseEntity.ok(treeGenealogyService.updateSettings(slug, body));
        } catch (TreeNotFoundException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/settings/smtp/test")
    @RequiresPermission("genealogy:tree:write")
    public ResponseEntity<java.util.Map<String, String>> testSmtp(
        @PathVariable String slug,
        @RequestBody(required = false) java.util.Map<String, String> body
    ) {
        try {
            String to = body != null ? body.get("to") : null;
            String msg = treeGenealogyService.testSmtp(slug, to);
            return ResponseEntity.ok(java.util.Map.of("message", msg));
        } catch (TreeNotFoundException e) {
            return ResponseEntity.notFound().build();
        } catch (IllegalStateException e) {
            throw new BadRequestAlertException(e.getMessage(), "settings", "smtp");
        }
    }

    @GetMapping("/persons")
    public ResponseEntity<List<PersonDTO>> listPersons(
        @PathVariable String slug,
        @RequestParam(name = "query", required = false) String query,
        @RequestParam(name = "gen", required = false) Integer generation,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("GET persons tree={} query={} gen={}", slug, query, generation);
        if (treeGenealogyService.findTree(slug).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Page<PersonDTO> page = treeGenealogyService.listPersons(slug, query, generation, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/persons/{code}")
    public ResponseEntity<PersonDTO> getPersonByCode(@PathVariable String slug, @PathVariable String code) {
        LOG.debug("GET person tree={} code={}", slug, code);
        if (treeGenealogyService.findTree(slug).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseUtil.wrapOrNotFound(treeGenealogyService.findPersonByCode(slug, code));
    }

    @GetMapping("/unions")
    public ResponseEntity<List<FamilyUnionDTO>> listUnions(
        @PathVariable String slug,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("GET unions tree={}", slug);
        if (treeGenealogyService.findTree(slug).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        Page<FamilyUnionDTO> page = treeGenealogyService.listUnions(slug, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    /** Giỗ theo tháng âm — public R1.7 (widget /gio). */
    @GetMapping("/anniversaries")
    public ResponseEntity<List<DeathAnniversaryDTO>> listAnniversaries(
        @PathVariable String slug,
        @RequestParam(name = "lunarMonth", required = false) Integer lunarMonth
    ) {
        LOG.debug("GET anniversaries tree={} lunarMonth={}", slug, lunarMonth);
        if (treeGenealogyService.findTree(slug).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(treeGenealogyService.listAnniversaries(slug, lunarMonth));
    }

    @PostMapping("/persons")
    @RequiresPermission("genealogy:person:write")
    public ResponseEntity<PersonDTO> createPerson(
        @PathVariable String slug,
        @Valid @RequestBody PersonDTO personDTO,
        @RequestParam(name = "parentCode", required = false) String parentCode,
        @RequestParam(name = "spouse", required = false, defaultValue = "false") boolean spouse
    ) throws URISyntaxException {
        LOG.debug("POST person tree={} parent={} spouse={}", slug, parentCode, spouse);
        if (personDTO.getId() != null) {
            throw new BadRequestAlertException("A new person cannot already have an ID", "person", "idexists");
        }
        try {
            PersonDTO created = treeGenealogyService.createPerson(slug, personDTO, parentCode, spouse);
            return ResponseEntity.created(new URI("/api/v1/trees/" + slug + "/persons/" + created.getCode())).body(created);
        } catch (TreeNotFoundException e) {
            throw new BadRequestAlertException(e.getMessage(), "familyTree", "notfound");
        } catch (DuplicatePersonCodeException e) {
            throw new BadRequestAlertException(e.getMessage(), "person", "codeduplicate");
        } catch (PersonCodeNotFoundException e) {
            throw new BadRequestAlertException(e.getMessage(), "person", "parentnotfound");
        }
    }

    @PutMapping("/persons/{code}")
    @RequiresPermission("genealogy:person:write")
    public ResponseEntity<PersonDTO> updatePerson(
        @PathVariable String slug,
        @PathVariable String code,
        @Valid @RequestBody PersonDTO personDTO
    ) {
        LOG.debug("PUT person tree={} code={}", slug, code);
        try {
            return ResponseEntity.ok(treeGenealogyService.updatePerson(slug, code, personDTO));
        } catch (TreeNotFoundException e) {
            throw new BadRequestAlertException(e.getMessage(), "familyTree", "notfound");
        } catch (PersonCodeNotFoundException e) {
            throw new BadRequestAlertException(e.getMessage(), "person", "notfound");
        }
    }

    @PostMapping("/unions")
    @RequiresPermission("genealogy:union:write")
    public ResponseEntity<FamilyUnionDTO> createUnion(@PathVariable String slug, @Valid @RequestBody FamilyUnionDTO unionDTO)
        throws URISyntaxException {
        LOG.debug("POST union tree={}", slug);
        if (unionDTO.getId() != null) {
            throw new BadRequestAlertException("A new union cannot already have an ID", "familyUnion", "idexists");
        }
        try {
            FamilyUnionDTO created = treeGenealogyService.createUnion(slug, unionDTO);
            return ResponseEntity.created(new URI("/api/v1/trees/" + slug + "/unions/" + created.getId())).body(created);
        } catch (TreeNotFoundException e) {
            throw new BadRequestAlertException(e.getMessage(), "familyTree", "notfound");
        }
    }

    /** Quan hệ / xưng hô giữa 2 mã hiệu — F2 / R2.5. */
    @GetMapping("/kinship")
    public KinshipResult kinship(
        @PathVariable String slug,
        @RequestParam("from") String from,
        @RequestParam("to") String to
    ) {
        try {
            return kinshipService.relate(slug, from, to);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "kinship", "invalid");
        }
    }

    /** Quan hệ với hồ sơ đã liên kết tài khoản hiện tại. */
    @GetMapping("/kinship/me")
    public KinshipResult kinshipMe(@PathVariable String slug, @RequestParam("to") String to) {
        try {
            return kinshipService.relateToMe(slug, to);
        } catch (IllegalArgumentException e) {
            throw new BadRequestAlertException(e.getMessage(), "kinship", "invalid");
        }
    }
}
