package vn.giapha.service.mapper;

import org.mapstruct.*;
import vn.giapha.domain.MediaAlbum;
import vn.giapha.domain.MediaPhoto;
import vn.giapha.service.dto.MediaAlbumDTO;
import vn.giapha.service.dto.MediaPhotoDTO;

/**
 * Mapper for the entity {@link MediaPhoto} and its DTO {@link MediaPhotoDTO}.
 */
@Mapper(componentModel = "spring")
public interface MediaPhotoMapper extends EntityMapper<MediaPhotoDTO, MediaPhoto> {
    @Mapping(target = "album", source = "album", qualifiedByName = "mediaAlbumTitle")
    MediaPhotoDTO toDto(MediaPhoto s);

    @Named("mediaAlbumTitle")
    @BeanMapping(ignoreByDefault = true)
    @Mapping(target = "id", source = "id")
    @Mapping(target = "title", source = "title")
    MediaAlbumDTO toDtoMediaAlbumTitle(MediaAlbum mediaAlbum);
}
