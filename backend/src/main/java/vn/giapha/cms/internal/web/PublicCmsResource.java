package vn.giapha.cms.internal.web;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import tech.jhipster.web.util.PaginationUtil;
import tech.jhipster.web.util.ResponseUtil;
import vn.giapha.cms.internal.CmsPublicService;
import vn.giapha.service.dto.CmsCategoryDTO;
import vn.giapha.service.dto.CmsCommentDTO;
import vn.giapha.service.dto.CmsPostDTO;

/**
 * REST công khai CMS — TK-08 {@code /api/v1/posts}.
 */
@RestController
@RequestMapping("/api/v1")
public class PublicCmsResource {

    private static final Logger LOG = LoggerFactory.getLogger(PublicCmsResource.class);

    private final CmsPublicService cmsPublicService;

    public PublicCmsResource(CmsPublicService cmsPublicService) {
        this.cmsPublicService = cmsPublicService;
    }

    @GetMapping("/posts")
    public ResponseEntity<List<CmsPostDTO>> listPosts(
        @RequestParam(name = "category", required = false) String category,
        @RequestParam(name = "query", required = false) String query,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("GET published posts category={} query={}", category, query);
        Page<CmsPostDTO> page = cmsPublicService.listPublished(category, query, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/posts/{slug}")
    public ResponseEntity<CmsPostDTO> getPost(@PathVariable String slug) {
        LOG.debug("GET published post slug={}", slug);
        return ResponseUtil.wrapOrNotFound(cmsPublicService.getPublishedBySlug(slug));
    }

    @GetMapping("/posts/{slug}/comments")
    public ResponseEntity<List<CmsCommentDTO>> listComments(
        @PathVariable String slug,
        @org.springdoc.core.annotations.ParameterObject Pageable pageable
    ) {
        LOG.debug("GET approved comments post={}", slug);
        Page<CmsCommentDTO> page = cmsPublicService.listApprovedComments(slug, pageable);
        HttpHeaders headers = PaginationUtil.generatePaginationHttpHeaders(ServletUriComponentsBuilder.fromCurrentRequest(), page);
        return ResponseEntity.ok().headers(headers).body(page.getContent());
    }

    @GetMapping("/categories")
    public ResponseEntity<List<CmsCategoryDTO>> listCategories() {
        LOG.debug("GET categories");
        return ResponseEntity.ok(cmsPublicService.listCategories());
    }

    @GetMapping("/categories/{slug}")
    public ResponseEntity<CmsCategoryDTO> getCategory(@PathVariable String slug) {
        LOG.debug("GET category slug={}", slug);
        return ResponseUtil.wrapOrNotFound(cmsPublicService.getCategoryBySlug(slug));
    }
}
