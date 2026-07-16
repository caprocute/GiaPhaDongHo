package vn.giapha.domain;

import static org.assertj.core.api.Assertions.assertThat;
import static vn.giapha.domain.ChapterTestSamples.*;
import static vn.giapha.domain.FamilyTreeTestSamples.*;

import org.junit.jupiter.api.Test;
import vn.giapha.web.rest.TestUtil;

class ChapterTest {

    @Test
    void equalsVerifier() throws Exception {
        TestUtil.equalsVerifier(Chapter.class);
        Chapter chapter1 = getChapterSample1();
        Chapter chapter2 = new Chapter();
        assertThat(chapter1).isNotEqualTo(chapter2);

        chapter2.setId(chapter1.getId());
        assertThat(chapter1).isEqualTo(chapter2);

        chapter2 = getChapterSample2();
        assertThat(chapter1).isNotEqualTo(chapter2);
    }

    @Test
    void treeTest() {
        Chapter chapter = getChapterRandomSampleGenerator();
        FamilyTree familyTreeBack = getFamilyTreeRandomSampleGenerator();

        chapter.setTree(familyTreeBack);
        assertThat(chapter.getTree()).isEqualTo(familyTreeBack);

        chapter.tree(null);
        assertThat(chapter.getTree()).isNull();
    }
}
