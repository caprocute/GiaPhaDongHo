package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class CmsPostDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(CmsPostDTO.class);
        CmsPostDTO cmsPostDTO1 = new CmsPostDTO();
        cmsPostDTO1.setId(1L);
        CmsPostDTO cmsPostDTO2 = new CmsPostDTO();
        assertThat(cmsPostDTO1).isNotEqualTo(cmsPostDTO2);
        cmsPostDTO2.setId(cmsPostDTO1.getId());
        assertThat(cmsPostDTO1).isEqualTo(cmsPostDTO2);
        cmsPostDTO2.setId(2L);
        assertThat(cmsPostDTO1).isNotEqualTo(cmsPostDTO2);
        cmsPostDTO1.setId(null);
        assertThat(cmsPostDTO1).isNotEqualTo(cmsPostDTO2);
    }
}
