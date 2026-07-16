package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class CmsCategoryDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(CmsCategoryDTO.class);
        CmsCategoryDTO cmsCategoryDTO1 = new CmsCategoryDTO();
        cmsCategoryDTO1.setId(1L);
        CmsCategoryDTO cmsCategoryDTO2 = new CmsCategoryDTO();
        assertThat(cmsCategoryDTO1).isNotEqualTo(cmsCategoryDTO2);
        cmsCategoryDTO2.setId(cmsCategoryDTO1.getId());
        assertThat(cmsCategoryDTO1).isEqualTo(cmsCategoryDTO2);
        cmsCategoryDTO2.setId(2L);
        assertThat(cmsCategoryDTO1).isNotEqualTo(cmsCategoryDTO2);
        cmsCategoryDTO1.setId(null);
        assertThat(cmsCategoryDTO1).isNotEqualTo(cmsCategoryDTO2);
    }
}
