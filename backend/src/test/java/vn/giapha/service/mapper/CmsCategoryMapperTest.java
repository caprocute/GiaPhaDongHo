package vn.giapha.service.mapper;

import static vn.giapha.domain.CmsCategoryAsserts.*;
import static vn.giapha.domain.CmsCategoryTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CmsCategoryMapperTest {

    private CmsCategoryMapper cmsCategoryMapper;

    @BeforeEach
    void setUp() {
        cmsCategoryMapper = new CmsCategoryMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getCmsCategorySample1();
        var actual = cmsCategoryMapper.toEntity(cmsCategoryMapper.toDto(expected));
        assertCmsCategoryAllPropertiesEquals(expected, actual);
    }
}
