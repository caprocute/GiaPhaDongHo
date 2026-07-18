package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.Person;
import vn.giapha.domain.ScholarshipEntry;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.dto.PersonDTO;
import vn.giapha.service.dto.ScholarshipEntryDTO;

/**
 * Mapper for the entity {@link ScholarshipEntry} and its DTO {@link ScholarshipEntryDTO}.
 */
@Mapper(componentModel = "spring")
public interface ScholarshipEntryMapper extends EntityMapper<ScholarshipEntryDTO, ScholarshipEntry> {
    @Mapping(target = "tree", source = "tree", qualifiedByName = "familyTreeSlug")
    @Mapping(target = "person", source = "person", qualifiedByName = "personIdCodeName")
    ScholarshipEntryDTO toDto(ScholarshipEntry s);

    @Named("familyTreeSlug")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "slug", source = "slug")
    FamilyTreeDTO toDtoFamilyTreeSlug(FamilyTree familyTree);

    @Named("personIdCodeName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "code", source = "code")
    @Mapping(target = "fullName", source = "fullName")
    PersonDTO toDtoPersonIdCodeName(Person person);
}
