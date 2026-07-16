package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.DonationCampaignTestSamples.*;
import static vn.giapha.domain.FamilyTreeTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class DonationCampaignTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DonationCampaign.class);
        DonationCampaign donationCampaign1 = getDonationCampaignSample1();
        DonationCampaign donationCampaign2 = new DonationCampaign();
        assertThat(donationCampaign1).isNotEqualTo(donationCampaign2);

        donationCampaign2.setId(donationCampaign1.getId());
        assertThat(donationCampaign1).isEqualTo(donationCampaign2);

        donationCampaign2 = getDonationCampaignSample2();
        assertThat(donationCampaign1).isNotEqualTo(donationCampaign2);
    }

    @Test
    void treeTest() {
        DonationCampaign donationCampaign = getDonationCampaignRandomSampleGenerator();
        FamilyTree familyTreeBack = getFamilyTreeRandomSampleGenerator();

        donationCampaign.setTree(familyTreeBack);
        assertThat(donationCampaign.getTree()).isEqualTo(familyTreeBack);

        donationCampaign.tree(null);
        assertThat(donationCampaign.getTree()).isNull();
    }
}
