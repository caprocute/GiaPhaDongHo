package vn.giapha.search.internal;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;

class VietnameseTextNormalizerUnitTest {

    @Test
    void foldsVietnameseAccentsAndD() {
        assertThat(VietnameseTextNormalizer.fold("Hoàng Văn Thành")).isEqualTo("hoang van thanh");
        assertThat(VietnameseTextNormalizer.fold("Đặng")).isEqualTo("dang");
        assertThat(VietnameseTextNormalizer.fold("A7-sp1")).isEqualTo("a7-sp1");
    }

    @Test
    void blankSafe() {
        assertThat(VietnameseTextNormalizer.fold(null)).isEmpty();
        assertThat(VietnameseTextNormalizer.fold("   ")).isEmpty();
    }
}
