package vn.giapha.service.mapper;

import static vn.giapha.domain.DonationCampaignAsserts.*;
import static vn.giapha.domain.DonationCampaignTestSamples.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class DonationCampaignMapperTest {

    private DonationCampaignMapper donationCampaignMapper;

    @BeforeEach
    void setUp() {
        donationCampaignMapper = new DonationCampaignMapperImpl();
    }

    @Test
    void shouldConvertToDtoAndBack() {
        var expected = getDonationCampaignSample1();
        var actual = donationCampaignMapper.toEntity(donationCampaignMapper.toDto(expected));
        assertDonationCampaignAllPropertiesEquals(expected, actual);
    }
}
