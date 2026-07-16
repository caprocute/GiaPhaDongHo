package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.MediaAlbum;
import vn.giapha.service.dto.MediaAlbumDTO;

/**
 * Mapper for the entity {@link MediaAlbum} and its DTO {@link MediaAlbumDTO}.
 */
@Mapper(componentModel = "spring")
public interface MediaAlbumMapper extends EntityMapper<MediaAlbumDTO, MediaAlbum> {}
