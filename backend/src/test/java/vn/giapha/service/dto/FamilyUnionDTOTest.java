package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class FamilyUnionDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(FamilyUnionDTO.class);
        FamilyUnionDTO familyUnionDTO1 = new FamilyUnionDTO();
        familyUnionDTO1.setId(1L);
        FamilyUnionDTO familyUnionDTO2 = new FamilyUnionDTO();
        assertThat(familyUnionDTO1).isNotEqualTo(familyUnionDTO2);
        familyUnionDTO2.setId(familyUnionDTO1.getId());
        assertThat(familyUnionDTO1).isEqualTo(familyUnionDTO2);
        familyUnionDTO2.setId(2L);
        assertThat(familyUnionDTO1).isNotEqualTo(familyUnionDTO2);
        familyUnionDTO1.setId(null);
        assertThat(familyUnionDTO1).isNotEqualTo(familyUnionDTO2);
    }
}
