package vn.giapha.service.mapper;

import static vn.giapha.domain.ScholarshipEntryAsserts.*;
import static vn.giapha.domain.ScholarshipEntryTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class ScholarshipEntryMapperTest {

    private ScholarshipEntryMapper scholarshipEntryMapper;

    @BeforeEach
    void setUp() {
        scholarshipEntryMapper = new ScholarshipEntryMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getScholarshipEntrySample1();
        var actual = scholarshipEntryMapper.toEntity(scholarshipEntryMapper.toDto(expected));
        assertScholarshipEntryAllPropertiesEquals(expected, actual);
    }
}
