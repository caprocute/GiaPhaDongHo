package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.FamilyUnionTestSamples.*;
import static vn.giapha.domain.PersonTestSamples.*;
import static vn.giapha.domain.UnionMemberTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class UnionMemberTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(UnionMember.class);
        UnionMember unionMember1 = getUnionMemberSample1();
        UnionMember unionMember2 = new UnionMember();
        assertThat(unionMember1).isNotEqualTo(unionMember2);

        unionMember2.setId(unionMember1.getId());
        assertThat(unionMember1).isEqualTo(unionMember2);

        unionMember2 = getUnionMemberSample2();
        assertThat(unionMember1).isNotEqualTo(unionMember2);
    }

    @Test
    void unionTest() {
        UnionMember unionMember = getUnionMemberRandomSampleGenerator();
        FamilyUnion familyUnionBack = getFamilyUnionRandomSampleGenerator();

        unionMember.setUnion(familyUnionBack);
        assertThat(unionMember.getUnion()).isEqualTo(familyUnionBack);

        unionMember.union(null);
        assertThat(unionMember.getUnion()).isNull();
    }

    @Test
    void personTest() {
        UnionMember unionMember = getUnionMemberRandomSampleGenerator();
        Person personBack = getPersonRandomSampleGenerator();

        unionMember.setPerson(personBack);
        assertThat(unionMember.getPerson()).isEqualTo(personBack);

        unionMember.person(null);
        assertThat(unionMember.getPerson()).isNull();
    }
}
