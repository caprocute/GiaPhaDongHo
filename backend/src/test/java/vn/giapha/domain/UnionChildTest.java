package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.FamilyUnionTestSamples.*;
import static vn.giapha.domain.PersonTestSamples.*;
import static vn.giapha.domain.UnionChildTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class UnionChildTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UnionChild.class);
        UnionChild unionChild1 = getUnionChildSample1();
        UnionChild unionChild2 = new UnionChild();
        assertThat(unionChild1).isNotEqualTo(unionChild2);

        unionChild2.setId(unionChild1.getId());
        assertThat(unionChild1).isEqualTo(unionChild2);

        unionChild2 = getUnionChildSample2();
        assertThat(unionChild1).isNotEqualTo(unionChild2);
    }

    @Test
    void unionTest() {
        UnionChild unionChild = getUnionChildRandomSampleGenerator();
        FamilyUnion familyUnionBack = getFamilyUnionRandomSampleGenerator();

        unionChild.setUnion(familyUnionBack);
        assertThat(unionChild.getUnion()).isEqualTo(familyUnionBack);

        unionChild.union(null);
        assertThat(unionChild.getUnion()).isNull();
    }

    @Test
    void childTest() {
        UnionChild unionChild = getUnionChildRandomSampleGenerator();
        Person personBack = getPersonRandomSampleGenerator();

        unionChild.setChild(personBack);
        assertThat(unionChild.getChild()).isEqualTo(personBack);

        unionChild.child(null);
        assertThat(unionChild.getChild()).isNull();
    }
}
