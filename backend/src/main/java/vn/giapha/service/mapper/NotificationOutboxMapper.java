package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.NotificationOutbox;
import vn.giapha.service.dto.NotificationOutboxDTO;

/**
 * Mapper for the entity {@link NotificationOutbox} and its DTO {@link NotificationOutboxDTO}.
 */
@Mapper(componentModel = "spring")
public interface NotificationOutboxMapper extends EntityMapper<NotificationOutboxDTO, NotificationOutbox> {}
