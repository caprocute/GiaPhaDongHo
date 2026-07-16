package vn.giapha.service.mapper;

import static vn.giapha.domain.EventRsvpAsserts.*;
import static vn.giapha.domain.EventRsvpTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class EventRsvpMapperTest {

    private EventRsvpMapper eventRsvpMapper;

    @BeforeEach
    void setUp() {
        eventRsvpMapper = new EventRsvpMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getEventRsvpSample1();
        var actual = eventRsvpMapper.toEntity(eventRsvpMapper.toDto(expected));
        assertEventRsvpAllPropertiesEquals(expected, actual);
    }
}
