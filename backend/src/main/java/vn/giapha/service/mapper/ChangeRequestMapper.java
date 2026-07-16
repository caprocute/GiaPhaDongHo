package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.ChangeRequest;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.Person;
import vn.giapha.service.dto.ChangeRequestDTO;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.dto.PersonDTO;

/**
 * Mapper for the entity {@link ChangeRequest} and its DTO {@link ChangeRequestDTO}.
 */
@Mapper(componentModel = "spring")
public interface ChangeRequestMapper extends EntityMapper<ChangeRequestDTO, ChangeRequest> {
    @Mapping(target = "tree", source = "tree", qualifiedByName = "familyTreeSlug")
    @Mapping(target = "person", source = "person", qualifiedByName = "personFullName")
    ChangeRequestDTO toDto(ChangeRequest s);

    @Named("familyTreeSlug")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "slug", source = "slug")
    FamilyTreeDTO toDtoFamilyTreeSlug(FamilyTree familyTree);

    @Named("personFullName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "fullName", source = "fullName")
    PersonDTO toDtoPersonFullName(Person person);
}
