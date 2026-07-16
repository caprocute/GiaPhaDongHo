package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class DonationCampaignDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(DonationCampaignDTO.class);
        DonationCampaignDTO donationCampaignDTO1 = new DonationCampaignDTO();
        donationCampaignDTO1.setId(1L);
        DonationCampaignDTO donationCampaignDTO2 = new DonationCampaignDTO();
        assertThat(donationCampaignDTO1).isNotEqualTo(donationCampaignDTO2);
        donationCampaignDTO2.setId(donationCampaignDTO1.getId());
        assertThat(donationCampaignDTO1).isEqualTo(donationCampaignDTO2);
        donationCampaignDTO2.setId(2L);
        assertThat(donationCampaignDTO1).isNotEqualTo(donationCampaignDTO2);
        donationCampaignDTO1.setId(null);
        assertThat(donationCampaignDTO1).isNotEqualTo(donationCampaignDTO2);
    }
}
