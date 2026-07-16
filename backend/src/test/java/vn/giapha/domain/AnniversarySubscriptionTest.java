package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.AnniversarySubscriptionTestSamples.*;
import static vn.giapha.domain.PersonTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class AnniversarySubscriptionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(AnniversarySubscription.class);
        AnniversarySubscription anniversarySubscription1 = getAnniversarySubscriptionSample1();
        AnniversarySubscription anniversarySubscription2 = new AnniversarySubscription();
        assertThat(anniversarySubscription1).isNotEqualTo(anniversarySubscription2);

        anniversarySubscription2.setId(anniversarySubscription1.getId());
        assertThat(anniversarySubscription1).isEqualTo(anniversarySubscription2);

        anniversarySubscription2 = getAnniversarySubscriptionSample2();
        assertThat(anniversarySubscription1).isNotEqualTo(anniversarySubscription2);
    }

    @Test
    void personTest() {
        AnniversarySubscription anniversarySubscription = getAnniversarySubscriptionRandomSampleGenerator();
        Person personBack = getPersonRandomSampleGenerator();

        anniversarySubscription.setPerson(personBack);
        assertThat(anniversarySubscription.getPerson()).isEqualTo(personBack);

        anniversarySubscription.person(null);
        assertThat(anniversarySubscription.getPerson()).isNull();
    }
}
