package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.CmsCategory;
import vn.giapha.domain.CmsPost;
import vn.giapha.service.dto.CmsCategoryDTO;
import vn.giapha.service.dto.CmsPostDTO;

/**
 * Mapper for the entity {@link CmsPost} and its DTO {@link CmsPostDTO}.
 */
@Mapper(componentModel = "spring")
public interface CmsPostMapper extends EntityMapper<CmsPostDTO, CmsPost> {
    @Mapping(target = "category", source = "category", qualifiedByName = "cmsCategoryName")
    CmsPostDTO toDto(CmsPost s);

    @Named("cmsCategoryName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "name", source = "name")
    CmsCategoryDTO toDtoCmsCategoryName(CmsCategory cmsCategory);
}
