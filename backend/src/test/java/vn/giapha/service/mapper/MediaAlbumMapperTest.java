package vn.giapha.service.mapper;

import static vn.giapha.domain.MediaAlbumAsserts.*;
import static vn.giapha.domain.MediaAlbumTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MediaAlbumMapperTest {

    private MediaAlbumMapper mediaAlbumMapper;

    @BeforeEach
    void setUp() {
        mediaAlbumMapper = new MediaAlbumMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getMediaAlbumSample1();
        var actual = mediaAlbumMapper.toEntity(mediaAlbumMapper.toDto(expected));
        assertMediaAlbumAllPropertiesEquals(expected, actual);
    }
}
