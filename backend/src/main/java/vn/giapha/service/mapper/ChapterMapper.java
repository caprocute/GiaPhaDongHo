package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.Chapter;
import vn.giapha.domain.FamilyTree;
import vn.giapha.service.dto.ChapterDTO;
import vn.giapha.service.dto.FamilyTreeDTO;

/**
 * Mapper for the entity {@link Chapter} and its DTO {@link ChapterDTO}.
 */
@Mapper(componentModel = "spring")
public interface ChapterMapper extends EntityMapper<ChapterDTO, Chapter> {
    @Mapping(target = "tree", source = "tree", qualifiedByName = "familyTreeSlug")
    ChapterDTO toDto(Chapter s);

    @Named("familyTreeSlug")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "slug", source = "slug")
    FamilyTreeDTO toDtoFamilyTreeSlug(FamilyTree familyTree);
}
