package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.CmsCategory;
import vn.giapha.service.dto.CmsCategoryDTO;

/**
 * Mapper for the entity {@link CmsCategory} and its DTO {@link CmsCategoryDTO}.
 */
@Mapper(componentModel = "spring")
public interface CmsCategoryMapper extends EntityMapper<CmsCategoryDTO, CmsCategory> {}
