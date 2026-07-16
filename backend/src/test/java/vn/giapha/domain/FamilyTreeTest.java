package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.FamilyTreeTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class FamilyTreeTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(FamilyTree.class);
        FamilyTree familyTree1 = getFamilyTreeSample1();
        FamilyTree familyTree2 = new FamilyTree();
        assertThat(familyTree1).isNotEqualTo(familyTree2);

        familyTree2.setId(familyTree1.getId());
        assertThat(familyTree1).isEqualTo(familyTree2);

        familyTree2 = getFamilyTreeSample2();
        assertThat(familyTree1).isNotEqualTo(familyTree2);
    }
}
