package vn.giapha.service.mapper;

import static vn.giapha.domain.CmsPostAsserts.*;
import static vn.giapha.domain.CmsPostTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CmsPostMapperTest {

    private CmsPostMapper cmsPostMapper;

    @BeforeEach
    void setUp() {
        cmsPostMapper = new CmsPostMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCmsPostSample1();
        var actual = cmsPostMapper.toEntity(cmsPostMapper.toDto(expected));
        assertCmsPostAllPropertiesEquals(expected, actual);
    }
}
