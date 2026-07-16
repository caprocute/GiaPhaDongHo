package vn.giapha.service.mapper;

import static vn.giapha.domain.FamilyUnionAsserts.*;
import static vn.giapha.domain.FamilyUnionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FamilyUnionMapperTest {

    private FamilyUnionMapper familyUnionMapper;

    @BeforeEach
    void setUp() {
        familyUnionMapper = new FamilyUnionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getFamilyUnionSample1();
        var actual = familyUnionMapper.toEntity(familyUnionMapper.toDto(expected));
        assertFamilyUnionAllPropertiesEquals(expected, actual);
    }
}
