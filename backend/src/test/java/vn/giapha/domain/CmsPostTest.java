package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.CmsCategoryTestSamples.*;
import static vn.giapha.domain.CmsPostTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class CmsPostTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CmsPost.class);
        CmsPost cmsPost1 = getCmsPostSample1();
        CmsPost cmsPost2 = new CmsPost();
        assertThat(cmsPost1).isNotEqualTo(cmsPost2);

        cmsPost2.setId(cmsPost1.getId());
        assertThat(cmsPost1).isEqualTo(cmsPost2);

        cmsPost2 = getCmsPostSample2();
        assertThat(cmsPost1).isNotEqualTo(cmsPost2);
    }

    @Test
    void categoryTest() {
        CmsPost cmsPost = getCmsPostRandomSampleGenerator();
        CmsCategory cmsCategoryBack = getCmsCategoryRandomSampleGenerator();

        cmsPost.setCategory(cmsCategoryBack);
        assertThat(cmsPost.getCategory()).isEqualTo(cmsCategoryBack);

        cmsPost.category(null);
        assertThat(cmsPost.getCategory()).isNull();
    }
}
