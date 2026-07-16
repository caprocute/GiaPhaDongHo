package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.CmsCommentTestSamples.*;
import static vn.giapha.domain.CmsPostTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class CmsCommentTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CmsComment.class);
        CmsComment cmsComment1 = getCmsCommentSample1();
        CmsComment cmsComment2 = new CmsComment();
        assertThat(cmsComment1).isNotEqualTo(cmsComment2);

        cmsComment2.setId(cmsComment1.getId());
        assertThat(cmsComment1).isEqualTo(cmsComment2);

        cmsComment2 = getCmsCommentSample2();
        assertThat(cmsComment1).isNotEqualTo(cmsComment2);
    }

    @Test
    void postTest() {
        CmsComment cmsComment = getCmsCommentRandomSampleGenerator();
        CmsPost cmsPostBack = getCmsPostRandomSampleGenerator();

        cmsComment.setPost(cmsPostBack);
        assertThat(cmsComment.getPost()).isEqualTo(cmsPostBack);

        cmsComment.post(null);
        assertThat(cmsComment.getPost()).isNull();
    }
}
