package vn.giapha.service.mapper;

import static vn.giapha.domain.ChangeRequestAsserts.*;
import static vn.giapha.domain.ChangeRequestTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ChangeRequestMapperTest {

    private ChangeRequestMapper changeRequestMapper;

    @BeforeEach
    void setUp() {
        changeRequestMapper = new ChangeRequestMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getChangeRequestSample1();
        var actual = changeRequestMapper.toEntity(changeRequestMapper.toDto(expected));
        assertChangeRequestAllPropertiesEquals(expected, actual);
    }
}
