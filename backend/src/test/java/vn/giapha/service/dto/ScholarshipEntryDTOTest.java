package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class ScholarshipEntryDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(ScholarshipEntryDTO.class);
        ScholarshipEntryDTO scholarshipEntryDTO1 = new ScholarshipEntryDTO();
        scholarshipEntryDTO1.setId(1L);
        ScholarshipEntryDTO scholarshipEntryDTO2 = new ScholarshipEntryDTO();
        assertThat(scholarshipEntryDTO1).isNotEqualTo(scholarshipEntryDTO2);
        scholarshipEntryDTO2.setId(scholarshipEntryDTO1.getId());
        assertThat(scholarshipEntryDTO1).isEqualTo(scholarshipEntryDTO2);
        scholarshipEntryDTO2.setId(2L);
        assertThat(scholarshipEntryDTO1).isNotEqualTo(scholarshipEntryDTO2);
        scholarshipEntryDTO1.setId(null);
        assertThat(scholarshipEntryDTO1).isNotEqualTo(scholarshipEntryDTO2);
    }
}
