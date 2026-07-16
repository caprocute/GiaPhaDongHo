package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.Person;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.dto.PersonDTO;

/**
 * Mapper for the entity {@link Person} and its DTO {@link PersonDTO}.
 */
@Mapper(componentModel = "spring")
public interface PersonMapper extends EntityMapper<PersonDTO, Person> {
    @Mapping(target = "tree", source = "tree", qualifiedByName = "familyTreeSlug")
    PersonDTO toDto(Person s);

    @Named("familyTreeSlug")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "slug", source = "slug")
    FamilyTreeDTO toDtoFamilyTreeSlug(FamilyTree familyTree);
}
