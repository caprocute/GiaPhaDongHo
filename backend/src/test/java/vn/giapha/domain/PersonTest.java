package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.FamilyTreeTestSamples.*;
import static vn.giapha.domain.PersonTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class PersonTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Person.class);
        Person person1 = getPersonSample1();
        Person person2 = new Person();
        assertThat(person1).isNotEqualTo(person2);

        person2.setId(person1.getId());
        assertThat(person1).isEqualTo(person2);

        person2 = getPersonSample2();
        assertThat(person1).isNotEqualTo(person2);
    }

    @Test
    void treeTest() {
        Person person = getPersonRandomSampleGenerator();
        FamilyTree familyTreeBack = getFamilyTreeRandomSampleGenerator();

        person.setTree(familyTreeBack);
        assertThat(person.getTree()).isEqualTo(familyTreeBack);

        person.tree(null);
        assertThat(person.getTree()).isNull();
    }
}
