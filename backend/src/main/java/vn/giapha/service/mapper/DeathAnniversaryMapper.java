package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.DeathAnniversary;
import vn.giapha.domain.FamilyTree;
import vn.giapha.domain.Person;
import vn.giapha.service.dto.DeathAnniversaryDTO;
import vn.giapha.service.dto.FamilyTreeDTO;
import vn.giapha.service.dto.PersonDTO;

/**
 * Mapper for the entity {@link DeathAnniversary} and its DTO {@link DeathAnniversaryDTO}.
 */
@Mapper(componentModel = "spring")
public interface DeathAnniversaryMapper extends EntityMapper<DeathAnniversaryDTO, DeathAnniversary> {
    @Mapping(target = "tree", source = "tree", qualifiedByName = "familyTreeSlug")
    @Mapping(target = "person", source = "person", qualifiedByName = "personFullName")
    DeathAnniversaryDTO toDto(DeathAnniversary s);

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
