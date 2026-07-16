package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.AnniversarySubscription;
import vn.giapha.domain.Person;
import vn.giapha.service.dto.AnniversarySubscriptionDTO;
import vn.giapha.service.dto.PersonDTO;

/**
 * Mapper for the entity {@link AnniversarySubscription} and its DTO {@link AnniversarySubscriptionDTO}.
 */
@Mapper(componentModel = "spring")
public interface AnniversarySubscriptionMapper extends EntityMapper<AnniversarySubscriptionDTO, AnniversarySubscription> {
    @Mapping(target = "person", source = "person", qualifiedByName = "personFullName")
    AnniversarySubscriptionDTO toDto(AnniversarySubscription s);

    @Named("personFullName")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "fullName", source = "fullName")
    PersonDTO toDtoPersonFullName(Person person);
}
