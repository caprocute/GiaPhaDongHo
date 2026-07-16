package vn.giapha.service.mapper;

import static vn.giapha.domain.ClanEventAsserts.*;
import static vn.giapha.domain.ClanEventTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ClanEventMapperTest {

    private ClanEventMapper clanEventMapper;

    @BeforeEach
    void setUp() {
        clanEventMapper = new ClanEventMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getClanEventSample1();
        var actual = clanEventMapper.toEntity(clanEventMapper.toDto(expected));
        assertClanEventAllPropertiesEquals(expected, actual);
    }
}
