package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.ChangeRequestTestSamples.*;
import static vn.giapha.domain.FamilyTreeTestSamples.*;
import static vn.giapha.domain.PersonTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class ChangeRequestTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ChangeRequest.class);
        ChangeRequest changeRequest1 = getChangeRequestSample1();
        ChangeRequest changeRequest2 = new ChangeRequest();
        assertThat(changeRequest1).isNotEqualTo(changeRequest2);

        changeRequest2.setId(changeRequest1.getId());
        assertThat(changeRequest1).isEqualTo(changeRequest2);

        changeRequest2 = getChangeRequestSample2();
        assertThat(changeRequest1).isNotEqualTo(changeRequest2);
    }

    @Test
    void treeTest() {
        ChangeRequest changeRequest = getChangeRequestRandomSampleGenerator();
        FamilyTree familyTreeBack = getFamilyTreeRandomSampleGenerator();

        changeRequest.setTree(familyTreeBack);
        assertThat(changeRequest.getTree()).isEqualTo(familyTreeBack);

        changeRequest.tree(null);
        assertThat(changeRequest.getTree()).isNull();
    }

    @Test
    void personTest() {
        ChangeRequest changeRequest = getChangeRequestRandomSampleGenerator();
        Person personBack = getPersonRandomSampleGenerator();

        changeRequest.setPerson(personBack);
        assertThat(changeRequest.getPerson()).isEqualTo(personBack);

        changeRequest.person(null);
        assertThat(changeRequest.getPerson()).isNull();
    }
}
