package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class AnniversarySubscriptionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(AnniversarySubscriptionDTO.class);
        AnniversarySubscriptionDTO anniversarySubscriptionDTO1 = new AnniversarySubscriptionDTO();
        anniversarySubscriptionDTO1.setId(1L);
        AnniversarySubscriptionDTO anniversarySubscriptionDTO2 = new AnniversarySubscriptionDTO();
        assertThat(anniversarySubscriptionDTO1).isNotEqualTo(anniversarySubscriptionDTO2);
        anniversarySubscriptionDTO2.setId(anniversarySubscriptionDTO1.getId());
        assertThat(anniversarySubscriptionDTO1).isEqualTo(anniversarySubscriptionDTO2);
        anniversarySubscriptionDTO2.setId(2L);
        assertThat(anniversarySubscriptionDTO1).isNotEqualTo(anniversarySubscriptionDTO2);
        anniversarySubscriptionDTO1.setId(null);
        assertThat(anniversarySubscriptionDTO1).isNotEqualTo(anniversarySubscriptionDTO2);
    }
}
