package vn.giapha.service.mapper;

import static vn.giapha.domain.DonationContributionAsserts.*;
import static vn.giapha.domain.DonationContributionTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DonationContributionMapperTest {

    private DonationContributionMapper donationContributionMapper;

    @BeforeEach
    void setUp() {
        donationContributionMapper = new DonationContributionMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getDonationContributionSample1();
        var actual = donationContributionMapper.toEntity(donationContributionMapper.toDto(expected));
        assertDonationContributionAllPropertiesEquals(expected, actual);
    }
}
