package vn.giapha.service.dto;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class CmsCommentDTOTest {

    @Test
    void dtoEqualsVerifier() throws Exception {
        TestUtil.equalsVerifier(CmsCommentDTO.class);
        CmsCommentDTO cmsCommentDTO1 = new CmsCommentDTO();
        cmsCommentDTO1.setId(1L);
        CmsCommentDTO cmsCommentDTO2 = new CmsCommentDTO();
        assertThat(cmsCommentDTO1).isNotEqualTo(cmsCommentDTO2);
        cmsCommentDTO2.setId(cmsCommentDTO1.getId());
        assertThat(cmsCommentDTO1).isEqualTo(cmsCommentDTO2);
        cmsCommentDTO2.setId(2L);
        assertThat(cmsCommentDTO1).isNotEqualTo(cmsCommentDTO2);
        cmsCommentDTO1.setId(null);
        assertThat(cmsCommentDTO1).isNotEqualTo(cmsCommentDTO2);
    }
}
