package vn.giapha.cms.internal;

import java.util.List;
import java.util.Locale;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import vn.giapha.cms.api.CmsPostStatus;
import vn.giapha.repository.CmsCategoryRepository;
import vn.giapha.repository.CmsCommentRepository;
import vn.giapha.repository.CmsPostRepository;
import vn.giapha.service.dto.CmsCategoryDTO;
import vn.giapha.service.dto.CmsCommentDTO;
import vn.giapha.service.dto.CmsPostDTO;
import vn.giapha.service.mapper.CmsCategoryMapper;
import vn.giapha.service.mapper.CmsCommentMapper;
import vn.giapha.service.mapper.CmsPostMapper;

/**
 * Đọc CMS công khai — chỉ bài / comment đã duyệt.
 */
@Service
@Transactional(readOnly = true)
public class CmsPublicService {

    public static final String COMMENT_APPROVED = "approved";

    private final CmsPostRepository cmsPostRepository;
    private final CmsCategoryRepository cmsCategoryRepository;
    private final CmsCommentRepository cmsCommentRepository;
    private final CmsPostMapper cmsPostMapper;
    private final CmsCategoryMapper cmsCategoryMapper;
    private final CmsCommentMapper cmsCommentMapper;

    public CmsPublicService(
        CmsPostRepository cmsPostRepository,
        CmsCategoryRepository cmsCategoryRepository,
        CmsCommentRepository cmsCommentRepository,
        CmsPostMapper cmsPostMapper,
        CmsCategoryMapper cmsCategoryMapper,
        CmsCommentMapper cmsCommentMapper
    ) {
        this.cmsPostRepository = cmsPostRepository;
        this.cmsCategoryRepository = cmsCategoryRepository;
        this.cmsCommentRepository = cmsCommentRepository;
        this.cmsPostMapper = cmsPostMapper;
        this.cmsCategoryMapper = cmsCategoryMapper;
        this.cmsCommentMapper = cmsCommentMapper;
    }

    public Page<CmsPostDTO> listPublished(String categorySlug, String query, Pageable pageable) {
        return cmsPostRepository
            .searchByStatus(CmsPostStatus.PUBLISHED, blankToNull(categorySlug), blankToNullLower(query), pageable)
            .map(cmsPostMapper::toDto);
    }

    public Optional<CmsPostDTO> getPublishedBySlug(String slug) {
        return cmsPostRepository
            .findBySlug(slug)
            .filter(p -> CmsPostStatus.isPublished(p.getStatus()))
            .map(cmsPostMapper::toDto);
    }

    public List<CmsCategoryDTO> listCategories() {
        return cmsCategoryMapper.toDto(cmsCategoryRepository.findAll());
    }

    public Page<CmsCommentDTO> listApprovedComments(String postSlug, Pageable pageable) {
        return cmsCommentRepository
            .findApprovedByPostSlug(postSlug, COMMENT_APPROVED, pageable)
            .map(cmsCommentMapper::toDto);
    }

    private static String blankToNull(String value) {
        if (value == null) return null;
        String t = value.trim();
        return t.isEmpty() ? null : t;
    }

    private static String blankToNullLower(String value) {
        String t = blankToNull(value);
        return t == null ? null : t.toLowerCase(Locale.ROOT);
    }
}
