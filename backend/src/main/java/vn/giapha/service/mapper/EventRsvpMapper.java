package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.ClanEvent;
import vn.giapha.domain.EventRsvp;
import vn.giapha.service.dto.ClanEventDTO;
import vn.giapha.service.dto.EventRsvpDTO;

/**
 * Mapper for the entity {@link EventRsvp} and its DTO {@link EventRsvpDTO}.
 */
@Mapper(componentModel = "spring")
public interface EventRsvpMapper extends EntityMapper<EventRsvpDTO, EventRsvp> {
    @Mapping(target = "event", source = "event", qualifiedByName = "clanEventTitle")
    EventRsvpDTO toDto(EventRsvp s);

    @Named("clanEventTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    ClanEventDTO toDtoClanEventTitle(ClanEvent clanEvent);
}
