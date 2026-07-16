package vn.giapha.service.mapper;

import static vn.giapha.domain.DeathAnniversaryAsserts.*;
import static vn.giapha.domain.DeathAnniversaryTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DeathAnniversaryMapperTest {

    private DeathAnniversaryMapper deathAnniversaryMapper;

    @BeforeEach
    void setUp() {
        deathAnniversaryMapper = new DeathAnniversaryMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getDeathAnniversarySample1();
        var actual = deathAnniversaryMapper.toEntity(deathAnniversaryMapper.toDto(expected));
        assertDeathAnniversaryAllPropertiesEquals(expected, actual);
    }
}
