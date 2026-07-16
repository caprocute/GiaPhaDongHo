package vn.giapha.service.mapper;

import static vn.giapha.domain.AnniversarySubscriptionAsserts.*;
import static vn.giapha.domain.AnniversarySubscriptionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class AnniversarySubscriptionMapperTest {

    private AnniversarySubscriptionMapper anniversarySubscriptionMapper;

    @BeforeEach
    void setUp() {
        anniversarySubscriptionMapper = new AnniversarySubscriptionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getAnniversarySubscriptionSample1();
        var actual = anniversarySubscriptionMapper.toEntity(anniversarySubscriptionMapper.toDto(expected));
        assertAnniversarySubscriptionAllPropertiesEquals(expected, actual);
    }
}
