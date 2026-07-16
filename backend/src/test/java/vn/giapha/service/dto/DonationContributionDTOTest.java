package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class DonationContributionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(DonationContributionDTO.class);
        DonationContributionDTO donationContributionDTO1 = new DonationContributionDTO();
        donationContributionDTO1.setId(1L);
        DonationContributionDTO donationContributionDTO2 = new DonationContributionDTO();
        assertThat(donationContributionDTO1).isNotEqualTo(donationContributionDTO2);
        donationContributionDTO2.setId(donationContributionDTO1.getId());
        assertThat(donationContributionDTO1).isEqualTo(donationContributionDTO2);
        donationContributionDTO2.setId(2L);
        assertThat(donationContributionDTO1).isNotEqualTo(donationContributionDTO2);
        donationContributionDTO1.setId(null);
        assertThat(donationContributionDTO1).isNotEqualTo(donationContributionDTO2);
    }
}
