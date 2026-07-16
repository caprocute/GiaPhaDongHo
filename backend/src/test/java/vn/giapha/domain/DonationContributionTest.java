package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.DonationCampaignTestSamples.*;
import static vn.giapha.domain.DonationContributionTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class DonationContributionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DonationContribution.class);
        DonationContribution donationContribution1 = getDonationContributionSample1();
        DonationContribution donationContribution2 = new DonationContribution();
        assertThat(donationContribution1).isNotEqualTo(donationContribution2);

        donationContribution2.setId(donationContribution1.getId());
        assertThat(donationContribution1).isEqualTo(donationContribution2);

        donationContribution2 = getDonationContributionSample2();
        assertThat(donationContribution1).isNotEqualTo(donationContribution2);
    }

    @Test
    void campaignTest() {
        DonationContribution donationContribution = getDonationContributionRandomSampleGenerator();
        DonationCampaign donationCampaignBack = getDonationCampaignRandomSampleGenerator();

        donationContribution.setCampaign(donationCampaignBack);
        assertThat(donationContribution.getCampaign()).isEqualTo(donationCampaignBack);

        donationContribution.campaign(null);
        assertThat(donationContribution.getCampaign()).isNull();
    }
}
