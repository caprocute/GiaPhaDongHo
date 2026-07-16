package vn.giapha.service.mapper;

import static vn.giapha.domain.ChapterAsserts.*;
import static vn.giapha.domain.ChapterTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ChapterMapperTest {

    private ChapterMapper chapterMapper;

    @BeforeEach
    void setUp() {
        chapterMapper = new ChapterMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getChapterSample1();
        var actual = chapterMapper.toEntity(chapterMapper.toDto(expected));
        assertChapterAllPropertiesEquals(expected, actual);
    }
}
