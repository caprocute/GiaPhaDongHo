package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class FamilyTreeDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(FamilyTreeDTO.class);
        FamilyTreeDTO familyTreeDTO1 = new FamilyTreeDTO();
        familyTreeDTO1.setId(1L);
        FamilyTreeDTO familyTreeDTO2 = new FamilyTreeDTO();
        assertThat(familyTreeDTO1).isNotEqualTo(familyTreeDTO2);
        familyTreeDTO2.setId(familyTreeDTO1.getId());
        assertThat(familyTreeDTO1).isEqualTo(familyTreeDTO2);
        familyTreeDTO2.setId(2L);
        assertThat(familyTreeDTO1).isNotEqualTo(familyTreeDTO2);
        familyTreeDTO1.setId(null);
        assertThat(familyTreeDTO1).isNotEqualTo(familyTreeDTO2);
    }
}
