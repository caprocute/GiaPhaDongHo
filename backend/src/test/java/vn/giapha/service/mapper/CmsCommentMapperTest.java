package vn.giapha.service.mapper;

import static vn.giapha.domain.CmsCommentAsserts.*;
import static vn.giapha.domain.CmsCommentTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CmsCommentMapperTest {

    private CmsCommentMapper cmsCommentMapper;

    @BeforeEach
    void setUp() {
        cmsCommentMapper = new CmsCommentMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCmsCommentSample1();
        var actual = cmsCommentMapper.toEntity(cmsCommentMapper.toDto(expected));
        assertCmsCommentAllPropertiesEquals(expected, actual);
    }
}
