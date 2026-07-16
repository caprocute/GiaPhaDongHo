package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.FamilyTree;
import vn.giapha.service.dto.FamilyTreeDTO;

/**
 * Mapper for the entity {@link FamilyTree} and its DTO {@link FamilyTreeDTO}.
 */
@Mapper(componentModel = "spring")
public interface FamilyTreeMapper extends EntityMapper<FamilyTreeDTO, FamilyTree> {}
