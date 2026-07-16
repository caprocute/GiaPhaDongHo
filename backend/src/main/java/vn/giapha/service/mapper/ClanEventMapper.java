package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.ClanEvent;
import vn.giapha.domain.FamilyTree;
import vn.giapha.service.dto.ClanEventDTO;
import vn.giapha.service.dto.FamilyTreeDTO;

/**
 * Mapper for the entity {@link ClanEvent} and its DTO {@link ClanEventDTO}.
 */
@Mapper(componentModel = "spring")
public interface ClanEventMapper extends EntityMapper<ClanEventDTO, ClanEvent> {
    @Mapping(target = "tree", source = "tree", qualifiedByName = "familyTreeSlug")
    ClanEventDTO toDto(ClanEvent s);

    @Named("familyTreeSlug")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "slug", source = "slug")
    FamilyTreeDTO toDtoFamilyTreeSlug(FamilyTree familyTree);
}
