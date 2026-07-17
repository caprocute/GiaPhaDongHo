package vn.giapha.genealogy.internal.kinship;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VietnameseHonorificsUnitTest {

    @Test
    void labelsByGeneration() {
        assertThat(VietnameseHonorifics.relationLabel(0, "M")).contains("cùng đời");
        assertThat(VietnameseHonorifics.addressFromTo(1, "F", true)).isEqualTo("cháu");
        assertThat(VietnameseHonorifics.addressFromTo(-2, "M", true)).contains("ông");
    }
}
