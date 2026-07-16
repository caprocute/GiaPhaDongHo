package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.FamilyTreeTestSamples.*;
import static vn.giapha.domain.FamilyUnionTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class FamilyUnionTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FamilyUnion.class);
        FamilyUnion familyUnion1 = getFamilyUnionSample1();
        FamilyUnion familyUnion2 = new FamilyUnion();
        assertThat(familyUnion1).isNotEqualTo(familyUnion2);

        familyUnion2.setId(familyUnion1.getId());
        assertThat(familyUnion1).isEqualTo(familyUnion2);

        familyUnion2 = getFamilyUnionSample2();
        assertThat(familyUnion1).isNotEqualTo(familyUnion2);
    }

    @Test
    void treeTest() {
        FamilyUnion familyUnion = getFamilyUnionRandomSampleGenerator();
        FamilyTree familyTreeBack = getFamilyTreeRandomSampleGenerator();

        familyUnion.setTree(familyTreeBack);
        assertThat(familyUnion.getTree()).isEqualTo(familyTreeBack);

        familyUnion.tree(null);
        assertThat(familyUnion.getTree()).isNull();
    }
}
