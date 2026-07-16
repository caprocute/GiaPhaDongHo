package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.DeathAnniversaryTestSamples.*;
import static vn.giapha.domain.FamilyTreeTestSamples.*;
import static vn.giapha.domain.PersonTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class DeathAnniversaryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(DeathAnniversary.class);
        DeathAnniversary deathAnniversary1 = getDeathAnniversarySample1();
        DeathAnniversary deathAnniversary2 = new DeathAnniversary();
        assertThat(deathAnniversary1).isNotEqualTo(deathAnniversary2);

        deathAnniversary2.setId(deathAnniversary1.getId());
        assertThat(deathAnniversary1).isEqualTo(deathAnniversary2);

        deathAnniversary2 = getDeathAnniversarySample2();
        assertThat(deathAnniversary1).isNotEqualTo(deathAnniversary2);
    }

    @Test
    void treeTest() {
        DeathAnniversary deathAnniversary = getDeathAnniversaryRandomSampleGenerator();
        FamilyTree familyTreeBack = getFamilyTreeRandomSampleGenerator();

        deathAnniversary.setTree(familyTreeBack);
        assertThat(deathAnniversary.getTree()).isEqualTo(familyTreeBack);

        deathAnniversary.tree(null);
        assertThat(deathAnniversary.getTree()).isNull();
    }

    @Test
    void personTest() {
        DeathAnniversary deathAnniversary = getDeathAnniversaryRandomSampleGenerator();
        Person personBack = getPersonRandomSampleGenerator();

        deathAnniversary.setPerson(personBack);
        assertThat(deathAnniversary.getPerson()).isEqualTo(personBack);

        deathAnniversary.person(null);
        assertThat(deathAnniversary.getPerson()).isNull();
    }
}
