package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.CmsCategoryTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class CmsCategoryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(CmsCategory.class);
        CmsCategory cmsCategory1 = getCmsCategorySample1();
        CmsCategory cmsCategory2 = new CmsCategory();
        assertThat(cmsCategory1).isNotEqualTo(cmsCategory2);

        cmsCategory2.setId(cmsCategory1.getId());
        assertThat(cmsCategory1).isEqualTo(cmsCategory2);

        cmsCategory2 = getCmsCategorySample2();
        assertThat(cmsCategory1).isNotEqualTo(cmsCategory2);
    }
}
