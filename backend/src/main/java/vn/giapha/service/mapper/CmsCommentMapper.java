package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.CmsComment;
import vn.giapha.domain.CmsPost;
import vn.giapha.service.dto.CmsCommentDTO;
import vn.giapha.service.dto.CmsPostDTO;

/**
 * Mapper for the entity {@link CmsComment} and its DTO {@link CmsCommentDTO}.
 */
@Mapper(componentModel = "spring")
public interface CmsCommentMapper extends EntityMapper<CmsCommentDTO, CmsComment> {
    @Mapping(target = "post", source = "post", qualifiedByName = "cmsPostTitle")
    CmsCommentDTO toDto(CmsComment s);

    @Named("cmsPostTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    CmsPostDTO toDtoCmsPostTitle(CmsPost cmsPost);
}
