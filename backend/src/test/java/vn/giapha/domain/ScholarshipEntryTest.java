package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.FamilyTreeTestSamples.*;
import static vn.giapha.domain.ScholarshipEntryTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class ScholarshipEntryTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(ScholarshipEntry.class);
        ScholarshipEntry scholarshipEntry1 = getScholarshipEntrySample1();
        ScholarshipEntry scholarshipEntry2 = new ScholarshipEntry();
        assertThat(scholarshipEntry1).isNotEqualTo(scholarshipEntry2);

        scholarshipEntry2.setId(scholarshipEntry1.getId());
        assertThat(scholarshipEntry1).isEqualTo(scholarshipEntry2);

        scholarshipEntry2 = getScholarshipEntrySample2();
        assertThat(scholarshipEntry1).isNotEqualTo(scholarshipEntry2);
    }

    @Test
    void treeTest() {
        ScholarshipEntry scholarshipEntry = getScholarshipEntryRandomSampleGenerator();
        FamilyTree familyTreeBack = getFamilyTreeRandomSampleGenerator();

        scholarshipEntry.setTree(familyTreeBack);
        assertThat(scholarshipEntry.getTree()).isEqualTo(familyTreeBack);

        scholarshipEntry.tree(null);
        assertThat(scholarshipEntry.getTree()).isNull();
    }
}
