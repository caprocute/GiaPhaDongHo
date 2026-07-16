package vn.giapha.genealogy.api;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import java.util.Set;
import org.junit.jupiter.api.Test;

class PersonCodeGeneratorUnitTest {

    @Test
    void nextLineageStartsAtA1() {
        assertThat(PersonCodeGenerator.nextLineageCode(List.of())).isEqualTo("A1");
    }

    @Test
    void nextLineageIncrementsMax() {
        assertThat(PersonCodeGenerator.nextLineageCode(Set.of("A1", "A7", "A7-sp1", "B2"))).isEqualTo("A8");
    }

    @Test
    void nextSpouseCode() {
        assertThat(PersonCodeGenerator.nextSpouseCode("A7", Set.of("A7", "A7-sp1"))).isEqualTo("A7-sp2");
        assertThat(PersonCodeGenerator.nextSpouseCode("A7", Set.of("A7"))).isEqualTo("A7-sp1");
    }

    @Test
    void appendLineagePath() {
        assertThat(PersonCodeGenerator.appendLineagePath(null, "A1")).isEqualTo("A1");
        assertThat(PersonCodeGenerator.appendLineagePath("A1.A3", "A7")).isEqualTo("A1.A3.A7");
    }
}
