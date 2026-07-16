package vn.giapha.service.mapper;

import static vn.giapha.domain.MediaPhotoAsserts.*;
import static vn.giapha.domain.MediaPhotoTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class MediaPhotoMapperTest {

    private MediaPhotoMapper mediaPhotoMapper;

    @BeforeEach
    void setUp() {
        mediaPhotoMapper = new MediaPhotoMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getMediaPhotoSample1();
        var actual = mediaPhotoMapper.toEntity(mediaPhotoMapper.toDto(expected));
        assertMediaPhotoAllPropertiesEquals(expected, actual);
    }
}
