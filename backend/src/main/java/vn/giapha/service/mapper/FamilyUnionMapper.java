package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.FamilyUnion;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.dto.FamilyUnionDTO;

/**
 * Mapper for the entity {@link FamilyUnion} and its DTO {@link FamilyUnionDTO}.
 */
@Mapper(componentModel = "spring")
public interface FamilyUnionMapper extends EntityMapper<FamilyUnionDTO, FamilyUnion> {
    @Mapping(target = "tree", source = "tree", qualifiedByName = "familyTreeSlug")
    FamilyUnionDTO toDto(FamilyUnion s);

    @Named("familyTreeSlug")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "slug", source = "slug")
    FamilyTreeDTO toDtoFamilyTreeSlug(FamilyTree familyTree);
}
