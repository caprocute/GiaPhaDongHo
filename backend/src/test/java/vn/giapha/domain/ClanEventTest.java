package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.ClanEventTestSamples.*;
import static vn.giapha.domain.FamilyTreeTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class ClanEventTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ClanEvent.class);
        ClanEvent clanEvent1 = getClanEventSample1();
        ClanEvent clanEvent2 = new ClanEvent();
        assertThat(clanEvent1).isNotEqualTo(clanEvent2);

        clanEvent2.setId(clanEvent1.getId());
        assertThat(clanEvent1).isEqualTo(clanEvent2);

        clanEvent2 = getClanEventSample2();
        assertThat(clanEvent1).isNotEqualTo(clanEvent2);
    }

    @Test
    void treeTest() {
        ClanEvent clanEvent = getClanEventRandomSampleGenerator();
        FamilyTree familyTreeBack = getFamilyTreeRandomSampleGenerator();

        clanEvent.setTree(familyTreeBack);
        assertThat(clanEvent.getTree()).isEqualTo(familyTreeBack);

        clanEvent.tree(null);
        assertThat(clanEvent.getTree()).isNull();
    }
}
