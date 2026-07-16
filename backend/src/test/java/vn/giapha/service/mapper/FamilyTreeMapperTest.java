package vn.giapha.service.mapper;

import static vn.giapha.domain.FamilyTreeAsserts.*;
import static vn.giapha.domain.FamilyTreeTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class FamilyTreeMapperTest {

    private FamilyTreeMapper familyTreeMapper;

    @BeforeEach
    void setUp() {
        familyTreeMapper = new FamilyTreeMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getFamilyTreeSample1();
        var actual = familyTreeMapper.toEntity(familyTreeMapper.toDto(expected));
        assertFamilyTreeAllPropertiesEquals(expected, actual);
    }
}
